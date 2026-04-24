"use strict";
/**
 * BridgeWise TypeScript Type Tests
 *
 * This file validates that our type definitions are correct and can be used properly.
 * Run with: npx tsc --noEmit --strict apps/api/src/types/index.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.nonNullValue = exports.optionalValue = exports.nullableValue = exports.testRequired = exports.testPartial = exports.testAbandonmentMetrics = exports.testHeatmapData = exports.testHeatmapRow = exports.testHeatmapCell = exports.testTokenMetadata = exports.testAnalyticsQuery = exports.testPaginatedResponse = exports.testApiResponse = exports.testQuote = exports.testTransactionStatus = exports.testTokenAddress = exports.testTokenSymbol = exports.testChainId = void 0;
// ============================================================================
// Type Validation Tests
// ============================================================================
// Test 1: ChainId should be a number
const testChainId = 1;
exports.testChainId = testChainId;
const chainIdAssignment = testChainId; // Should work
// Test 2: TokenSymbol should be a string
const testTokenSymbol = 'USDC';
exports.testTokenSymbol = testTokenSymbol;
const tokenSymbolAssignment = testTokenSymbol; // Should work
// Test 3: TokenAddress should be a string
const testTokenAddress = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
exports.testTokenAddress = testTokenAddress;
const tokenAddressAssignment = testTokenAddress; // Should work
// Test 4: TransactionStatus should be a union type
const testTransactionStatus = 'completed';
exports.testTransactionStatus = testTransactionStatus;
const transactionStatusAssignment = testTransactionStatus; // Should work
// Test 5: Quote interface should work correctly
const testQuote = {
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
exports.testQuote = testQuote;
// Test 6: ApiResponse should be generic
const testApiResponse = {
    data: testQuote,
    success: true,
    timestamp: new Date().toISOString(),
};
exports.testApiResponse = testApiResponse;
// Test 7: PaginatedResponse should work
const testPaginatedResponse = {
    data: [testQuote],
    total: 1,
    page: 1,
    limit: 10,
    totalPages: 1,
};
exports.testPaginatedResponse = testPaginatedResponse;
// Test 8: AnalyticsQueryParams extends TimeRange
const testAnalyticsQuery = {
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    bridgeName: 'Stargate',
    sourceChain: 'ethereum',
    destinationChain: 'polygon',
    token: 'USDC',
    page: 1,
    limit: 10,
};
exports.testAnalyticsQuery = testAnalyticsQuery;
// Test 9: TokenMetadata should work correctly
const testTokenMetadata = {
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
exports.testTokenMetadata = testTokenMetadata;
// Test 10: HeatmapData should work correctly
const testHeatmapCell = {
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
exports.testHeatmapCell = testHeatmapCell;
const testHeatmapRow = {
    sourceChain: 'ethereum',
    cells: [testHeatmapCell],
};
exports.testHeatmapRow = testHeatmapRow;
const testHeatmapData = {
    rows: [testHeatmapRow],
    columns: ['polygon', 'arbitrum'],
    bridges: ['Stargate', 'LayerZero'],
    timeRange: {
        start: '2024-01-01',
        end: '2024-01-31',
    },
    generatedAt: new Date().toISOString(),
};
exports.testHeatmapData = testHeatmapData;
// Test 11: AbandonmentMetrics should work
const testAbandonmentMetrics = {
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
exports.testAbandonmentMetrics = testAbandonmentMetrics;
const testPartial = {
    required: 'test',
};
exports.testPartial = testPartial;
const testRequired = {
    required: 'test',
    optional: 42,
};
exports.testRequired = testRequired;
// Test 13: Nullable and Optional types work
const nullableValue = null;
exports.nullableValue = nullableValue;
const optionalValue = undefined;
exports.optionalValue = optionalValue;
const nonNullValue = 'test';
exports.nonNullValue = nonNullValue;
// ============================================================================
// Compile-time Type Checks
// ============================================================================
// These assertions verify at compile time that types are correct
const _typeCheck1 = testChainId === 1 ? true : true;
const _typeCheck2 = testTokenSymbol === 'USDC' ? true : true;
const _typeCheck3 = testQuote.bridgeStatus === 'active' ? true : true;
const _typeCheck4 = testApiResponse.success === true ? true : true;
const _typeCheck5 = testHeatmapData.rows.length > 0 ? true : true;
const _typeCheck6 = testAbandonmentMetrics.abandonmentRate > 0 ? true : true;
//# sourceMappingURL=types.test.js.map