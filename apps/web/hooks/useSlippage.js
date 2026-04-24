"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LOW_LIQUIDITY_THRESHOLD_USD = exports.SLIPPAGE_WARNING_THRESHOLD = void 0;
exports.useSlippage = useSlippage;
const react_1 = require("react");
exports.SLIPPAGE_WARNING_THRESHOLD = 1; // 1%
exports.LOW_LIQUIDITY_THRESHOLD_USD = 10_000; // $10,000
function useSlippage(route, transferAmount, warningThreshold = exports.SLIPPAGE_WARNING_THRESHOLD, lowLiquidityThreshold = exports.LOW_LIQUIDITY_THRESHOLD_USD) {
    return (0, react_1.useMemo)(() => {
        const defaultResult = {
            slippagePercent: 0,
            minimumReceived: '0',
            isHighSlippage: false,
            isLowLiquidity: false,
            hasWarning: false,
        };
        if (!route || !transferAmount || Number(transferAmount) <= 0) {
            return defaultResult;
        }
        const expected = parseFloat(route.expectedOutput);
        const actual = parseFloat(route.outputAmount);
        if (isNaN(expected) || isNaN(actual) || expected <= 0) {
            return defaultResult;
        }
        const slippagePercent = ((expected - actual) / expected) * 100;
        const minimumReceived = actual.toFixed(6);
        const isHighSlippage = slippagePercent > warningThreshold;
        const isLowLiquidity = route.liquidityUSD !== undefined &&
            route.liquidityUSD < lowLiquidityThreshold;
        return {
            slippagePercent: Math.max(0, slippagePercent),
            minimumReceived,
            isHighSlippage,
            isLowLiquidity,
            hasWarning: isHighSlippage || isLowLiquidity,
        };
    }, [route, transferAmount, warningThreshold, lowLiquidityThreshold]);
}
//# sourceMappingURL=useSlippage.js.map