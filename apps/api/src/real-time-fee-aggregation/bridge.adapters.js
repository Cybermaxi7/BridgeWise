"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StargateAdapter = exports.HopAdapter = exports.AcrossAdapter = void 0;
const common_1 = require("@nestjs/common");
let AcrossAdapter = class AcrossAdapter {
    constructor() {
        this.name = 'Across';
        this.SUPPORTED_ROUTES = [
            [1, 137, ['USDC', 'USDT', 'WETH', 'DAI']],
            [1, 42161, ['USDC', 'USDT', 'WETH']],
            [1, 10, ['USDC', 'USDT', 'WETH']],
            [137, 1, ['USDC', 'USDT', 'WETH']],
        ];
    }
    supportsRoute(fromChain, toChain, token) {
        return this.SUPPORTED_ROUTES.some(([from, to, tokens]) => from === fromChain && to === toChain && tokens.includes(token));
    }
    async getQuote(request) {
        // Simulate network call with realistic latency
        await this.simulateLatency(300, 800);
        const amount = parseFloat(request.amount);
        const feeRate = 0.0005; // 0.05%
        const relayerFee = amount * 0.001;
        const totalFeeUSD = amount * feeRate + relayerFee;
        const outputAmount = (amount - totalFeeUSD).toFixed(6);
        return {
            bridgeName: this.name,
            totalFeeUSD: parseFloat(totalFeeUSD.toFixed(4)),
            feeToken: request.token,
            estimatedArrivalTime: 120, // ~2 min via optimistic relay
            outputAmount,
            supported: true,
        };
    }
    simulateLatency(minMs, maxMs) {
        const delay = minMs + Math.random() * (maxMs - minMs);
        return new Promise((resolve) => setTimeout(resolve, delay));
    }
};
exports.AcrossAdapter = AcrossAdapter;
exports.AcrossAdapter = AcrossAdapter = __decorate([
    (0, common_1.Injectable)()
], AcrossAdapter);
/**
 * Hop Protocol Adapter
 * AMM-based bridging, moderate speed and fees.
 */
let HopAdapter = class HopAdapter {
    constructor() {
        this.name = 'Hop';
        this.SUPPORTED_ROUTES = [
            [1, 137, ['USDC', 'USDT', 'DAI', 'MATIC']],
            [1, 42161, ['USDC', 'USDT', 'ETH']],
            [1, 10, ['USDC', 'USDT', 'ETH', 'SNX']],
            [137, 42161, ['USDC', 'USDT']],
        ];
    }
    supportsRoute(fromChain, toChain, token) {
        return this.SUPPORTED_ROUTES.some(([from, to, tokens]) => from === fromChain && to === toChain && tokens.includes(token));
    }
    async getQuote(request) {
        await this.simulateLatency(400, 1000);
        const amount = parseFloat(request.amount);
        const lpFee = amount * 0.001; // 0.1% LP fee
        const bonderFee = amount * 0.0015;
        const gasCost = 2.5; // USD
        const totalFeeUSD = lpFee + bonderFee + gasCost;
        const outputAmount = (amount - totalFeeUSD).toFixed(6);
        return {
            bridgeName: this.name,
            totalFeeUSD: parseFloat(totalFeeUSD.toFixed(4)),
            feeToken: request.token,
            estimatedArrivalTime: 300, // ~5 min
            outputAmount,
            supported: true,
        };
    }
    simulateLatency(minMs, maxMs) {
        const delay = minMs + Math.random() * (maxMs - minMs);
        return new Promise((resolve) => setTimeout(resolve, delay));
    }
};
exports.HopAdapter = HopAdapter;
exports.HopAdapter = HopAdapter = __decorate([
    (0, common_1.Injectable)()
], HopAdapter);
/**
 * Stargate (LayerZero) Adapter
 * Deep liquidity pools, good for large amounts.
 */
let StargateAdapter = class StargateAdapter {
    constructor() {
        this.name = 'Stargate';
        this.SUPPORTED_ROUTES = [
            [1, 137, ['USDC', 'USDT']],
            [1, 42161, ['USDC', 'USDT', 'ETH']],
            [1, 43114, ['USDC', 'USDT']],
            [137, 43114, ['USDC']],
            [42161, 10, ['USDC', 'ETH']],
        ];
    }
    supportsRoute(fromChain, toChain, token) {
        return this.SUPPORTED_ROUTES.some(([from, to, tokens]) => from === fromChain && to === toChain && tokens.includes(token));
    }
    async getQuote(request) {
        await this.simulateLatency(500, 1200);
        const amount = parseFloat(request.amount);
        const protocolFee = amount * 0.0006; // 0.06%
        const lzFee = 1.8; // LayerZero messaging fee in USD
        const totalFeeUSD = protocolFee + lzFee;
        const outputAmount = (amount - totalFeeUSD).toFixed(6);
        return {
            bridgeName: this.name,
            totalFeeUSD: parseFloat(totalFeeUSD.toFixed(4)),
            feeToken: request.token,
            estimatedArrivalTime: 600, // ~10 min
            outputAmount,
            supported: true,
        };
    }
    simulateLatency(minMs, maxMs) {
        const delay = minMs + Math.random() * (maxMs - minMs);
        return new Promise((resolve) => setTimeout(resolve, delay));
    }
};
exports.StargateAdapter = StargateAdapter;
exports.StargateAdapter = StargateAdapter = __decorate([
    (0, common_1.Injectable)()
], StargateAdapter);
//# sourceMappingURL=bridge.adapters.js.map