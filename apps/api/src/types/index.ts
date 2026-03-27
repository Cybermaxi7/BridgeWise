/**
 * BridgeWise TypeScript Type Definitions
 * 
 * Central type exports for the entire BridgeWise SDK
 * All public API types should be exported from here
 */

// ============================================================================
// Core Types
// ============================================================================

/**
 * Chain identifier
 */
export type ChainId = number;

/**
 * Token symbol (e.g., 'USDC', 'ETH', 'USDT')
 */
export type TokenSymbol = string;

/**
 * Token contract address (EVM format: 0x...)
 */
export type TokenAddress = string;

/**
 * Bridge name (e.g., 'Stargate', 'LayerZero', 'Hop')
 */
export type BridgeName = string;

/**
 * Chain name (e.g., 'ethereum', 'polygon', 'arbitrum')
 */
export type ChainName = string;

/**
 * Transaction status
 */
export type TransactionStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'partial';

/**
 * Reliability tier
 */
export type ReliabilityTier = 'excellent' | 'good' | 'fair' | 'poor';

/**
 * Event types for tracking
 */
export type TrackingEventType = 
  | 'quote_requested'
  | 'quote_viewed'
  | 'quote_executed'
  | 'transaction_started'
  | 'transaction_confirmed'
  | 'transaction_failed';

/**
 * Ranking mode for quotes
 */
export type RankingMode = 'cost' | 'speed' | 'score' | 'balanced';

// ============================================================================
// Interface Types
// ============================================================================

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  timestamp: string;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Pagination response
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Time range for queries
 */
export interface TimeRange {
  startDate: string;
  endDate: string;
}

/**
 * Query parameters for analytics
 */
export interface AnalyticsQueryParams extends TimeRange {
  bridgeName?: BridgeName;
  sourceChain?: ChainName;
  destinationChain?: ChainName;
  token?: TokenSymbol;
  page?: number;
  limit?: number;
}

/**
 * Bridge route parameters
 */
export interface BridgeRouteParams {
  sourceChain: ChainName;
  destinationChain: ChainName;
  sourceToken: TokenSymbol;
  destinationToken?: TokenSymbol;
  amount: string | number;
}

/**
 * Fee breakdown
 */
export interface FeeBreakdown {
  protocolFee: number;
  gasFee: number;
  totalFee: number;
  feeToken: TokenSymbol;
}

/**
 * Quote parameters
 */
export interface QuoteParams extends BridgeRouteParams {
  slippageTolerance?: number;
  rankingMode?: RankingMode;
}

/**
 * Normalized quote response
 */
export interface Quote {
  id: string;
  bridgeId: string;
  bridgeName: string;
  sourceChain: ChainName;
  destinationChain: ChainName;
  sourceToken: TokenSymbol;
  destinationToken: TokenSymbol;
  inputAmount: string;
  outputAmount: string;
  totalFeeUsd: number;
  estimatedTimeSeconds: number;
  slippagePercent: number;
  reliabilityScore: number;
  compositeScore: number;
  bridgeStatus: 'active' | 'degraded' | 'inactive';
  metadata?: {
    feesBreakdown?: FeeBreakdown;
    steps?: string[];
  };
  fetchedAt: Date | string;
}

/**
 * Slippage tolerance configuration
 */
export interface SlippageConfig {
  min: number;
  max: number;
  default: number;
  step: number;
}

/**
 * Chain configuration
 */
export interface ChainConfig {
  id: ChainId;
  name: ChainName;
  chainId: number;
  isTestnet: boolean;
  nativeToken: TokenSymbol;
  explorerUrl?: string;
  rpcUrl?: string;
}

/**
 * Token configuration
 */
export interface TokenConfig {
  symbol: TokenSymbol;
  address: TokenAddress;
  decimals: number;
  chainId: ChainId;
  logoUrl?: string;
  isNative: boolean;
}

/**
 * Bridge configuration
 */
export interface BridgeConfig {
  name: BridgeName;
  supportedChains: ChainName[];
  supportedTokens: TokenSymbol[];
  isActive: boolean;
  feeToken: TokenSymbol;
  supportsDynamicFees: boolean;
}

