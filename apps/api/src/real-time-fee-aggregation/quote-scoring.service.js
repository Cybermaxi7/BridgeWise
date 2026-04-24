"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuoteScoringService = void 0;
const common_1 = require("@nestjs/common");
const DEFAULT_WEIGHTS = {
    costWeight: 0.5,
    speedWeight: 0.3,
    outputWeight: 0.2,
};
let QuoteScoringService = class QuoteScoringService {
    /**
     * Assigns a composite score (0–100) to each quote using min-max normalization.
     * Higher score = better option.
     */
    scoreAndRank(quotes, strategy = 'score') {
        const supported = quotes.filter((q) => q.supported && !q.error);
        const unsupported = quotes.filter((q) => !q.supported || q.error);
        if (supported.length === 0)
            return [...unsupported];
        const scored = this.applyScores(supported);
        const ranked = this.sortByStrategy(scored, strategy);
        return [...ranked, ...unsupported];
    }
    applyScores(quotes) {
        const fees = quotes.map((q) => q.totalFeeUSD);
        const times = quotes.map((q) => q.estimatedArrivalTime);
        const outputs = quotes.map((q) => parseFloat(q.outputAmount));
        const minFee = Math.min(...fees);
        const maxFee = Math.max(...fees);
        const minTime = Math.min(...times);
        const maxTime = Math.max(...times);
        const minOutput = Math.min(...outputs);
        const maxOutput = Math.max(...outputs);
        return quotes.map((q) => {
            const costScore = this.normalizeInverted(q.totalFeeUSD, minFee, maxFee);
            const speedScore = this.normalizeInverted(q.estimatedArrivalTime, minTime, maxTime);
            const outputScore = this.normalize(parseFloat(q.outputAmount), minOutput, maxOutput);
            const score = DEFAULT_WEIGHTS.costWeight * costScore +
                DEFAULT_WEIGHTS.speedWeight * speedScore +
                DEFAULT_WEIGHTS.outputWeight * outputScore;
            return { ...q, score: parseFloat((score * 100).toFixed(2)) };
        });
    }
    sortByStrategy(quotes, strategy) {
        switch (strategy) {
            case 'cost':
                return [...quotes].sort((a, b) => a.totalFeeUSD - b.totalFeeUSD);
            case 'speed':
                return [...quotes].sort((a, b) => a.estimatedArrivalTime - b.estimatedArrivalTime);
            case 'score':
            default:
                return [...quotes].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
        }
    }
    /** Higher value = better (e.g., output amount) */
    normalize(value, min, max) {
        if (max === min)
            return 1;
        return (value - min) / (max - min);
    }
    /** Lower value = better (e.g., fee, time) */
    normalizeInverted(value, min, max) {
        if (max === min)
            return 1;
        return 1 - (value - min) / (max - min);
    }
};
exports.QuoteScoringService = QuoteScoringService;
exports.QuoteScoringService = QuoteScoringService = __decorate([
    (0, common_1.Injectable)()
], QuoteScoringService);
//# sourceMappingURL=quote-scoring.service.js.map