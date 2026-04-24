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
var FeeEstimationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeeEstimationService = void 0;
const common_1 = require("@nestjs/common");
const stellar_adapter_1 = require("./adapters/stellar.adapter");
const layerzero_adapter_1 = require("./adapters/layerzero.adapter");
const hop_adapter_1 = require("./adapters/hop.adapter");
const fees_interface_1 = require("./interfaces/fees.interface");
const token_service_1 = require("./token.service");
const audit_logger_service_1 = require("../common/logger/audit-logger.service");
let FeeEstimationService = FeeEstimationService_1 = class FeeEstimationService {
    constructor(stellarAdapter, layerZeroAdapter, hopAdapter, tokenService, auditLogger) {
        this.stellarAdapter = stellarAdapter;
        this.layerZeroAdapter = layerZeroAdapter;
        this.hopAdapter = hopAdapter;
        this.tokenService = tokenService;
        this.auditLogger = auditLogger;
        this.logger = new common_1.Logger(FeeEstimationService_1.name);
    }
    /**
     * Get fee estimates for all supported networks
     */
    async getAllFeeEstimates() {
        const estimates = await Promise.allSettled([
            this.getStellarFees(),
            this.getLayerZeroFees(),
            this.getHopFees(),
        ]);
        const stellarResult = this.extractResult(estimates[0], 'Stellar');
        const layerzeroResult = this.extractResult(estimates[1], 'LayerZero');
        const hopResult = this.extractResult(estimates[2], 'Hop');
        // Count only providers that are actually available
        const successfulProviders = [
            stellarResult,
            layerzeroResult,
            hopResult,
        ].filter((result) => result.available).length;
        return {
            timestamp: Date.now(),
            networks: {
                stellar: stellarResult,
                layerzero: layerzeroResult,
                hop: hopResult,
            },
            metadata: {
                successfulProviders,
                totalProviders: estimates.length,
            },
        };
    }
    /**
     * Get fee estimate for a specific network
     */
    async getFeeEstimate(network) {
        const startTime = Date.now();
        try {
            let result;
            switch (network) {
                case fees_interface_1.NetworkType.STELLAR:
                    result = await this.getStellarFees();
                    break;
                case fees_interface_1.NetworkType.LAYERZERO:
                    result = await this.getLayerZeroFees();
                    break;
                case fees_interface_1.NetworkType.HOP:
                    result = await this.getHopFees();
                    break;
                default:
                    throw new Error(`Unsupported network: ${network}`);
            }
            // Log successful fee estimation
            if (result.available) {
                this.auditLogger.logFeeEstimation({
                    adapter: network,
                    sourceChain: network,
                    destinationChain: network,
                    estimatedFee: result.fees?.standard || '0',
                    responseTimeMs: Date.now() - startTime,
                });
            }
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to fetch fees for ${network}:`, error.message);
            return this.createUnavailableEstimate(network, error.message);
        }
    }
    /**
     * Get Stellar network fees
     */
    async getStellarFees() {
        try {
            const rawFees = await this.stellarAdapter.getFees();
            return {
                network: fees_interface_1.NetworkType.STELLAR,
                available: true,
                fees: {
                    slow: this.tokenService.normalizeAmount(rawFees.min, rawFees.decimals),
                    standard: this.tokenService.normalizeAmount(rawFees.mode, rawFees.decimals),
                    fast: this.tokenService.normalizeAmount(rawFees.p90, rawFees.decimals),
                },
                currency: rawFees.symbol,
                estimatedTime: {
                    slow: 5000, // 5 seconds
                    standard: 5000,
                    fast: 5000,
                },
                lastUpdated: Date.now(),
            };
        }
        catch (error) {
            this.logger.error('Stellar adapter failed:', error.message);
            return this.createUnavailableEstimate(fees_interface_1.NetworkType.STELLAR, error.message);
        }
    }
    /**
     * Get LayerZero cross-chain fees
     */
    async getLayerZeroFees() {
        try {
            const rawFees = await this.layerZeroAdapter.getFees();
            return {
                network: fees_interface_1.NetworkType.LAYERZERO,
                available: true,
                fees: {
                    slow: this.tokenService.normalizeAmount(rawFees.baseFee, rawFees.decimals),
                    standard: this.tokenService.normalizeAmount(rawFees.standardFee, rawFees.decimals),
                    fast: this.tokenService.normalizeAmount(rawFees.priorityFee, rawFees.decimals),
                },
                currency: rawFees.symbol,
                estimatedTime: {
                    slow: 300000, // 5 minutes
                    standard: 180000, // 3 minutes
                    fast: 60000, // 1 minute
                },
                lastUpdated: Date.now(),
                additionalData: {
                    destinationChain: rawFees.destinationChain,
                    sourceChain: rawFees.sourceChain,
                },
            };
        }
        catch (error) {
            this.logger.error('LayerZero adapter failed:', error.message);
            return this.createUnavailableEstimate(fees_interface_1.NetworkType.LAYERZERO, error.message);
        }
    }
    /**
     * Get Hop Protocol bridge fees
     */
    async getHopFees() {
        try {
            const rawFees = await this.hopAdapter.getFees();
            return {
                network: fees_interface_1.NetworkType.HOP,
                available: true,
                fees: {
                    slow: this.tokenService.normalizeAmount(rawFees.lpFee, rawFees.decimals),
                    standard: this.tokenService.normalizeAmount(rawFees.lpFee + rawFees.bonderFee, rawFees.decimals),
                    fast: this.tokenService.normalizeAmount(rawFees.lpFee + rawFees.bonderFee + rawFees.destinationTxFee, rawFees.decimals),
                },
                currency: rawFees.symbol,
                estimatedTime: {
                    slow: 1200000, // 20 minutes
                    standard: 600000, // 10 minutes
                    fast: 300000, // 5 minutes
                },
                lastUpdated: Date.now(),
                additionalData: {
                    route: `${rawFees.sourceChain} -> ${rawFees.destinationChain}`,
                    token: rawFees.token,
                },
            };
        }
        catch (error) {
            this.logger.error('Hop adapter failed:', error.message);
            return this.createUnavailableEstimate(fees_interface_1.NetworkType.HOP, error.message);
        }
    }
    /**
     * Extract result from Promise.allSettled
     */
    extractResult(result, providerName) {
        if (result.status === 'fulfilled') {
            return result.value;
        }
        this.logger.warn(`${providerName} provider unavailable:`, result.reason?.message);
        return this.createUnavailableEstimate(providerName.toLowerCase(), result.reason?.message || 'Unknown error');
    }
    /**
     * Create unavailable estimate fallback
     */
    createUnavailableEstimate(network, error) {
        return {
            network,
            available: false,
            fees: {
                slow: '0',
                standard: '0',
                fast: '0',
            },
            currency: 'N/A',
            estimatedTime: {
                slow: 0,
                standard: 0,
                fast: 0,
            },
            lastUpdated: Date.now(),
            error,
        };
    }
};
exports.FeeEstimationService = FeeEstimationService;
exports.FeeEstimationService = FeeEstimationService = FeeEstimationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [stellar_adapter_1.StellarAdapter,
        layerzero_adapter_1.LayerZeroAdapter,
        hop_adapter_1.HopAdapter,
        token_service_1.TokenService,
        audit_logger_service_1.AuditLoggerService])
], FeeEstimationService);
//# sourceMappingURL=fee-estimation.service.js.map