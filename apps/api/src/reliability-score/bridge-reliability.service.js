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
var BridgeReliabilityService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BridgeReliabilityService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bridge_transaction_event_entity_1 = require("./entities/bridge-transaction-event.entity");
const bridge_reliability_metric_entity_1 = require("./entities/bridge-reliability-metric.entity");
const reliability_calculator_service_1 = require("./reliability-calculator.service");
const reliability_enum_1 = require("./enums/reliability.enum");
const reliability_constants_1 = require("./constants/reliability.constants");
let BridgeReliabilityService = BridgeReliabilityService_1 = class BridgeReliabilityService {
    constructor(eventRepo, metricRepo, calculator) {
        this.eventRepo = eventRepo;
        this.metricRepo = metricRepo;
        this.calculator = calculator;
        this.logger = new common_1.Logger(BridgeReliabilityService_1.name);
    }
    // ─── Record Event ──────────────────────────────────────────────────────────
    async recordEvent(dto) {
        const event = this.eventRepo.create({
            bridgeName: dto.bridgeName,
            sourceChain: dto.sourceChain.toLowerCase(),
            destinationChain: dto.destinationChain.toLowerCase(),
            outcome: dto.outcome,
            transactionHash: dto.transactionHash ?? null,
            failureReason: dto.failureReason ?? null,
            durationMs: dto.durationMs ?? 0,
        });
        const saved = await this.eventRepo.save(event);
        this.logger.log(`Recorded ${dto.outcome} event for ${dto.bridgeName} [${dto.sourceChain} → ${dto.destinationChain}]`);
        // Invalidate cached metric so next query recalculates
        await this.invalidateCachedMetric(dto.bridgeName, dto.sourceChain, dto.destinationChain);
        return saved;
    }
    // ─── Rolling Window Queries ────────────────────────────────────────────────
    async getRollingCounts(bridgeName, sourceChain, destinationChain, windowMode, windowSize) {
        const baseWhere = {
            bridgeName,
            sourceChain: sourceChain.toLowerCase(),
            destinationChain: destinationChain.toLowerCase(),
        };
        // Exclude cancelled transactions
        const excludedOutcomes = [reliability_enum_1.TransactionOutcome.CANCELLED];
        if (windowMode === reliability_enum_1.WindowMode.TIME_BASED) {
            const since = new Date();
            since.setDate(since.getDate() - windowSize);
            const events = await this.eventRepo.find({
                where: {
                    ...baseWhere,
                    createdAt: (0, typeorm_2.MoreThanOrEqual)(since),
                },
                select: ['outcome'],
            });
            return this.aggregateCounts(events.filter((e) => !excludedOutcomes.includes(e.outcome)));
        }
        // TRANSACTION_COUNT mode: last N non-cancelled events
        const events = await this.eventRepo.find({
            where: baseWhere,
            order: { createdAt: 'DESC' },
            take: windowSize + 200, // over-fetch to account for cancelled
            select: ['outcome'],
        });
        const filtered = events
            .filter((e) => !excludedOutcomes.includes(e.outcome))
            .slice(0, windowSize);
        return this.aggregateCounts(filtered);
    }
    aggregateCounts(events) {
        const counts = {
            totalAttempts: events.length,
            successfulTransfers: 0,
            failedTransfers: 0,
            timeoutCount: 0,
        };
        for (const event of events) {
            if (event.outcome === reliability_enum_1.TransactionOutcome.SUCCESS)
                counts.successfulTransfers++;
            else if (event.outcome === reliability_enum_1.TransactionOutcome.FAILED)
                counts.failedTransfers++;
            else if (event.outcome === reliability_enum_1.TransactionOutcome.TIMEOUT)
                counts.timeoutCount++;
        }
        return counts;
    }
    // ─── Compute & Cache Reliability ──────────────────────────────────────────
    async getReliability(dto) {
        const windowMode = dto.windowMode ?? reliability_enum_1.WindowMode.TRANSACTION_COUNT;
        const windowSize = dto.windowSize ??
            (windowMode === reliability_enum_1.WindowMode.TIME_BASED
                ? reliability_constants_1.RELIABILITY_CONSTANTS.DEFAULT_WINDOW_DAYS
                : reliability_constants_1.RELIABILITY_CONSTANTS.DEFAULT_WINDOW_SIZE);
        const counts = await this.getRollingCounts(dto.bridgeName, dto.sourceChain, dto.destinationChain, windowMode, windowSize);
        const reliabilityPercent = this.calculator.computeReliabilityPercent(counts);
        const reliabilityScore = this.calculator.computeReliabilityScore(counts);
        const tier = this.calculator.computeTier(reliabilityPercent);
        const badge = this.calculator.buildBadge(reliabilityPercent, windowSize, windowMode);
        // Upsert cached metric for ranking engine access
        const metric = await this.upsertMetric({
            bridgeName: dto.bridgeName,
            sourceChain: dto.sourceChain.toLowerCase(),
            destinationChain: dto.destinationChain.toLowerCase(),
            ...counts,
            reliabilityPercent,
            reliabilityScore,
            reliabilityTier: tier,
            windowMode,
            windowSize,
        });
        return {
            bridgeName: dto.bridgeName,
            sourceChain: dto.sourceChain.toLowerCase(),
            destinationChain: dto.destinationChain.toLowerCase(),
            totalAttempts: counts.totalAttempts,
            successfulTransfers: counts.successfulTransfers,
            failedTransfers: counts.failedTransfers,
            timeoutCount: counts.timeoutCount,
            reliabilityPercent,
            reliabilityScore,
            badge,
            lastComputedAt: metric.lastComputedAt,
        };
    }
    // ─── Ranking Engine Integration ───────────────────────────────────────────
    async getReliabilityRankingFactor(bridgeName, sourceChain, destinationChain, options = {}) {
        const metric = await this.metricRepo.findOne({
            where: {
                bridgeName,
                sourceChain: sourceChain.toLowerCase(),
                destinationChain: destinationChain.toLowerCase(),
            },
        });
        const reliabilityScore = metric?.reliabilityScore ?? 0;
        const threshold = options.threshold ?? reliability_constants_1.RELIABILITY_CONSTANTS.MEDIUM_THRESHOLD;
        const penaltyApplied = !options.ignoreReliability && reliabilityScore < threshold;
        const adjustedScore = options.ignoreReliability
            ? reliabilityScore
            : reliabilityScore -
                (penaltyApplied ? reliability_constants_1.RELIABILITY_CONSTANTS.PENALTY_BELOW_THRESHOLD : 0);
        return {
            bridgeName,
            sourceChain: sourceChain.toLowerCase(),
            destinationChain: destinationChain.toLowerCase(),
            reliabilityScore,
            penaltyApplied,
            adjustedScore: Math.max(0, adjustedScore),
        };
    }
    /**
     * Bulk fetch reliability factors for all bridges on a route.
     * Used by the Smart Bridge Ranking engine to sort bridges.
     */
    async getBulkReliabilityFactors(sourceChain, destinationChain, options = {}) {
        const metrics = await this.metricRepo.find({
            where: {
                sourceChain: sourceChain.toLowerCase(),
                destinationChain: destinationChain.toLowerCase(),
            },
        });
        return metrics.map((m) => {
            const threshold = options.threshold ?? reliability_constants_1.RELIABILITY_CONSTANTS.MEDIUM_THRESHOLD;
            const penaltyApplied = !options.ignoreReliability && Number(m.reliabilityScore) < threshold;
            return {
                bridgeName: m.bridgeName,
                sourceChain: m.sourceChain,
                destinationChain: m.destinationChain,
                reliabilityScore: Number(m.reliabilityScore),
                penaltyApplied,
                adjustedScore: Math.max(0, Number(m.reliabilityScore) -
                    (penaltyApplied
                        ? reliability_constants_1.RELIABILITY_CONSTANTS.PENALTY_BELOW_THRESHOLD
                        : 0)),
            };
        });
    }
    // ─── Admin / Maintenance ──────────────────────────────────────────────────
    async getAllMetrics() {
        return this.metricRepo.find({ order: { reliabilityScore: 'DESC' } });
    }
    // ─── Private Helpers ──────────────────────────────────────────────────────
    async upsertMetric(data) {
        let metric = await this.metricRepo.findOne({
            where: {
                bridgeName: data.bridgeName,
                sourceChain: data.sourceChain,
                destinationChain: data.destinationChain,
            },
        });
        if (!metric) {
            metric = this.metricRepo.create({
                bridgeName: data.bridgeName,
                sourceChain: data.sourceChain,
                destinationChain: data.destinationChain,
            });
        }
        Object.assign(metric, {
            totalAttempts: data.totalAttempts,
            successfulTransfers: data.successfulTransfers,
            failedTransfers: data.failedTransfers,
            timeoutCount: data.timeoutCount,
            reliabilityPercent: data.reliabilityPercent,
            reliabilityScore: data.reliabilityScore,
            reliabilityTier: data.reliabilityTier,
            windowConfig: { mode: data.windowMode, size: data.windowSize },
        });
        return this.metricRepo.save(metric);
    }
    async invalidateCachedMetric(bridgeName, sourceChain, destinationChain) {
        // Simply sets score to stale; actual recompute happens on next getReliability call
        await this.metricRepo.update({
            bridgeName,
            sourceChain: sourceChain.toLowerCase(),
            destinationChain: destinationChain.toLowerCase(),
        }, { totalAttempts: () => '"totalAttempts"' });
    }
};
exports.BridgeReliabilityService = BridgeReliabilityService;
exports.BridgeReliabilityService = BridgeReliabilityService = BridgeReliabilityService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(bridge_transaction_event_entity_1.BridgeTransactionEvent)),
    __param(1, (0, typeorm_1.InjectRepository)(bridge_reliability_metric_entity_1.BridgeReliabilityMetric)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        reliability_calculator_service_1.ReliabilityCalculatorService])
], BridgeReliabilityService);
//# sourceMappingURL=bridge-reliability.service.js.map