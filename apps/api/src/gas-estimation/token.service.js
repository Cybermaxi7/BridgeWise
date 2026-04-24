"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenService = void 0;
const common_1 = require("@nestjs/common");
const bignumber_js_1 = require("bignumber.js");
let TokenService = class TokenService {
    /**
     * Normalize token amount to human-readable format
     * Handles different decimal places across networks
     */
    normalizeAmount(rawAmount, decimals) {
        try {
            const amount = new bignumber_js_1.BigNumber(rawAmount);
            const divisor = new bignumber_js_1.BigNumber(10).pow(decimals);
            const normalized = amount.dividedBy(divisor);
            // Format based on the size of the number
            if (normalized.isLessThan(0.000001)) {
                return normalized.toFixed(decimals, bignumber_js_1.BigNumber.ROUND_UP);
            }
            else if (normalized.isLessThan(0.01)) {
                return normalized.toFixed(6, bignumber_js_1.BigNumber.ROUND_UP);
            }
            else if (normalized.isLessThan(1)) {
                return normalized.toFixed(4, bignumber_js_1.BigNumber.ROUND_UP);
            }
            else {
                return normalized.toFixed(2, bignumber_js_1.BigNumber.ROUND_UP);
            }
        }
        catch (error) {
            return '0';
        }
    }
    /**
     * Convert normalized amount back to raw units
     */
    denormalizeAmount(normalizedAmount, decimals) {
        try {
            const amount = new bignumber_js_1.BigNumber(normalizedAmount);
            const multiplier = new bignumber_js_1.BigNumber(10).pow(decimals);
            return amount.multipliedBy(multiplier).toFixed(0);
        }
        catch (error) {
            return '0';
        }
    }
    /**
     * Convert between different token decimals
     */
    convertDecimals(amount, fromDecimals, toDecimals) {
        try {
            const normalized = this.normalizeAmount(amount, fromDecimals);
            return this.denormalizeAmount(normalized, toDecimals);
        }
        catch (error) {
            return '0';
        }
    }
    /**
     * Add amounts with different decimals
     */
    addAmounts(amount1, decimals1, amount2, decimals2, resultDecimals) {
        try {
            const normalized1 = new bignumber_js_1.BigNumber(amount1).dividedBy(new bignumber_js_1.BigNumber(10).pow(decimals1));
            const normalized2 = new bignumber_js_1.BigNumber(amount2).dividedBy(new bignumber_js_1.BigNumber(10).pow(decimals2));
            const sum = normalized1.plus(normalized2);
            return sum.multipliedBy(new bignumber_js_1.BigNumber(10).pow(resultDecimals)).toFixed(0);
        }
        catch (error) {
            return '0';
        }
    }
    /**
     * Format amount with currency symbol
     */
    formatWithSymbol(amount, symbol) {
        return `${amount} ${symbol}`;
    }
    /**
     * Calculate USD value if price is available
     */
    calculateUsdValue(amount, decimals, usdPrice) {
        try {
            const normalized = this.normalizeAmount(amount, decimals);
            const usdValue = new bignumber_js_1.BigNumber(normalized).multipliedBy(usdPrice);
            return usdValue.toFixed(2, bignumber_js_1.BigNumber.ROUND_DOWN);
        }
        catch (error) {
            return '0.00';
        }
    }
};
exports.TokenService = TokenService;
exports.TokenService = TokenService = __decorate([
    (0, common_1.Injectable)()
], TokenService);
//# sourceMappingURL=token.service.js.map