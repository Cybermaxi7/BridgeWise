"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var RankingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RankingService = void 0;
const common_1 = require("@nestjs/common");
const enums_1 = require("./enums");
let RankingService = RankingService_1 = class RankingService {
    constructor() {
        this.logger = new common_1.Logger(RankingService_1.name);
        this.RANKING_WEIGHTS = {
            [enums_1.RankingMode.BALANCED]: {
                cost: 0.3,
                speed: 0.25,
                reliability: 0.3,
                slippage: 0.15,
            },
            [enums_1.RankingMode.LOWEST_COST]: {
                cost: 0.55,
                speed: 0.15,
                reliability: 0.2,
                slippage: 0.1,
            },
            [enums_1.RankingMode.FASTEST]: {
                cost: 0.15,
                speed: 0.55,
                reliability: 0.2,
                slippage: 0.1,
            },
        };
        /**
         * Confidence score weights — fees, slippage, and historical success rate.
         * These are fixed regardless of RankingMode, since confidence reflects trust/reliability,
         * not the user's routing preference.
         */
        this.CONFIDENCE_WEIGHTS = {
            fee: 0.35,
            slippage: 0.30,
            successRate: 0.35,
        };
    }
    /**
     * Apply ranking to a list of normalized quotes and assign composite scores + positions.
     */
    rankQuotes(quotes, mode) {
        if (!quotes.length)
            return [];
        const weights = this.RANKING_WEIGHTS[mode];
        const maxFee = Math.max(...quotes.map((q) => q.totalFeeUsd));
        const maxTime = Math.max(...quotes.map((q) => q.estimatedTimeSeconds));
        const maxSlippage = Math.max(...quotes.map((q) => q.slippagePercent));
        this.logger.debug(`Ranking ${quotes.length} quotes with mode: ${mode}`);
        const scored = quotes.map((quote) => {
            const costScore = maxFee > 0 ? (1 - quote.totalFeeUsd / maxFee) * 100 : 100;
            const speedScore = maxTime > 0 ? (1 - quote.estimatedTimeSeconds / maxTime) * 100 : 100;
            const reliabilityScore = quote.reliabilityScore;
            const slippageScore = maxSlippage > 0 ? (1 - quote.slippagePercent / maxSlippage) * 100 : 100;
            const compositeScore = costScore * weights.cost +
                speedScore * weights.speed +
                reliabilityScore * weights.reliability +
                slippageScore * weights.slippage;
            const { score: confidenceScore, level: confidenceLevel } = this.computeConfidenceScore(quote, maxFee, maxSlippage);
            return {
                ...quote,
                compositeScore: parseFloat(compositeScore.toFixed(2)),
                confidenceScore,
                confidenceLevel,
            };
        });
        // Sort descending — higher composite score = better route
        const sorted = scored.sort((a, b) => b.compositeScore - a.compositeScore);
        return sorted.map((quote, index) => ({
            ...quote,
            rankingPosition: index + 1,
        }));
    }
    /**
     * Compute a confidence score (0-100) for a single quote based on:
     *  - Fee competitiveness (normalized against the most expensive quote)
     *  - Slippage (normalized against the worst slippage in the set)
     *  - Historical success rate (reliabilityScore, already 0-100)
     */
    computeConfidenceScore(quote, maxFee, maxSlippage) {
        const feeScore = maxFee > 0 ? (1 - quote.totalFeeUsd / maxFee) * 100 : 100;
        const slippageScore = maxSlippage > 0 ? (1 - quote.slippagePercent / maxSlippage) * 100 : 100;
        const successRateScore = quote.reliabilityScore; // already 0-100
        const raw = feeScore * this.CONFIDENCE_WEIGHTS.fee +
            slippageScore * this.CONFIDENCE_WEIGHTS.slippage +
            successRateScore * this.CONFIDENCE_WEIGHTS.successRate;
        const score = parseFloat(Math.min(100, Math.max(0, raw)).toFixed(2));
        const level = score >= 75 ? 'high' : score >= 50 ? 'medium' : 'low';
        return { score, level };
    }
    /**
     * Get the best quote for a given ranking mode.
     */
    getBestQuote(quotes, mode) {
        const ranked = this.rankQuotes(quotes, mode);
        return ranked[0] ?? null;
    }
    /**
     * Get ranking weights for a given mode.
     */
    getWeights(mode) {
        return this.RANKING_WEIGHTS[mode];
    }
};
exports.RankingService = RankingService;
exports.RankingService = RankingService = RankingService_1 = __decorate([
    (0, common_1.Injectable)()
], RankingService);
//# sourceMappingURL=ranking.service.js.map