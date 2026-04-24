"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ReliabilityService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReliabilityService = void 0;
const common_1 = require("@nestjs/common");
let ReliabilityService = ReliabilityService_1 = class ReliabilityService {
    constructor() {
        this.logger = new common_1.Logger(ReliabilityService_1.name);
        // Weights for composite reliability score
        this.WEIGHTS = {
            uptime: 0.35,
            successRate: 0.4,
            delayPenalty: 0.15,
            incidentPenalty: 0.1,
        };
        // Simulated historical metrics — in production, fetched from monitoring DB
        this.MOCK_METRICS = {
            stargate: {
                uptime24h: 99.8,
                successRate7d: 98.5,
                avgDelayPercent: 5,
                incidentCount30d: 1,
                reliabilityScore: 0,
            },
            squid: {
                uptime24h: 99.5,
                successRate7d: 97.2,
                avgDelayPercent: 12,
                incidentCount30d: 2,
                reliabilityScore: 0,
            },
            hop: {
                uptime24h: 98.9,
                successRate7d: 96.8,
                avgDelayPercent: 8,
                incidentCount30d: 3,
                reliabilityScore: 0,
            },
            cbridge: {
                uptime24h: 99.1,
                successRate7d: 97.5,
                avgDelayPercent: 10,
                incidentCount30d: 2,
                reliabilityScore: 0,
            },
            soroswap: {
                uptime24h: 97.5,
                successRate7d: 95.0,
                avgDelayPercent: 15,
                incidentCount30d: 5,
                reliabilityScore: 0,
            },
        };
    }
    /**
     * Calculate a 0-100 reliability score for a bridge provider.
     */
    calculateReliabilityScore(bridgeId) {
        const metrics = this.MOCK_METRICS[bridgeId.toLowerCase()];
        if (!metrics) {
            this.logger.warn(`No reliability metrics for bridge: ${bridgeId}, using default score`);
            return 70; // conservative default
        }
        const score = this.computeScore(metrics);
        this.logger.debug(`Reliability score for ${bridgeId}: ${score}`);
        return score;
    }
    /**
     * Get full reliability metrics for a bridge.
     */
    getMetrics(bridgeId) {
        const metrics = this.MOCK_METRICS[bridgeId.toLowerCase()];
        if (!metrics) {
            return {
                uptime24h: 0,
                successRate7d: 0,
                avgDelayPercent: 100,
                incidentCount30d: 99,
                reliabilityScore: 50,
            };
        }
        return { ...metrics, reliabilityScore: this.computeScore(metrics) };
    }
    /**
     * Batch compute scores for multiple bridges.
     */
    batchCalculateScores(bridgeIds) {
        const results = new Map();
        for (const id of bridgeIds) {
            results.set(id, this.calculateReliabilityScore(id));
        }
        return results;
    }
    /**
     * Batch fetch full reliability metrics for multiple bridges.
     */
    batchGetMetrics(bridgeIds) {
        const results = new Map();
        for (const id of bridgeIds) {
            results.set(id, this.getMetrics(id));
        }
        return results;
    }
    computeScore(metrics) {
        const uptimeScore = metrics.uptime24h; // 0-100
        const successScore = metrics.successRate7d; // 0-100
        const delayScore = Math.max(0, 100 - metrics.avgDelayPercent * 2); // penalize delays
        const incidentScore = Math.max(0, 100 - metrics.incidentCount30d * 5); // penalize incidents
        const composite = uptimeScore * this.WEIGHTS.uptime +
            successScore * this.WEIGHTS.successRate +
            delayScore * this.WEIGHTS.delayPenalty +
            incidentScore * this.WEIGHTS.incidentPenalty;
        return parseFloat(Math.min(100, Math.max(0, composite)).toFixed(2));
    }
};
exports.ReliabilityService = ReliabilityService;
exports.ReliabilityService = ReliabilityService = ReliabilityService_1 = __decorate([
    (0, common_1.Injectable)()
], ReliabilityService);
//# sourceMappingURL=reliability.service.js.map