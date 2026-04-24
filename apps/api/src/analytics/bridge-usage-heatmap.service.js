"use strict";
/**
 * Bridge Usage Heatmap Service
 *
 * Aggregates usage data across chains and bridges for heatmap visualization.
 * Provides normalized data structure ready for visualization libraries.
 */
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
var BridgeUsageHeatmapService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BridgeUsageHeatmapService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bridge_analytics_entity_1 = require("./entities/bridge-analytics.entity");
const abandonment_tracking_service_1 = require("./abandonment-tracking.service");
let BridgeUsageHeatmapService = BridgeUsageHeatmapService_1 = class BridgeUsageHeatmapService {
    constructor(analyticsRepository, abandonmentService) {
        this.analyticsRepository = analyticsRepository;
        this.abandonmentService = abandonmentService;
        this.logger = new common_1.Logger(BridgeUsageHeatmapService_1.name);
        // Known chains for consistent ordering
        this.CHAIN_ORDER = [
            'ethereum',
            'polygon',
            'arbitrum',
            'optimism',
            'avalanche',
            'bsc',
            'stellar',
            'solana',
            'base',
            'zksync',
        ];
    }
    /**
     * Generate heatmap data for bridge usage
     *
     * @param params - Query parameters for filtering and grouping
     * @returns Heatmap data structure ready for visualization
     */
    async getHeatmapData(params = {}) {
        const startDate = params.startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Default 7 days
        const endDate = params.endDate || new Date();
        this.logger.log(`Generating heatmap data from ${startDate.toISOString()} to ${endDate.toISOString()}`);
        // Get all analytics data in time range
        const analyticsData = await this.getAnalyticsInRange(startDate, endDate, params);
        // Get abandonment data for additional context
        const abandonmentMetrics = this.abandonmentService.getAbandonmentMetrics({
            startDate,
            endDate,
        });
        // Build heatmap structure
        const heatmapData = this.buildHeatmapStructure(analyticsData, params.normalize || false, params.groupByBridge || false);
        // Add metadata from abandonment
        this.enrichWithAbandonmentData(heatmapData, abandonmentMetrics);
        return {
            ...heatmapData,
            timeRange: { start: startDate, end: endDate },
            generatedAt: new Date(),
        };
    }
    /**
     * Get aggregated usage by source-destination chain pair
     */
    async getChainPairUsage(startDate, endDate) {
        const start = startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const end = endDate || new Date();
        const data = await this.analyticsRepository
            .createQueryBuilder('a')
            .select('a.source_chain', 'sourceChain')
            .addSelect('a.destination_chain', 'destinationChain')
            .addSelect('SUM(a.total_transfers)', 'transfers')
            .addSelect('SUM(a.total_volume)', 'volume')
            .where('a.last_updated BETWEEN :start AND :end', { start, end })
            .groupBy('a.source_chain')
            .addGroupBy('a.destination_chain')
            .getRawMany();
        const result = new Map();
        for (const row of data) {
            const key = `${row.sourceChain}->${row.destinationChain}`;
            result.set(key, {
                transfers: parseInt(row.transfers, 10) || 0,
                volume: parseFloat(row.volume) || 0,
            });
        }
        return result;
    }
    /**
     * Get bridge usage breakdown by chain pair
     */
    async getBridgeBreakdown(sourceChain, destinationChain, startDate, endDate) {
        const start = startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const end = endDate || new Date();
        const data = await this.analyticsRepository.find({
            where: {
                sourceChain,
                destinationChain,
            },
            order: { totalTransfers: 'DESC' },
        });
        return data.map((entity) => ({
            bridgeName: entity.bridgeName,
            transfers: entity.totalTransfers,
            volume: entity.totalVolume,
            successRate: entity.successRate,
        }));
    }
    /**
     * Export heatmap data in various formats
     */
    async exportHeatmapData(format, params = {}) {
        const heatmapData = await this.getHeatmapData(params);
        switch (format) {
            case 'json':
                return heatmapData;
            case 'csv':
                return this.exportAsCSV(heatmapData);
            case 'matrix':
                return this.exportAsMatrix(heatmapData);
            default:
                return heatmapData;
        }
    }
    /**
     * Get time-series heatmap data (multiple periods)
     */
    async getTimeSeriesHeatmap(periods, periodType) {
        const results = [];
        const now = new Date();
        for (let i = 0; i < periods; i++) {
            let start;
            let end;
            switch (periodType) {
                case 'day':
                    start = new Date(now.getTime() - (i + 1) * 24 * 60 * 60 * 1000);
                    end = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
                    break;
                case 'week':
                    start = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
                    end = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
                    break;
                case 'month':
                    start = new Date(now.getTime() - (i + 1) * 30 * 24 * 60 * 60 * 1000);
                    end = new Date(now.getTime() - i * 30 * 24 * 60 * 60 * 1000);
                    break;
            }
            const heatmapData = await this.getHeatmapData({ startDate: start, endDate: end });
            results.push(heatmapData);
        }
        return results;
    }
    // ---------------------------------------------------------------------------
    // Private methods
    // ---------------------------------------------------------------------------
    /**
     * Get analytics data in date range with filters
     */
    async getAnalyticsInRange(startDate, endDate, params) {
        const query = this.analyticsRepository
            .createQueryBuilder('a')
            .where('a.last_updated BETWEEN :start AND :end', { start: startDate, end: endDate });
        if (params.bridges && params.bridges.length > 0) {
            query.andWhere('a.bridge_name IN (:...bridges)', { bridges: params.bridges });
        }
        if (params.tokens && params.tokens.length > 0) {
            query.andWhere('a.token IN (:...tokens)', { tokens: params.tokens });
        }
        return query.getMany();
    }
    /**
     * Build heatmap structure from analytics data
     */
    buildHeatmapStructure(analyticsData, normalize, groupByBridge) {
        // Collect all unique chains
        const chainsSet = new Set();
        const bridgesSet = new Set();
        for (const data of analyticsData) {
            chainsSet.add(data.sourceChain);
            chainsSet.add(data.destinationChain);
            bridgesSet.add(data.bridgeName);
        }
        // Sort chains consistently
        const chains = Array.from(chainsSet).sort((a, b) => {
            const aIndex = this.CHAIN_ORDER.indexOf(a);
            const bIndex = this.CHAIN_ORDER.indexOf(b);
            if (aIndex === -1 && bIndex === -1)
                return a.localeCompare(b);
            if (aIndex === -1)
                return 1;
            if (bIndex === -1)
                return -1;
            return aIndex - bIndex;
        });
        const bridges = Array.from(bridgesSet).sort();
        // Find max value for normalization
        let maxValue = 0;
        for (const data of analyticsData) {
            if (data.totalTransfers > maxValue) {
                maxValue = data.totalTransfers;
            }
        }
        // Build rows (source chains)
        const rows = [];
        const cellMap = new Map();
        // Initialize cells
        for (const sourceChain of chains) {
            for (const destChain of chains) {
                if (sourceChain !== destChain) {
                    cellMap.set(`${sourceChain}->${destChain}`, {
                        sourceChain,
                        destinationChain: destChain,
                        value: 0,
                        metadata: {
                            transactionCount: 0,
                            volume: 0,
                            successRate: 0,
                        },
                    });
                }
            }
        }
        // Fill in data
        for (const data of analyticsData) {
            const key = `${data.sourceChain}->${data.destinationChain}`;
            const cell = cellMap.get(key);
            if (cell) {
                if (groupByBridge && data.bridgeName) {
                    // Add bridge-specific cell
                    cell.bridgeName = data.bridgeName;
                }
                cell.value += data.totalTransfers;
                cell.metadata = {
                    transactionCount: cell.metadata.transactionCount + data.totalTransfers,
                    volume: (cell.metadata.volume || 0) + data.totalVolume,
                    successRate: data.successRate,
                };
                // Update max for normalization
                if (cell.value > maxValue) {
                    maxValue = cell.value;
                }
            }
        }
        // Normalize if requested
        if (normalize && maxValue > 0) {
            for (const cell of cellMap.values()) {
                cell.value = Math.round((cell.value / maxValue) * 100);
            }
        }
        // Build rows
        for (const sourceChain of chains) {
            const cells = [];
            for (const destChain of chains) {
                if (sourceChain !== destChain) {
                    const cell = cellMap.get(`${sourceChain}->${destChain}`);
                    if (cell && cell.value > 0) {
                        cells.push(cell);
                    }
                }
            }
            if (cells.length > 0) {
                rows.push({ sourceChain, cells });
            }
        }
        return { rows, columns: chains, bridges };
    }
    /**
     * Enrich heatmap with abandonment data
     */
    enrichWithAbandonmentData(heatmapData, abandonmentMetrics) {
        // Could add abandonment rate to each cell if we have per-route data
        // For now, just note it exists
        this.logger.debug(`Enriching with abandonment data: rate=${abandonmentMetrics.abandonmentRate}%`);
    }
    /**
     * Export as CSV
     */
    exportAsCSV(heatmapData) {
        const lines = [];
        // Header
        const header = ['Source Chain', ...heatmapData.columns, 'Total'];
        lines.push(header.join(','));
        // Rows
        for (const row of heatmapData.rows) {
            const values = [row.sourceChain];
            let rowTotal = 0;
            for (const col of heatmapData.columns) {
                const cell = row.cells.find((c) => c.destinationChain === col);
                const value = cell?.value || 0;
                values.push(value.toString());
                rowTotal += value;
            }
            values.push(rowTotal.toString());
            lines.push(values.join(','));
        }
        return lines.join('\n');
    }
    /**
     * Export as matrix (2D array)
     */
    exportAsMatrix(heatmapData) {
        const matrix = [];
        const chainIndexMap = new Map();
        // Build chain index map
        heatmapData.columns.forEach((chain, index) => {
            chainIndexMap.set(chain, index);
        });
        // Initialize matrix
        for (let i = 0; i < heatmapData.columns.length; i++) {
            matrix[i] = new Array(heatmapData.columns.length).fill(0);
        }
        // Fill matrix
        for (const row of heatmapData.rows) {
            const sourceIndex = chainIndexMap.get(row.sourceChain);
            if (sourceIndex === undefined)
                continue;
            for (const cell of row.cells) {
                const destIndex = chainIndexMap.get(cell.destinationChain);
                if (destIndex === undefined)
                    continue;
                matrix[sourceIndex][destIndex] = cell.value;
            }
        }
        return matrix;
    }
};
exports.BridgeUsageHeatmapService = BridgeUsageHeatmapService;
exports.BridgeUsageHeatmapService = BridgeUsageHeatmapService = BridgeUsageHeatmapService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(bridge_analytics_entity_1.BridgeAnalytics)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        abandonment_tracking_service_1.AbandonmentTrackingService])
], BridgeUsageHeatmapService);
//# sourceMappingURL=bridge-usage-heatmap.service.js.map