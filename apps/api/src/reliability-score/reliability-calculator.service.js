"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReliabilityCalculatorService = void 0;
const common_1 = require("@nestjs/common");
const reliability_constants_1 = require("../constants/reliability.constants");
const reliability_enum_1 = require("../enums/reliability.enum");
let ReliabilityCalculatorService = class ReliabilityCalculatorService {
    /**
     * Compute reliability percentage from raw counts.
     * Cancelled transactions are already excluded at query level.
     */
    computeReliabilityPercent(counts) {
        if (counts.totalAttempts < reliability_constants_1.RELIABILITY_CONSTANTS.MIN_ATTEMPTS_FOR_SCORE) {
            return 0;
        }
        return parseFloat(((counts.successfulTransfers / counts.totalAttempts) * 100).toFixed(2));
    }
    /**
     * Normalize reliability percentage to a 0-100 score.
     * Currently 1:1 since percent is already 0-100, but this layer
     * allows future weighting (e.g., heavier penalty for timeouts).
     */
    computeReliabilityScore(counts) {
        const percent = this.computeReliabilityPercent(counts);
        if (counts.totalAttempts < reliability_constants_1.RELIABILITY_CONSTANTS.MIN_ATTEMPTS_FOR_SCORE) {
            return 0;
        }
        // Apply extra timeout penalty: each timeout beyond a threshold reduces score
        const timeoutRatio = counts.timeoutCount / counts.totalAttempts;
        const timeoutPenalty = Math.min(timeoutRatio * 10, 5); // max 5-point penalty
        const rawScore = percent - timeoutPenalty;
        return parseFloat(Math.max(reliability_constants_1.RELIABILITY_CONSTANTS.MIN_SCORE, Math.min(reliability_constants_1.RELIABILITY_CONSTANTS.MAX_SCORE, rawScore)).toFixed(2));
    }
    /**
     * Determine tier based on reliability percent.
     */
    computeTier(reliabilityPercent) {
        if (reliabilityPercent >= reliability_constants_1.RELIABILITY_CONSTANTS.HIGH_THRESHOLD) {
            return reliability_enum_1.ReliabilityTier.HIGH;
        }
        if (reliabilityPercent >= reliability_constants_1.RELIABILITY_CONSTANTS.MEDIUM_THRESHOLD) {
            return reliability_enum_1.ReliabilityTier.MEDIUM;
        }
        return reliability_enum_1.ReliabilityTier.LOW;
    }
    /**
     * Build badge DTO for UI display.
     */
    buildBadge(reliabilityPercent, windowSize, windowMode) {
        const tier = this.computeTier(reliabilityPercent);
        const colorMap = {
            [reliability_enum_1.ReliabilityTier.HIGH]: '#22c55e',
            [reliability_enum_1.ReliabilityTier.MEDIUM]: '#f59e0b',
            [reliability_enum_1.ReliabilityTier.LOW]: '#ef4444',
        };
        const windowDesc = windowMode === 'TIME_BASED'
            ? `last ${windowSize} days`
            : `last ${windowSize} transactions`;
        return {
            tier,
            label: reliability_constants_1.RELIABILITY_BADGE_LABELS[tier],
            color: colorMap[tier],
            tooltip: `Score based on ${windowDesc}. Excludes user-cancelled events. Minimum ${reliability_constants_1.RELIABILITY_CONSTANTS.MIN_ATTEMPTS_FOR_SCORE} attempts required.`,
        };
    }
    /**
     * Compute ranking penalty for bridges below threshold.
     * Used by Smart Bridge Ranking (Issue #5).
     */
    computeRankingPenalty(reliabilityScore, threshold = reliability_constants_1.RELIABILITY_CONSTANTS.MEDIUM_THRESHOLD) {
        if (reliabilityScore < threshold) {
            return reliability_constants_1.RELIABILITY_CONSTANTS.PENALTY_BELOW_THRESHOLD;
        }
        return 0;
    }
    /**
     * Produce adjusted score for ranking engine.
     * Ranking engine calls this to integrate reliability.
     */
    applyReliabilityToRankingScore(baseRankingScore, reliabilityScore, options = {}) {
        if (options.ignoreReliability)
            return baseRankingScore;
        const weight = options.weight ?? 0.2; // 20% weight by default
        const penalty = this.computeRankingPenalty(reliabilityScore, options.threshold);
        const reliabilityContribution = reliabilityScore * weight;
        const baseContribution = baseRankingScore * (1 - weight);
        return parseFloat(Math.max(0, baseContribution + reliabilityContribution - penalty).toFixed(2));
    }
};
exports.ReliabilityCalculatorService = ReliabilityCalculatorService;
exports.ReliabilityCalculatorService = ReliabilityCalculatorService = __decorate([
    (0, common_1.Injectable)()
], ReliabilityCalculatorService);
//# sourceMappingURL=reliability-calculator.service.js.map