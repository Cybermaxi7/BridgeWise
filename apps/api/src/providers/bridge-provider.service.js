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
var BridgeProviderService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BridgeProviderService = exports.EVMBridgeProvider = exports.StellarBridgeProvider = void 0;
const common_1 = require("@nestjs/common");
let StellarBridgeProvider = class StellarBridgeProvider {
    constructor() {
        this.name = 'StellarBridge';
        this.type = 'stellar';
        this.SUPPORTED_ASSETS = ['USDC', 'XLM', 'yXLM'];
        this.STELLAR_CHAIN_ID = 1001;
    }
    supportsRoute(fromChain, toChain, token) {
        return ((fromChain === this.STELLAR_CHAIN_ID || toChain === this.STELLAR_CHAIN_ID) &&
            this.SUPPORTED_ASSETS.includes(token));
    }
    async getQuote(fromChain, toChain, token, amount) {
        if (!this.supportsRoute(fromChain, toChain, token)) {
            return {
                bridgeName: this.name,
                fromChain,
                toChain,
                token,
                inputAmount: amount,
                outputAmount: 0,
                totalFeeUSD: 0,
                estimatedTimeSeconds: 0,
                supported: false,
                error: 'Route not supported',
            };
        }
        const feeRate = 0.0003; // Stellar base fee is very low
        const totalFeeUSD = Math.max(amount * feeRate, 0.001);
        const outputAmount = amount - totalFeeUSD;
        return {
            bridgeName: this.name,
            fromChain,
            toChain,
            token,
            inputAmount: amount,
            outputAmount: parseFloat(outputAmount.toFixed(6)),
            totalFeeUSD: parseFloat(totalFeeUSD.toFixed(4)),
            estimatedTimeSeconds: 5,
            supported: true,
        };
    }
};
exports.StellarBridgeProvider = StellarBridgeProvider;
exports.StellarBridgeProvider = StellarBridgeProvider = __decorate([
    (0, common_1.Injectable)()
], StellarBridgeProvider);
let EVMBridgeProvider = class EVMBridgeProvider {
    constructor() {
        this.name = 'EVMBridge';
        this.type = 'evm';
        this.SUPPORTED_ROUTES = [
            [1, 137, ['USDC', 'USDT', 'WETH', 'DAI']],
            [1, 42161, ['USDC', 'USDT', 'WETH']],
            [1, 10, ['USDC', 'USDT', 'WETH']],
            [137, 42161, ['USDC', 'USDT']],
            [42161, 10, ['USDC', 'ETH']],
            [1, 8453, ['USDC', 'WETH']],
        ];
    }
    supportsRoute(fromChain, toChain, token) {
        return this.SUPPORTED_ROUTES.some(([from, to, tokens]) => from === fromChain && to === toChain && tokens.includes(token));
    }
    async getQuote(fromChain, toChain, token, amount) {
        if (!this.supportsRoute(fromChain, toChain, token)) {
            return {
                bridgeName: this.name,
                fromChain,
                toChain,
                token,
                inputAmount: amount,
                outputAmount: 0,
                totalFeeUSD: 0,
                estimatedTimeSeconds: 0,
                supported: false,
                error: 'Route not supported',
            };
        }
        const gasFeeUSD = 2.5;
        const protocolFee = amount * 0.0005;
        const totalFeeUSD = gasFeeUSD + protocolFee;
        const outputAmount = amount - totalFeeUSD;
        return {
            bridgeName: this.name,
            fromChain,
            toChain,
            token,
            inputAmount: amount,
            outputAmount: parseFloat(outputAmount.toFixed(6)),
            totalFeeUSD: parseFloat(totalFeeUSD.toFixed(4)),
            estimatedTimeSeconds: 180,
            supported: true,
        };
    }
};
exports.EVMBridgeProvider = EVMBridgeProvider;
exports.EVMBridgeProvider = EVMBridgeProvider = __decorate([
    (0, common_1.Injectable)()
], EVMBridgeProvider);
let BridgeProviderService = BridgeProviderService_1 = class BridgeProviderService {
    constructor(stellarProvider, evmProvider) {
        this.stellarProvider = stellarProvider;
        this.evmProvider = evmProvider;
        this.logger = new common_1.Logger(BridgeProviderService_1.name);
        this.providers = new Map();
        this.register(stellarProvider);
        this.register(evmProvider);
    }
    register(provider) {
        this.providers.set(provider.name, provider);
        this.logger.log(`Registered provider: ${provider.name} (${provider.type})`);
    }
    getProvider(name) {
        const provider = this.providers.get(name);
        if (!provider) {
            throw new common_1.NotFoundException(`Bridge provider "${name}" not found`);
        }
        return provider;
    }
    listProviders() {
        return Array.from(this.providers.values());
    }
    async getQuotesForRoute(fromChain, toChain, token, amount) {
        const supported = this.listProviders().filter((p) => p.supportsRoute(fromChain, toChain, token));
        const quotes = await Promise.all(supported.map((p) => p.getQuote(fromChain, toChain, token, amount)));
        return quotes.filter((q) => q.supported);
    }
    normalize(quotes) {
        return quotes.sort((a, b) => a.totalFeeUSD - b.totalFeeUSD);
    }
};
exports.BridgeProviderService = BridgeProviderService;
exports.BridgeProviderService = BridgeProviderService = BridgeProviderService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [StellarBridgeProvider,
        EVMBridgeProvider])
], BridgeProviderService);
//# sourceMappingURL=bridge-provider.service.js.map