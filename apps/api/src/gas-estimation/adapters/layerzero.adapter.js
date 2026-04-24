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
var LayerZeroAdapter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LayerZeroAdapter = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
let LayerZeroAdapter = LayerZeroAdapter_1 = class LayerZeroAdapter {
    constructor(httpService, configService) {
        this.httpService = httpService;
        this.configService = configService;
        this.logger = new common_1.Logger(LayerZeroAdapter_1.name);
        this.baseUrl = this.configService.get('LAYERZERO_API_URL', 'https://api.layerzero.network');
        this.timeoutMs = this.configService.get('ADAPTER_TIMEOUT', 5000);
        this.retryAttempts = this.configService.get('ADAPTER_RETRY', 3);
        this.defaultSourceChain = this.configService.get('LAYERZERO_SOURCE_CHAIN', 'ethereum');
        this.defaultDestinationChain = this.configService.get('LAYERZERO_DESTINATION_CHAIN', 'arbitrum');
    }
    async getFees(sourceChain, destinationChain) {
        const source = sourceChain || this.defaultSourceChain;
        const destination = destinationChain || this.defaultDestinationChain;
        for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
            try {
                // LayerZero typically requires estimating fees for a specific route
                const response = await (0, rxjs_1.firstValueFrom)(this.httpService
                    .get(`${this.baseUrl}/v1/estimate`, {
                    params: {
                        source,
                        destination,
                    },
                })
                    .pipe((0, rxjs_1.timeout)(this.timeoutMs), (0, rxjs_1.catchError)((error) => {
                    this.logger.error(`LayerZero API error (attempt ${attempt}/${this.retryAttempts}):`, error.message);
                    throw error;
                })));
                return this.transformResponse(response.data, source, destination);
            }
            catch (error) {
                if (attempt === this.retryAttempts) {
                    // Fallback to default values if API is unavailable
                    this.logger.warn('Using LayerZero fallback values');
                    return this.getFallbackFees(source, destination);
                }
                await this.delay(Math.pow(2, attempt) * 100);
            }
        }
        return this.getFallbackFees(source, destination);
    }
    transformResponse(data, sourceChain, destinationChain) {
        // LayerZero fees are typically in wei (18 decimals for ETH)
        return {
            baseFee: data.nativeFee || data.baseFee || '100000000000000',
            standardFee: data.nativeFee || data.standardFee || '150000000000000',
            priorityFee: data.priorityFee || '200000000000000',
            decimals: 18, // Most LayerZero fees are in native gas tokens (ETH-like)
            symbol: this.getSymbolForChain(sourceChain),
            sourceChain,
            destinationChain,
        };
    }
    getFallbackFees(sourceChain, destinationChain) {
        return {
            baseFee: '100000000000000', // 0.0001 ETH
            standardFee: '150000000000000', // 0.00015 ETH
            priorityFee: '200000000000000', // 0.0002 ETH
            decimals: 18,
            symbol: this.getSymbolForChain(sourceChain),
            sourceChain,
            destinationChain,
        };
    }
    getSymbolForChain(chain) {
        const symbols = {
            ethereum: 'ETH',
            arbitrum: 'ETH',
            optimism: 'ETH',
            polygon: 'MATIC',
            avalanche: 'AVAX',
            bsc: 'BNB',
        };
        return symbols[chain.toLowerCase()] || 'ETH';
    }
    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
};
exports.LayerZeroAdapter = LayerZeroAdapter;
exports.LayerZeroAdapter = LayerZeroAdapter = LayerZeroAdapter_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService])
], LayerZeroAdapter);
//# sourceMappingURL=layerzero.adapter.js.map