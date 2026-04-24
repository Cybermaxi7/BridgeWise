"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var SlippageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlippageService = void 0;
const common_1 = require("@nestjs/common");
let SlippageService = SlippageService_1 = class SlippageService {
    constructor() {
        this.logger = new common_1.Logger(SlippageService_1.name);
        // Simulated liquidity pool data — in production, fetched from on-chain / oracles
        this.MOCK_POOLS = [
            {
                token: 'USDC',
                chain: 'ethereum',
                tvlUsd: 50_000_000,
                dailyVolumeUsd: 10_000_000,
            },
            {
                token: 'USDC',
                chain: 'stellar',
                tvlUsd: 5_000_000,
                dailyVolumeUsd: 1_000_000,
            },
            {
                token: 'USDT',
                chain: 'ethereum',
                tvlUsd: 40_000_000,
                dailyVolumeUsd: 8_000_000,
            },
            {
                token: 'ETH',
                chain: 'ethereum',
                tvlUsd: 200_000_000,
                dailyVolumeUsd: 50_000_000,
            },
            {
                token: 'XLM',
                chain: 'stellar',
                tvlUsd: 2_000_000,
                dailyVolumeUsd: 500_000,
            },
        ];
    }
    /**
     * Estimate slippage for a bridge quote based on amount vs. pool liquidity.
     */
    estimateSlippage(quote, sourceToken, sourceChain, amountUsd) {
        const pool = this.MOCK_POOLS.find((p) => p.token.toUpperCase() === sourceToken.toUpperCase() &&
            p.chain === sourceChain);
        if (!pool) {
            this.logger.warn(`No liquidity data for ${sourceToken} on ${sourceChain}, using conservative estimate`);
            return this.conservativeEstimate(amountUsd);
        }
        const impactRatio = amountUsd / pool.tvlUsd;
        const expectedSlippage = this.calculatePriceImpact(impactRatio);
        const maxSlippage = expectedSlippage * 2.5;
        const confidence = this.determineConfidence(pool, amountUsd);
        return {
            expectedSlippage: parseFloat(expectedSlippage.toFixed(4)),
            maxSlippage: parseFloat(maxSlippage.toFixed(4)),
            confidence,
        };
    }
    /**
     * Batch estimate slippage across multiple quotes.
     */
    batchEstimateSlippage(quotes, sourceToken, sourceChain, amountUsd) {
        const results = new Map();
        for (const quote of quotes) {
            results.set(quote.bridgeId, this.estimateSlippage(quote, sourceToken, sourceChain, amountUsd));
        }
        return results;
    }
    calculatePriceImpact(impactRatio) {
        // Approximation of constant-product AMM price impact: 1 - 1/sqrt(1 + x)
        return (1 - 1 / Math.sqrt(1 + impactRatio)) * 100;
    }
    determineConfidence(pool, amountUsd) {
        const ratio = amountUsd / pool.tvlUsd;
        if (ratio < 0.001)
            return 'high';
        if (ratio < 0.01)
            return 'medium';
        return 'low';
    }
    conservativeEstimate(amountUsd) {
        const base = Math.min(amountUsd / 100_000, 5);
        return {
            expectedSlippage: parseFloat(base.toFixed(4)),
            maxSlippage: parseFloat((base * 2).toFixed(4)),
            confidence: 'low',
        };
    }
};
exports.SlippageService = SlippageService;
exports.SlippageService = SlippageService = SlippageService_1 = __decorate([
    (0, common_1.Injectable)()
], SlippageService);
//# sourceMappingURL=slippage.service.js.map