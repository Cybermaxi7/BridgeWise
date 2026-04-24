"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var BridgeFeeAdapter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BridgeFeeAdapter = void 0;
const common_1 = require("@nestjs/common");
/**
 * Bridge Fee Adapter
 *
 * Provides fee configurations and calculations for different bridge protocols.
 * Supports both static and dynamic fee structures.
 */
let BridgeFeeAdapter = BridgeFeeAdapter_1 = class BridgeFeeAdapter {
    constructor() {
        this.logger = new common_1.Logger(BridgeFeeAdapter_1.name);
        // Bridge fee configurations
        this.bridgeConfigs = {
            hop: {
                bridgeName: 'hop',
                baseFee: 0,
                percentageFee: 0.0004, // 0.04%
                minFee: 0.0001,
                maxFee: 10,
                supportsDynamicFees: true,
                feeToken: 'ETH',
            },
            across: {
                bridgeName: 'across',
                baseFee: 0,
                percentageFee: 0.0006, // 0.06%
                minFee: 0.0001,
                maxFee: 10,
                supportsDynamicFees: true,
                feeToken: 'ETH',
            },
            stargate: {
                bridgeName: 'stargate',
                baseFee: 0.0001,
                percentageFee: 0.0006, // 0.06%
                minFee: 0.0001,
                maxFee: 100,
                supportsDynamicFees: true,
                feeToken: 'ETH',
            },
            cctp: {
                bridgeName: 'cctp',
                baseFee: 0,
                percentageFee: 0,
                minFee: 0,
                maxFee: 0,
                supportsDynamicFees: false,
                feeToken: 'ETH',
            },
            synapse: {
                bridgeName: 'synapse',
                baseFee: 0,
                percentageFee: 0.001, // 0.1%
                minFee: 0.0005,
                maxFee: 50,
                supportsDynamicFees: true,
                feeToken: 'ETH',
            },
            connext: {
                bridgeName: 'connext',
                baseFee: 0,
                percentageFee: 0.0005, // 0.05%
                minFee: 0.0001,
                maxFee: 10,
                supportsDynamicFees: true,
                feeToken: 'ETH',
            },
            layerzero: {
                bridgeName: 'layerzero',
                baseFee: 0.0001,
                percentageFee: 0,
                minFee: 0.0001,
                maxFee: 1,
                supportsDynamicFees: true,
                feeToken: 'ETH',
            },
            axelar: {
                bridgeName: 'axelar',
                baseFee: 0.0001,
                percentageFee: 0.0001,
                minFee: 0.0001,
                maxFee: 5,
                supportsDynamicFees: true,
                feeToken: 'ETH',
            },
            wormhole: {
                bridgeName: 'wormhole',
                baseFee: 0,
                percentageFee: 0,
                minFee: 0,
                maxFee: 0,
                supportsDynamicFees: false,
                feeToken: 'ETH',
            },
        };
        // Chain-specific fee adjustments
        this.chainAdjustments = {
            ethereum: 1.0,
            polygon: 0.01,
            arbitrum: 0.5,
            optimism: 0.5,
            base: 0.5,
            bsc: 0.3,
            avalanche: 0.8,
            fantom: 0.2,
            gnosis: 0.1,
            scroll: 0.5,
            linea: 0.5,
            zksync: 0.5,
            zkevm: 0.5,
        };
    }
    /**
     * Get bridge fee configuration
     */
    getBridgeConfig(bridgeName) {
        return this.bridgeConfigs[bridgeName.toLowerCase()] || null;
    }
    /**
     * Calculate bridge fee
     */
    calculateBridgeFee(bridgeName, amount, sourceChain) {
        const config = this.getBridgeConfig(bridgeName);
        if (!config) {
            this.logger.warn(`No fee config for bridge: ${bridgeName}`);
            return { bridgeFee: 0, protocolFee: 0 };
        }
        // Apply chain adjustment
        const adjustment = this.chainAdjustments[sourceChain.toLowerCase()] || 1.0;
        // Calculate percentage fee
        let fee = config.baseFee + amount * config.percentageFee;
        // Apply min/max bounds
        fee = Math.max(config.minFee, Math.min(config.maxFee, fee));
        // Apply chain adjustment
        fee *= adjustment;
        // Split into bridge fee and protocol fee (80/20 split)
        const bridgeFee = fee * 0.8;
        const protocolFee = fee * 0.2;
        return { bridgeFee, protocolFee };
    }
    /**
     * Calculate liquidity-based fee
     */
    calculateLiquidityFee(amount, poolLiquidity, feeTier = 0.003) {
        if (poolLiquidity <= 0)
            return 0;
        // Calculate price impact
        const priceImpact = amount / (poolLiquidity + amount);
        // Fee increases with price impact
        const impactMultiplier = 1 + priceImpact * 10;
        return amount * feeTier * impactMultiplier;
    }
    /**
     * Get supported bridges
     */
    getSupportedBridges() {
        return Object.keys(this.bridgeConfigs);
    }
    /**
     * Check if bridge supports dynamic fees
     */
    supportsDynamicFees(bridgeName) {
        const config = this.getBridgeConfig(bridgeName);
        return config?.supportsDynamicFees || false;
    }
    /**
     * Get fee token for bridge
     */
    getFeeToken(bridgeName) {
        const config = this.getBridgeConfig(bridgeName);
        return config?.feeToken || 'ETH';
    }
    /**
     * Estimate total bridge cost including all fees
     */
    estimateTotalBridgeCost(bridgeName, amount, sourceChain, poolLiquidity) {
        const { bridgeFee, protocolFee } = this.calculateBridgeFee(bridgeName, amount, sourceChain);
        const liquidityFee = poolLiquidity
            ? this.calculateLiquidityFee(amount, poolLiquidity)
            : 0;
        return {
            bridgeFee,
            protocolFee,
            liquidityFee,
            totalFee: bridgeFee + protocolFee + liquidityFee,
        };
    }
    /**
     * Update bridge configuration (for dynamic updates)
     */
    updateBridgeConfig(bridgeName, updates) {
        const normalizedName = bridgeName.toLowerCase();
        if (this.bridgeConfigs[normalizedName]) {
            this.bridgeConfigs[normalizedName] = {
                ...this.bridgeConfigs[normalizedName],
                ...updates,
            };
            this.logger.log(`Updated fee config for ${bridgeName}`);
        }
    }
    /**
     * Add new bridge configuration
     */
    addBridgeConfig(config) {
        this.bridgeConfigs[config.bridgeName.toLowerCase()] = config;
        this.logger.log(`Added fee config for ${config.bridgeName}`);
    }
};
exports.BridgeFeeAdapter = BridgeFeeAdapter;
exports.BridgeFeeAdapter = BridgeFeeAdapter = BridgeFeeAdapter_1 = __decorate([
    (0, common_1.Injectable)()
], BridgeFeeAdapter);
//# sourceMappingURL=bridge-fee.adapter.js.map