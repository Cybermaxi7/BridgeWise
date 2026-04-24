"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var FeeEngine_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeeEngine = void 0;
exports.buildStaticFeeSource = buildStaticFeeSource;
const common_1 = require("@nestjs/common");
let FeeEngine = FeeEngine_1 = class FeeEngine {
    constructor() {
        this.logger = new common_1.Logger(FeeEngine_1.name);
        this.sources = new Map();
    }
    registerSource(name, fn) {
        this.sources.set(name, fn);
        this.logger.log(`Fee source registered: ${name}`);
    }
    async compare(fromChain, toChain, token, amount) {
        const raw = await Promise.all(Array.from(this.sources.entries()).map(async ([, fn]) => {
            try {
                return await fn(fromChain, toChain, token, amount);
            }
            catch (err) {
                this.logger.warn(`Fee source error: ${err}`);
                return null;
            }
        }));
        const valid = raw.filter((q) => q !== null && q.totalFeeUSD >= 0);
        if (valid.length === 0) {
            throw new Error(`No fee quotes available for ${token} ${fromChain}→${toChain}`);
        }
        const ranked = this.rank(valid);
        return {
            quotes: ranked,
            cheapest: ranked[0],
            fastest: [...ranked].sort((a, b) => a.estimatedTimeSeconds - b.estimatedTimeSeconds)[0],
            fromChain,
            toChain,
            token,
            amount,
            generatedAt: new Date(),
        };
    }
    normalize(quotes) {
        const total = quotes.reduce((s, q) => s + q.totalFeeUSD, 0);
        const avg = total / quotes.length;
        return quotes.map((q) => ({
            ...q,
            totalFeeUSD: parseFloat(((q.totalFeeUSD / (avg || 1)) * q.totalFeeUSD).toFixed(4)),
        }));
    }
    cheapest(quotes) {
        if (!quotes.length)
            return null;
        return quotes.reduce((best, q) => (q.totalFeeUSD < best.totalFeeUSD ? q : best));
    }
    rank(quotes) {
        const sorted = [...quotes].sort((a, b) => a.totalFeeUSD - b.totalFeeUSD);
        const worst = sorted[sorted.length - 1].totalFeeUSD;
        return sorted.map((q, i) => ({
            ...q,
            rank: i + 1,
            savingsVsWorstUSD: parseFloat((worst - q.totalFeeUSD).toFixed(4)),
        }));
    }
};
exports.FeeEngine = FeeEngine;
exports.FeeEngine = FeeEngine = FeeEngine_1 = __decorate([
    (0, common_1.Injectable)()
], FeeEngine);
function buildStaticFeeSource(providerName, gasFeeUSD, feeRate, estimatedTimeSeconds) {
    return async (fromChain, toChain, token, amount) => {
        const protocolFeeUSD = amount * feeRate;
        const totalFeeUSD = gasFeeUSD + protocolFeeUSD;
        return {
            provider: providerName,
            fromChain,
            toChain,
            token,
            amount,
            gasFeeUSD,
            protocolFeeUSD: parseFloat(protocolFeeUSD.toFixed(4)),
            totalFeeUSD: parseFloat(totalFeeUSD.toFixed(4)),
            outputAmount: parseFloat((amount - totalFeeUSD).toFixed(6)),
            estimatedTimeSeconds,
        };
    };
}
//# sourceMappingURL=fee-engine.js.map