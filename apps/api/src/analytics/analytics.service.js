"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AnalyticsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bridge_analytics_entity_1 = require("./entities/bridge-analytics.entity");
/**
 * Analytics Service
 *
 * Provides aggregated analytics data for bridge routes including:
 * - Transfer counts and success rates
 * - Settlement time statistics
 * - Fee and slippage metrics
 * - Time-series data for trends
 */
let AnalyticsService = AnalyticsService_1 = class AnalyticsService {
    constructor(analyticsRepository) {
        this.analyticsRepository = analyticsRepository;
        this.logger = new common_1.Logger(AnalyticsService_1.name);
    }
    /**
     * Get paginated analytics data with optional filters
     */
    async getAnalytics(query) {
        const where = {};
        if (query.bridgeName) {
            where.bridgeName = query.bridgeName;
        }
        if (query.sourceChain) {
            where.sourceChain = query.sourceChain;
        }
        if (query.destinationChain) {
            where.destinationChain = query.destinationChain;
        }
        if (query.token) {
            where.token = query.token;
        }
        if (query.startDate && query.endDate) {
            where.lastUpdated = (0, typeorm_2.Between)(new Date(query.startDate), new Date(query.endDate));
        }
        const [data, total] = await this.analyticsRepository.findAndCount({
            where,
            order: { totalTransfers: 'DESC' },
            skip: (query.page - 1) * query.limit,
            take: query.limit,
        });
        const routeAnalytics = data.map((entity) => this.mapToRouteAnalyticsDto(entity));
        return {
            data: routeAnalytics,
            total,
            page: query.page,
            limit: query.limit,
            totalPages: Math.ceil(total / query.limit),
            generatedAt: new Date(),
        };
    }
    /**
     * Get analytics for a specific route
     */
    async getRouteAnalytics(bridgeName, sourceChain, destinationChain, token) {
        const where = {
            bridgeName,
            sourceChain,
            destinationChain,
        };
        if (token) {
            where.token = token;
        }
        const entity = await this.analyticsRepository.findOne({ where });
        if (!entity) {
            return null;
        }
        return this.mapToRouteAnalyticsDto(entity);
    }
    /**
     * Get time-series analytics data for trend analysis
     */
    async getTimeSeriesAnalytics(bridgeName, sourceChain, destinationChain, granularity, startDate, endDate, token) {
        // Build the time bucket expression based on granularity
        let timeBucket;
        switch (granularity) {
            case 'hour':
                timeBucket = "DATE_TRUNC('hour', b.created_at)";
                break;
            case 'day':
                timeBucket = "DATE_TRUNC('day', b.created_at)";
                break;
            case 'week':
                timeBucket = "DATE_TRUNC('week', b.created_at)";
                break;
            case 'month':
                timeBucket = "DATE_TRUNC('month', b.created_at)";
                break;
        }
        // Query to get time-series data from bridge_benchmarks
        const query = `
      SELECT 
        ${timeBucket} as timestamp,
        COUNT(*) as transfers,
        COUNT(*) FILTER (WHERE b.status = 'confirmed') as successful_transfers,
        COUNT(*) FILTER (WHERE b.status = 'failed') as failed_transfers,
        AVG(b.duration_ms) FILTER (WHERE b.status = 'confirmed') as avg_settlement_time,
        AVG(b.amount) as avg_amount,
        SUM(b.amount) as total_volume
      FROM bridge_benchmarks b
      WHERE b.bridge_name = $1
        AND b.source_chain = $2
        AND b.destination_chain = $3
        ${token ? 'AND b.token = $4' : ''}
        AND b.created_at BETWEEN $${token ? 5 : 4} AND $${token ? 6 : 5}
      GROUP BY ${timeBucket}
      ORDER BY timestamp ASC
    `;
        const params = [bridgeName, sourceChain, destinationChain];
        if (token)
            params.push(token);
        params.push(startDate.toISOString(), endDate.toISOString());
        const rawData = await this.analyticsRepository.query(query, params);
        const data = rawData.map((row) => ({
            timestamp: new Date(row.timestamp),
            transfers: parseInt(row.transfers, 10),
            successfulTransfers: parseInt(row.successful_transfers, 10),
            failedTransfers: parseInt(row.failed_transfers, 10),
            averageSettlementTimeMs: row.avg_settlement_time
                ? parseFloat(row.avg_settlement_time)
                : undefined,
            averageFee: undefined, // Would need fee data from another source
            averageSlippagePercent: undefined, // Would need slippage data
            totalVolume: parseFloat(row.total_volume) || 0,
        }));
        return {
            bridgeName,
            sourceChain,
            destinationChain,
            token,
            granularity,
            data,
        };
    }
    /**
     * Get top performing bridges by different metrics
     */
    async getTopPerformingBridges(limit = 10) {
        const allAnalytics = await this.analyticsRepository.find();
        // By volume
        const byVolume = [...allAnalytics]
            .sort((a, b) => b.totalVolume - a.totalVolume)
            .slice(0, limit)
            .map((entity) => this.mapToRouteAnalyticsDto(entity));
        // By success rate (minimum 10 transfers for statistical significance)
        const bySuccessRate = [...allAnalytics]
            .filter((a) => a.totalTransfers >= 10)
            .sort((a, b) => b.successRate - a.successRate)
            .slice(0, limit)
            .map((entity) => this.mapToRouteAnalyticsDto(entity));
        // By speed (minimum 5 transfers for statistical significance)
        const bySpeed = [...allAnalytics]
            .filter((a) => a.totalTransfers >= 5 && a.averageSettlementTimeMs)
            .sort((a, b) => (a.averageSettlementTimeMs || Infinity) -
            (b.averageSettlementTimeMs || Infinity))
            .slice(0, limit)
            .map((entity) => this.mapToRouteAnalyticsDto(entity));
        return {
            byVolume,
            bySuccessRate,
            bySpeed,
            generatedAt: new Date(),
        };
    }
    /**
     * Get slippage statistics for a route
     */
    async getSlippageStatistics(bridgeName, sourceChain, destinationChain, token) {
        const where = {
            bridgeName,
            sourceChain,
            destinationChain,
        };
        if (token) {
            where.token = token;
        }
        const entity = await this.analyticsRepository.findOne({ where });
        if (!entity || !entity.averageSlippagePercent) {
            return null;
        }
        // Get distribution from raw data
        const query = `
      SELECT 
        CASE 
          WHEN slippage_percent < 0.1 THEN '0-0.1%'
          WHEN slippage_percent < 0.5 THEN '0.1-0.5%'
          WHEN slippage_percent < 1.0 THEN '0.5-1%'
          WHEN slippage_percent < 2.0 THEN '1-2%'
          WHEN slippage_percent < 5.0 THEN '2-5%'
          ELSE '5%+'
        END as range,
        COUNT(*) as count
      FROM bridge_benchmarks
      WHERE bridge_name = $1
        AND source_chain = $2
        AND destination_chain = $3
        ${token ? 'AND token = $4' : ''}
        AND slippage_percent IS NOT NULL
      GROUP BY 1
      ORDER BY MIN(slippage_percent)
    `;
        const params = [bridgeName, sourceChain, destinationChain];
        if (token)
            params.push(token);
        const distribution = await this.analyticsRepository.query(query, params);
        const totalCount = distribution.reduce((sum, d) => sum + parseInt(d.count, 10), 0);
        return {
            bridgeName,
            sourceChain,
            destinationChain,
            averageSlippagePercent: entity.averageSlippagePercent,
            minSlippagePercent: 0, // Would need to query raw data
            maxSlippagePercent: 0, // Would need to query raw data
            highSlippageCount: 0, // Would need threshold query
            highSlippagePercentage: 0,
            distribution: distribution.map((d) => ({
                range: d.range,
                count: parseInt(d.count, 10),
                percentage: totalCount > 0 ? (parseInt(d.count, 10) / totalCount) * 100 : 0,
            })),
        };
    }
    /**
     * Get user activity insights
     */
    async getUserActivityInsights() {
        // Aggregate statistics
        const stats = await this.analyticsRepository
            .createQueryBuilder('a')
            .select('SUM(a.totalTransfers)', 'totalTransfers')
            .addSelect('SUM(a.totalVolume)', 'totalVolume')
            .getRawOne();
        // Get most popular routes
        const popularRoutes = await this.analyticsRepository.find({
            order: { totalTransfers: 'DESC' },
            take: 5,
        });
        return {
            totalUniqueUsers: 0, // Would need user tracking
            totalTransfers: parseInt(stats?.totalTransfers || '0', 10),
            averageTransfersPerUser: 0, // Would need user tracking
            peakActivityPeriod: { hour: 0, transferCount: 0 }, // Would need hourly aggregation
            popularRoutes: popularRoutes.map((entity) => this.mapToRouteAnalyticsDto(entity)),
            generatedAt: new Date(),
        };
    }
    /**
     * Update analytics when a transfer completes
     */
    async updateAnalytics(payload) {
        const { route, settlementTimeMs, fee, slippagePercent, volume, status } = payload;
        // Find or create analytics record
        let analytics = await this.analyticsRepository.findOne({
            where: {
                bridgeName: route.bridgeName,
                sourceChain: route.sourceChain,
                destinationChain: route.destinationChain,
                token: route.token || null,
            },
        });
        if (!analytics) {
            analytics = this.analyticsRepository.create({
                bridgeName: route.bridgeName,
                sourceChain: route.sourceChain,
                destinationChain: route.destinationChain,
                token: route.token || null,
                totalTransfers: 0,
                successfulTransfers: 0,
                failedTransfers: 0,
                totalVolume: 0,
            });
        }
        // Update counters
        analytics.totalTransfers++;
        if (status === 'success') {
            analytics.successfulTransfers++;
        }
        else {
            analytics.failedTransfers++;
        }
        // Update settlement time statistics
        if (settlementTimeMs) {
            if (analytics.averageSettlementTimeMs === null) {
                analytics.averageSettlementTimeMs = settlementTimeMs;
                analytics.minSettlementTimeMs = settlementTimeMs;
                analytics.maxSettlementTimeMs = settlementTimeMs;
            }
            else {
                // Rolling average
                const n = analytics.successfulTransfers;
                analytics.averageSettlementTimeMs =
                    (analytics.averageSettlementTimeMs * (n - 1) + settlementTimeMs) / n;
                analytics.minSettlementTimeMs = Math.min(analytics.minSettlementTimeMs, settlementTimeMs);
                analytics.maxSettlementTimeMs = Math.max(analytics.maxSettlementTimeMs, settlementTimeMs);
            }
        }
        // Update fee statistics
        if (fee) {
            if (analytics.averageFee === null) {
                analytics.averageFee = fee;
            }
            else {
                const n = analytics.totalTransfers;
                analytics.averageFee = (analytics.averageFee * (n - 1) + fee) / n;
            }
        }
        // Update slippage statistics
        if (slippagePercent) {
            if (analytics.averageSlippagePercent === null) {
                analytics.averageSlippagePercent = slippagePercent;
            }
            else {
                const n = analytics.totalTransfers;
                analytics.averageSlippagePercent =
                    (analytics.averageSlippagePercent * (n - 1) + slippagePercent) / n;
            }
        }
        // Update volume
        if (volume) {
            analytics.totalVolume += volume;
        }
        analytics.lastUpdated = new Date();
        await this.analyticsRepository.save(analytics);
        this.logger.debug(`Updated analytics for ${route.bridgeName}: ${route.sourceChain} -> ${route.destinationChain}`);
    }
    /**
     * Recalculate all analytics from raw data
     * Useful for initial population or data correction
     */
    async recalculateAllAnalytics() {
        this.logger.log('Starting analytics recalculation...');
        // Clear existing analytics
        await this.analyticsRepository.clear();
        // Aggregate from bridge_benchmarks
        const query = `
      SELECT 
        bridge_name,
        source_chain,
        destination_chain,
        token,
        COUNT(*) as total_transfers,
        COUNT(*) FILTER (WHERE status = 'confirmed') as successful_transfers,
        COUNT(*) FILTER (WHERE status = 'failed') as failed_transfers,
        AVG(duration_ms) FILTER (WHERE status = 'confirmed') as avg_settlement_time,
        MIN(duration_ms) FILTER (WHERE status = 'confirmed') as min_settlement_time,
        MAX(duration_ms) FILTER (WHERE status = 'confirmed') as max_settlement_time,
        SUM(amount) as total_volume
      FROM bridge_benchmarks
      GROUP BY bridge_name, source_chain, destination_chain, token
    `;
        const results = await this.analyticsRepository.query(query);
        for (const row of results) {
            const analytics = this.analyticsRepository.create({
                bridgeName: row.bridge_name,
                sourceChain: row.source_chain,
                destinationChain: row.destination_chain,
                token: row.token,
                totalTransfers: parseInt(row.total_transfers, 10),
                successfulTransfers: parseInt(row.successful_transfers, 10),
                failedTransfers: parseInt(row.failed_transfers, 10),
                averageSettlementTimeMs: row.avg_settlement_time
                    ? parseFloat(row.avg_settlement_time)
                    : null,
                minSettlementTimeMs: row.min_settlement_time
                    ? parseInt(row.min_settlement_time, 10)
                    : null,
                maxSettlementTimeMs: row.max_settlement_time
                    ? parseInt(row.max_settlement_time, 10)
                    : null,
                averageFee: null,
                averageSlippagePercent: null,
                totalVolume: parseFloat(row.total_volume) || 0,
            });
            await this.analyticsRepository.save(analytics);
        }
        this.logger.log(`Recalculated analytics for ${results.length} routes`);
    }
    /**
     * Map entity to DTO
     */
    mapToRouteAnalyticsDto(entity) {
        return {
            bridgeName: entity.bridgeName,
            sourceChain: entity.sourceChain,
            destinationChain: entity.destinationChain,
            token: entity.token || undefined,
            totalTransfers: entity.totalTransfers,
            successfulTransfers: entity.successfulTransfers,
            failedTransfers: entity.failedTransfers,
            successRate: entity.successRate,
            failureRate: entity.failureRate,
            averageSettlementTimeMs: entity.averageSettlementTimeMs || undefined,
            minSettlementTimeMs: entity.minSettlementTimeMs || undefined,
            maxSettlementTimeMs: entity.maxSettlementTimeMs || undefined,
            averageFee: entity.averageFee || undefined,
            averageSlippagePercent: entity.averageSlippagePercent || undefined,
            totalVolume: entity.totalVolume,
            lastUpdated: entity.lastUpdated,
        };
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = AnalyticsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(bridge_analytics_entity_1.BridgeAnalytics)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map