export interface Route {
  fromChainId: number;
  toChainId: number;
  fromTokenAddress: string;
  toTokenAddress: string;
  amountIn: string; // in wei or smallest unit
  amountOutMin: string; // minimum output amount
  // other route details...
}

export interface SlippageEstimate {
  slippagePercentage: number; // slippage as a percentage (e.g., 0.5 for 0.5%)
  estimatedLoss: string; // estimated loss in output token amount (in wei or smallest unit)
  expectedOutput: string; // expected output amount without slippage
}

/**
 * Calculate slippage for a given route.
 * This is a simplified model. In production, you might want to use more sophisticated
 * models based on pool liquidity, token volatility, etc.
 */
export function calculateSlippage(route: Route): SlippageEstimate {
  // Convert string amounts to numbers for calculation
  const amountIn = BigInt(route.amountIn);
  const amountOutMin = BigInt(route.amountOutMin);

  // Expected output is the amountOutMin plus some slippage tolerance? Actually,
  // amountOutMin is the minimum amount the user is willing to accept.
  // Slippage can be calculated as: (expectedOutput - amountOutMin) / expectedOutput * 100
  // But we don't have expectedOutput directly.
  // For simplicity, let's assume the expected output is based on a constant product formula
  // or we can get it from a quote. Since we don't have that, we'll use a placeholder.

  // In a real implementation, you would fetch the expected output from a pricing service
  // or from the route data provided by the bridge aggregator.
  // For now, we'll simulate an expected output as amountIn * (some price) and then
  // calculate slippage based on the difference between expected and amountOutMin.

  // Placeholder: assume 1:1 price for simplicity (not realistic but for demonstration)
  const expectedOutput = amountIn; // 1:1 ratio

  // Slippage percentage = ((expectedOutput - amountOutMin) / expectedOutput) * 100
  const slippageBN = ((expectedOutput - amountOutMin) * 100n) / expectedOutput;
  const slippagePercentage = Number(slippageBN) / 100; // Convert to decimal percentage (e.g., 0.5 for 0.5%)

  // Estimated loss in output token amount
  const estimatedLossBN = expectedOutput - amountOutMin;
  const estimatedLoss = estimatedLossBN.toString();

  return {
    slippagePercentage,
    estimatedLoss,
    expectedOutput: expectedOutput.toString(),
  };
}

/**
 * Format slippage percentage for display (e.g., 0.5%).
 */
export function formatSlippagePercentage(slippagePercentage: number): string {
  return `${slippagePercentage.toFixed(2)}%`;
}

/**
 * Format estimated loss for display (in token units, not wei).
 * Assumes we have decimals info; without it, we just show the raw amount.
 */
export function formatEstimatedLoss(
  estimatedLoss: string,
  decimals = 18,
): string {
  // Convert from wei to token units
  const lossBN = BigInt(estimatedLoss);
  const divisor = BigInt(10 ** decimals);
  const lossInTokens = lossBN / divisor;
  const remainder = lossBN % divisor;
  // Format with fixed decimal places
  const fraction = remainder
    .toString()
    .padStart(decimals, '0')
    .slice(0, decimals);
  return `${lossInTokens}.${fraction}`;
}
