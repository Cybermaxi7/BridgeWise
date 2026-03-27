# BridgeWise TypeScript Types

## Overview

BridgeWise provides comprehensive TypeScript type definitions to ensure full type safety across the SDK. All public API types are exported from a central location.

## Usage

### Importing Types

```typescript
// Import specific types
import { Quote, ChainId, TokenSymbol } from './types';

// Import all types
import * as BridgeWise from './types';
```

### Core Types

```typescript
// Chain and token identifiers
type ChainId = number;
type TokenSymbol = string;
type TokenAddress = string;
type BridgeName = string;
type ChainName = string;

// Status types
type TransactionStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'partial';
type ReliabilityTier = 'excellent' | 'good' | 'fair' | 'poor';
type RankingMode = 'cost' | 'speed' | 'score' | 'balanced';
```

### Interface Types

```typescript
// API responses
interface ApiResponse<T> {
  data: T;
  success: boolean;
  timestamp: string;
  error?: { code: string; message: string };
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Query parameters
interface AnalyticsQueryParams extends TimeRange {
  bridgeName?: BridgeName;
  sourceChain?: ChainName;
  destinationChain?: ChainName;
  token?: TokenSymbol;
  page?: number;
  limit?: number;
}

// Quote definition
interface Quote {
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
```

### Domain-Specific Types

#### Token Metadata

```typescript
interface TokenMetadata {
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
```

#### Abandonment Tracking

```typescript
interface AbandonmentMetrics {
  totalQuotesRequested: number;
  totalQuotesExecuted: number;
  abandonmentRate: number;
  avgTimeToExecute?: number;
  byBridge?: Record<string, AbandonmentMetrics>;
  byChain?: Record<string, AbandonmentMetrics>;
  byToken?: Record<string, AbandonmentMetrics>;
}
```

#### Heatmap

```typescript
interface HeatmapData {
  rows: HeatmapRow[];
  columns: string[];
  bridges: string[];
  timeRange: { start: string; end: string; };
  generatedAt: string;
}

interface HeatmapCell {
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
```

### Helper Types

```typescript
// Make specific properties optional
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Make specific properties required
type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

// Nullable version
type Nullable<T> = T | null;

// Optional version
type Optional<T> = T | undefined;
```

## Type Safety Best Practices

1. **Always use specific types** instead of `any`
2. **Import types from central location** - avoid redefining types
3. **Use utility types** - utilize `PartialBy`, `RequiredBy` for flexibility
4. **Define interfaces for API responses** - don't use loose objects
5. **Use discriminated unions** for status types like `TransactionStatus`

## Example: Creating a Quote Request

```typescript
import { QuoteParams, ChainName, TokenSymbol, RankingMode } from './types';

const quoteParams: QuoteParams = {
  sourceChain: 'ethereum' as ChainName,
  destinationChain: 'polygon' as ChainName,
  sourceToken: 'USDC' as TokenSymbol,
  amount: '1000',
  rankingMode: 'balanced' as RankingMode,
  slippageTolerance: 0.5,
};
```

## Type Testing

Run the type tests to validate all type definitions:

```bash
npm run type-check
# or
npx tsc --noEmit --strict
```

The type tests are located at `apps/api/src/types/types.test.ts` and verify that:
- All types can be instantiated correctly
- Type assignments work as expected
- Generic types function properly
- Helper types produce expected results

## Migration from `any`

If you find `any` types in your code, replace them with proper types:

```typescript
// ❌ Before (weak typing)
function processQuote(quote: any) { }

// ✅ After (strong typing)
import { Quote } from './types';
function processQuote(quote: Quote) { }
```

## Exporting Types from Libraries

When creating new modules, ensure types are properly exported:

```typescript
// In your module's index.ts
export * from './your-types';
export type { YourType, AnotherType } from './your-types';
```

## TypeScript Configuration

For best results, use strict TypeScript configuration:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}