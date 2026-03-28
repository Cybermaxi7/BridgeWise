/**
 * @bridgewise/bridge-core
 *
 * Central aggregation logic for multi-chain bridge route discovery.
 * Provides a unified interface to query routes from multiple bridge providers
 * including Stellar/Soroban, LayerZero, and Hop Protocol.
 */

import { BridgeAggregator } from './aggregator';
import type { RouteRequest } from './types';
import type { RankingWeights } from './ranker';

// Types
export * from './types';

// Adapters
export type { BridgeAdapter } from './adapters/base';
export { BaseBridgeAdapter } from './adapters/base';
export { HopAdapter } from './adapters/hop';
export { LayerZeroAdapter } from './adapters/layerzero';
export { StellarAdapter } from './adapters/stellar';
export { MockBridgeAdapter, createMockAdapter } from './adapters/mock';
export type { MockAdapterConfig } from './adapters/mock';

// Fee Estimation
export * from './fee-estimation';

// Benchmarking
export * from './benchmark';

// Error Codes and Mapping (Legacy)
export * from './error-codes';

// SDK Error Codes (Standardized)
export {
  SDKError,
  SDKErrorCode,
  SDKErrorCategory,
  SDKErrorSeverity,
  SDKErrors,
  SDK_ERROR_METADATA,
  isSDKError,
  isSDKErrorCode,
  isSDKErrorCategory,
  isRetryableError,
  toSDKError,
  fromLegacyErrorCode,
  LEGACY_BRIDGE_ERROR_MAP,
  LEGACY_ADAPTER_ERROR_MAP,
} from './sdk-errors';
export type {
  SDKErrorMetadata,
  SDKErrorDetails,
} from './sdk-errors';

// Aggregator
export { BridgeAggregator } from './aggregator';
export type { AggregatorConfig } from './aggregator';

// Route Ranker
export { RouteRanker, DEFAULT_RANKING_WEIGHTS } from './ranker';
export type { RankingWeights } from './ranker';

// Validator
export { BridgeValidator } from './validator';
export type {
  ValidationError,
  ValidationResult,
  BridgeExecutionRequest,
} from './validator';

// Fallback Route Executor
export {
  FallbackRouteExecutor,
  FallbackExecutionError,
  FallbackErrorCode,
  createFallbackExecutor,
} from './fallback-executor';
export type {
  FallbackExecutorConfig,
  FallbackExecutionStatus,
  FallbackStatusCallback,
  ExecutionResult,
  RouteExecutorFn,
} from './fallback-executor';

// Unified Adapter System
export * from './unified-adapter';

// Token Pair Compatibility Engine
export * from './compatibility';

/**
 * Main function to get aggregated bridge routes
 *
 * @example
 * ```typescript
 * import { getBridgeRoutes } from '@bridgewise/bridge-core';
 *
 * const routes = await getBridgeRoutes({
 *   sourceChain: 'ethereum',
 *   targetChain: 'polygon',
 *   assetAmount: '1000000000000000000', // 1 ETH in wei
 *   slippageTolerance: 0.5
 * }, {
 *   rankingWeights: {
 *     costWeight: 0.5,      // Prioritize cheaper routes
 *     latencyWeight: 0.3,   // Consider speed
 *     reliabilityWeight: 0.2 // Consider reliability
 *   }
 * });
 *
 * console.log(`Found ${routes.routes.length} routes`);
 * routes.routes.forEach(route => {
 *   console.log(`${route.provider}: ${route.feePercentage}% fee, ${route.estimatedTime}s, reliability: ${route.reliability}`);
 * });
 * ```
 */
export async function getBridgeRoutes(
  request: RouteRequest,
  config?: {
    providers?: {
      hop?: boolean;
      layerzero?: boolean;
      stellar?: boolean;
    };
    layerZeroApiKey?: string;
    timeout?: number;
    rankingWeights?: RankingWeights;
  },
) {
  const aggregator = new BridgeAggregator(config);
  return aggregator.getRoutes(request);
}

// Default export
export default {
  BridgeAggregator,
  getBridgeRoutes,
};