/**
 * Reliability score
 */
export interface ReliabilityScore {
  score: number;
  tier: ReliabilityTier;
  windowMode: 'rolling' | 'cumulative';
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  lastUpdated: Date | string;
}

/**
 * Gas estimation
 */
export interface GasEstimate {
  gasPrice: string;
  gasLimit: number;
  totalFee: string;
  feeToken: TokenSymbol;
  isFallback: boolean;
  breakdown?: {
    baseFee: string;
    priorityFee: string;
    lpFee?: string;
    bonderFee?: string;
  };
}

/**
 * Tracking event
 */
export interface TrackingEvent {
  type: TrackingEventType;
  sessionId: string;
  timestamp: Date | string;
  data: Record<string, unknown>;
}

/**
 * Benchmark result
 */
export interface BenchmarkResult {
  bridgeName: BridgeName;
  sourceChain: ChainName;
  destinationChain: ChainName;
  token: TokenSymbol;
  avgDurationMs: number;
  successRate: number;
  totalTransfers: number;
  avgFee: number;
  sampleSize: number;
}

/**
 * Slippage alert
 */
export interface SlippageAlert {
  bridge: BridgeName;
  routeId: string;
  expectedSlippage: number;
  actualSlippage: number;
  threshold: number;
  timestamp: Date | string;
}

// ============================================================================
// Token Metadata Types (from token-metadata module)
// ============================================================================

/**
 * Token metadata
 */
export interface TokenMetadata {
  address: string;
  chainId: number;
  name: string;
  symbol: string;
  decimals: number;
  logoUrl: string | null;
  price?: number;
  marketCap?: number;
  lastUpdated: Date | string;
}

/**
 * Token metadata request
 */
export interface TokenMetadataRequest {
  chainId: number;
  address: string;
}

// ============================================================================
// Abandonment Tracking Types (from analytics module)
// ============================================================================

/**
 * Abandonment metrics
 */
export interface AbandonmentMetrics {
  totalQuotesRequested: number;
  totalQuotesExecuted: number;
  abandonmentRate: number;
  avgTimeToExecute?: number;
  byBridge?: Record<string, AbandonmentMetrics>;
  byChain?: Record<string, AbandonmentMetrics>;
  byToken?: Record<string, AbandonmentMetrics>;
}

/**
 * Abandonment event
 */
export interface AbandonmentEvent {
  eventType: 'quote_requested' | 'quote_executed';
  sessionId: string;
  quoteId?: string;
  bridgeName?: string;
  sourceChain: string;
  destinationChain: string;
  sourceToken: string;
  destinationToken: string;
  amount: string;
  timestamp: string;
}

// ============================================================================
// Heatmap Types (from analytics module)
// ============================================================================

/**
 * Heatmap cell data
 */
export interface HeatmapCell {
  sourceChain: string;
  destinationChain: string;
  bridgeName?: string;
  value: number;
  label?: string;
  metadata?: {
    volume?: number;
    successRate?: number;
    avgTime?: number;
    transactionCount?: number;
  };
}

/**
 * Heatmap row (source chain)
 */
export interface HeatmapRow {
  sourceChain: string;
  cells: HeatmapCell[];
}

/**
 * Complete heatmap data
 */
export interface HeatmapData {
  rows: HeatmapRow[];
  columns: string[];
  bridges: string[];
  timeRange: {
    start: string;
    end: string;
  };
  generatedAt: string;
}

/**
 * Bridge breakdown for chain pair
 */
export interface BridgeBreakdown {
  bridgeName: string;
  transfers: number;
  volume: number;
  successRate: number;
}

// ============================================================================
// Helper Type Functions
// ============================================================================

/**
 * Make specific properties optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make specific properties required
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * Extract string keys from object
 */
export type KeysOfType<T, V> = { [K in keyof T]: T[K] extends V ? K : never }[keyof T];

/**
 * Nullable version of a type
 */
export type Nullable<T> = T | null;

/**
 * Optional version of a type  
 */
export type Optional<T> = T | undefined;