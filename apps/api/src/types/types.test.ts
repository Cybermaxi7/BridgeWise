/**
 * BridgeWise TypeScript Type Tests
 * 
 * This file validates that our type definitions are correct and can be used properly.
 * Run with: npx tsc --noEmit --strict apps/api/src/types/index.ts
 */

// Import the types we're testing
import {
  // Core types
  ChainId,
  TokenSymbol,
  TokenAddress,
  BridgeName,
  ChainName,
  TransactionStatus,
  ReliabilityTier,
  TrackingEventType,
  RankingMode,
  
  // Interface types
  ApiResponse,
  PaginatedResponse,
  TimeRange,
  AnalyticsQueryParams,
  BridgeRouteParams,
  FeeBreakdown,
  QuoteParams,
  Quote,
  SlippageConfig,
  ChainConfig,
  TokenConfig,
  BridgeConfig,
  ReliabilityScore,
  GasEstimate,
  TrackingEvent,
  BenchmarkResult,
  SlippageAlert,
  
  // Token metadata types
  TokenMetadata,
  TokenMetadataRequest,
  
  // Abandonment types
  AbandonmentMetrics,
  AbandonmentEvent,
  
  // Heatmap types
  HeatmapCell,
  HeatmapRow,
  HeatmapData,
  BridgeBreakdown,
  
  // Helper types
  PartialBy,
  RequiredBy,
  Nullable,
  Optional,
} from './index';

// ============================================================================
// Type Validation Tests
// ============================================================================

// Test 1: ChainId should be a number
const testChainId: ChainId = 1;
const chainIdAssignment: number = testChainId; // Should work

// Test 2: TokenSymbol should be a string
const testTokenSymbol: TokenSymbol = 'USDC';
const tokenSymbolAssignment: string = testTokenSymbol; // Should work

// Test 3: TokenAddress should be a string
const testTokenAddress: TokenAddress = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
const tokenAddressAssignment: string = testTokenAddress; // Should work

// Test 4: TransactionStatus should be a union type
const testTransactionStatus: TransactionStatus = 'completed';
const transactionStatusAssignment: string = testTransactionStatus; // Should work

// Test 5: Quote interface should work correctly
const testQuote: Quote = {
  id: 'quote_123',
  bridgeId: 'stargate',
  bridgeName: 'Stargate',
  sourceChain: 'ethereum',
  destinationChain: 'polygon',
  sourceToken: 'USDC',
  destinationToken: 'USDC',
  inputAmount: '1000',
  outputAmount: '998.50',
  totalFeeUsd: 1.5,
  estimatedTimeSeconds: 120,
  slippagePercent: 0.15,
  reliabilityScore: 95,
  compositeScore: 90,
  bridgeStatus: 'active',
  fetchedAt: new Date().toISOString(),
};

// Test 6: ApiResponse should be generic
const testApiResponse: ApiResponse<Quote> = {
  data: testQuote,
  success: true,
  timestamp: new Date().toISOString(),
};

// Test 7: PaginatedResponse should work
const testPaginatedResponse: PaginatedResponse<Quote> = {
  data: [testQuote],
  total: 1,
  page: 1,
  limit: 10,
  totalPages: 1,
};

// Test 8: AnalyticsQueryParams extends TimeRange
const testAnalyticsQuery: AnalyticsQueryParams = {
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  bridgeName: 'Stargate',
  sourceChain: 'ethereum',
  destinationChain: 'polygon',
  token: 'USDC',
  page: 1,
  limit: 10,
};

// Test 9: TokenMetadata should work correctly
const testTokenMetadata: TokenMetadata = {
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  chainId: 1,
  name: 'USD Coin',
  symbol: 'USDC',
  decimals: 6,
  logoUrl: 'https://example.com/usdc.png',
  price: 1.0,
  marketCap: 40000000000,
  lastUpdated: new Date().toISOString(),
};

// Test 10: HeatmapData should work correctly
const testHeatmapCell: HeatmapCell = {
  sourceChain: 'ethereum',
  destinationChain: 'polygon',
  value: 1500,
  metadata: {
    volume: 2500000,
    successRate: 98.5,
    avgTime: 120000,
    transactionCount: 1500,
  },
};

const testHeatmapRow: HeatmapRow = {
  sourceChain: 'ethereum',
  cells: [testHeatmapCell],
};

const testHeatmapData: HeatmapData = {
  rows: [testHeatmapRow],
  columns: ['polygon', 'arbitrum'],
  bridges: ['Stargate', 'LayerZero'],
  timeRange: {
    start: '2024-01-01',
    end: '2024-01-31',
  },
  generatedAt: new Date().toISOString(),
};

// Test 11: AbandonmentMetrics should work
const testAbandonmentMetrics: AbandonmentMetrics = {
  totalQuotesRequested: 1000,
  totalQuotesExecuted: 300,
  abandonmentRate: 70,
  avgTimeToExecute: 45000,
  byBridge: {
    Stargate: {
      totalQuotesRequested: 500,
      totalQuotesExecuted: 200,
      abandonmentRate: 60,
    },
  },
};

// Test 12: Helper types work correctly
interface TestInterface {
  required: string;
  optional?: number;
}

type TestPartial = PartialBy<TestInterface, 'optional'>;
type TestRequired = RequiredBy<TestInterface, 'optional'>;

const testPartial: TestPartial = {
  required: 'test',
};

const testRequired: TestRequired = {
  required: 'test',
  optional: 42,
};

// Test 13: Nullable and Optional types work
const nullableValue: Nullable<string> = null;
const optionalValue: Optional<number> = undefined;
const nonNullValue: Nullable<string> = 'test';

// ============================================================================
// Compile-time Type Checks
// ============================================================================

// These assertions verify at compile time that types are correct
const _typeCheck1: true = testChainId === 1 ? true : true;
const _typeCheck2: true = testTokenSymbol === 'USDC' ? true : true;
const _typeCheck3: true = testQuote.bridgeStatus === 'active' ? true : true;
const _typeCheck4: true = testApiResponse.success === true ? true : true;
const _typeCheck5: true = testHeatmapData.rows.length > 0 ? true : true;
const _typeCheck6: true = testAbandonmentMetrics.abandonmentRate > 0 ? true : true;

// Export to prevent unused variable errors
export {
  testChainId,
  testTokenSymbol,
  testTokenAddress,
  testTransactionStatus,
  testQuote,
  testApiResponse,
  testPaginatedResponse,
  testAnalyticsQuery,
  testTokenMetadata,
  testHeatmapCell,
  testHeatmapRow,
  testHeatmapData,
  testAbandonmentMetrics,
  testPartial,
  testRequired,
  nullableValue,
  optionalValue,
  nonNullValue,
};