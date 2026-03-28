# Fallback Bridge Routing

> **Issue:** #126 - Implement Fallback Bridge Routing  
> **Status:** Implemented  
> **Category:** Reliability

## Overview

Fallback Bridge Routing automatically switches to alternative bridge routes when the primary route fails, eliminating the need for manual retry and improving transaction success rates.

## Problem Solved

- ❌ **Before:** Failed routes required manual retry by the user
- ✅ **After:** System automatically detects failure and switches to the next best route

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User Initiates Bridge                     │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              FallbackRouteExecutor                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Routes: [Primary, Fallback1, Fallback2, ...]       │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────┬───────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
          ▼               ▼               ▼
     ┌─────────┐    ┌─────────┐    ┌─────────┐
     │ Route 1 │───▶│ Route 2 │───▶│ Route 3 │
     │  (Hop)  │fail│(LayerZero)│fail│(Stellar)│
     └─────────┘    └─────────┘    └────┬────┘
                                        │success
                                        ▼
                              ┌─────────────────┐
                              │  TX Confirmed   │
                              └─────────────────┘
```

## Usage

### Basic Usage with FallbackRouteExecutor

```typescript
import {
  FallbackRouteExecutor,
  createFallbackExecutor,
} from '@bridgewise/bridge-core';

// Create executor with custom config
const executor = new FallbackRouteExecutor({
  maxFallbackAttempts: 3,
  executionTimeout: 30000,
  fallbackDelayMs: 1000,
  onStatusChange: (status) => {
    console.log(`Status: ${status.currentStatus}`);
    console.log(`Attempt ${status.attemptNumber}/${status.totalRoutes}`);
  },
});

// Execute with automatic fallback
const result = await executor.executeWithFallback(
  rankedRoutes,
  async (route) => {
    // Your bridge execution logic
    return await bridgeAdapter.execute(route);
  },
);

console.log(`Success via ${result.route.adapter}`);
console.log(`Fallbacks used: ${result.fallbacksUsed}`);
```

### Using Pre-configured Executors

```typescript
// Aggressive: More attempts, shorter timeouts
const aggressive = createFallbackExecutor('aggressive');

// Balanced: Default settings (recommended)
const balanced = createFallbackExecutor('balanced');

// Conservative: Fewer attempts, longer timeouts
const conservative = createFallbackExecutor('conservative');
```

### React Hook Integration

```typescript
import { useBridgeExecution } from '@bridgewise/ui-components';

function BridgeTransaction() {
  const {
    status,
    fallbackInfo,
    isFallbackActive,
    fallbackAttempts,
    startWithFallback,
  } = useBridgeExecution({
    enableFallback: true,
    maxFallbackAttempts: 3,
    onFallback: (info) => {
      toast.info(
        `Switching to ${info.fallbackRoute.provider} ` +
        `(attempt ${info.attemptNumber}/${info.totalFallbacks})`
      );
    },
  });

  const handleBridge = () => {
    startWithFallback(
      txHash,
      'hop', // Primary provider
      'ethereum',
      'polygon',
      [
        { provider: 'layerzero', id: 'route-2' },
        { provider: 'stellar', id: 'route-3' },
      ], // Fallback routes
      amount
    );
  };

  return (
    <div>
      {isFallbackActive && (
        <Alert>
          Using fallback route: {fallbackInfo?.fallbackRoute.provider}
          (Attempt {fallbackAttempts})
        </Alert>
      )}
      <Button onClick={handleBridge}>Bridge</Button>
    </div>
  );
}
```

## Configuration

### FallbackExecutorConfig

| Option                   | Type             | Default             | Description                              |
| ------------------------ | ---------------- | ------------------- | ---------------------------------------- |
| `maxFallbackAttempts`    | `number`         | `3`                 | Maximum fallback routes to try           |
| `executionTimeout`       | `number`         | `30000`             | Timeout per execution attempt (ms)       |
| `fallbackDelayMs`        | `number`         | `1000`              | Delay between fallback attempts (ms)     |
| `rerankOnFallback`       | `boolean`        | `true`              | Re-rank routes before fallback selection |
| `fallbackRankingWeights` | `RankingWeights` | Reliability-focused | Custom weights for fallback ranking      |
| `onStatusChange`         | `Function`       | -                   | Callback for status updates              |

### Pre-configured Scenarios

| Scenario       | Max Attempts | Timeout | Delay  | Use Case               |
| -------------- | ------------ | ------- | ------ | ---------------------- |
| `aggressive`   | 5            | 20s     | 500ms  | High-frequency trading |
| `balanced`     | 3            | 30s     | 1000ms | General use (default)  |
| `conservative` | 2            | 45s     | 2000ms | Large transactions     |

## Duplicate Execution Prevention

The executor prevents duplicate executions of the same route:

```typescript
// First execution starts
executor.executeWithFallback(routes, executeFn);

// Second execution throws immediately
try {
  await executor.executeWithFallback(routes, executeFn);
} catch (error) {
  // FallbackExecutionError: Route route-1 is already being executed
  // error.code === 'DUPLICATE_EXECUTION'
}
```

### Stale Execution Cleanup

Executions are considered stale after `2 × executionTimeout` and are automatically cleaned up.

## Error Codes

| Code                    | Description                   |
| ----------------------- | ----------------------------- |
| `EXECUTION_FAILED`      | Single route execution failed |
| `ALL_ROUTES_FAILED`     | All fallback routes exhausted |
| `DUPLICATE_EXECUTION`   | Route already being executed  |
| `NO_FALLBACK_AVAILABLE` | No routes provided            |
| `TIMEOUT`               | Execution timed out           |

## Status Updates

The executor emits status updates throughout execution:

```typescript
type FallbackExecutionStatus =
  | 'idle' // Not executing
  | 'executing' // Primary route in progress
  | 'switching' // Switching to fallback
  | 'completed' // Success
  | 'failed'; // All routes failed
```

### Status Callback Payload

```typescript
{
  currentStatus: 'switching',
  currentRoute: NormalizedRoute,
  attemptNumber: 2,
  totalRoutes: 3,
  error?: Error
}
```

## UI Updates

The `useBridgeExecution` hook provides reactive state for UI:

| State              | Type                        | Description                     |
| ------------------ | --------------------------- | ------------------------------- |
| `fallbackInfo`     | `FallbackRouteInfo \| null` | Current fallback details        |
| `isFallbackActive` | `boolean`                   | Whether fallback is in progress |
| `fallbackAttempts` | `number`                    | Number of attempts made         |

### FallbackRouteInfo Structure

```typescript
interface FallbackRouteInfo {
  originalRoute: { provider: BridgeProvider; id: string };
  fallbackRoute: { provider: BridgeProvider; id: string };
  attemptNumber: number;
  totalFallbacks: number;
  reason: string;
}
```

## Testing

### Simulating Route Failures

```typescript
import { vi } from 'vitest';

it('switches to fallback on failure', async () => {
  const executeFn = vi
    .fn()
    .mockResolvedValueOnce({ success: false, error: 'Liquidity error' })
    .mockResolvedValueOnce({ success: true, transactionHash: '0x123' });

  const result = await executor.executeWithFallback(routes, executeFn);

  expect(result.fallbacksUsed).toBe(1);
  expect(result.route.adapter).toBe('layerzero'); // Second route
});
```

### Testing All Routes Fail

```typescript
it('throws when all routes fail', async () => {
  const executeFn = vi
    .fn()
    .mockResolvedValue({ success: false, error: 'Failed' });

  await expect(
    executor.executeWithFallback(routes, executeFn),
  ).rejects.toMatchObject({
    code: 'ALL_ROUTES_FAILED',
  });
});
```

### Testing Duplicate Prevention

```typescript
it('prevents duplicate execution', async () => {
  const slowExecuteFn = vi
    .fn()
    .mockImplementation(() => new Promise((r) => setTimeout(r, 10000)));

  // Start first execution (don't await)
  executor.executeWithFallback(routes, slowExecuteFn);

  // Second execution should throw
  await expect(
    executor.executeWithFallback(routes, slowExecuteFn),
  ).rejects.toMatchObject({
    code: 'DUPLICATE_EXECUTION',
  });
});
```

## Best Practices

1. **Always provide fallback routes** - Fetch routes from multiple providers
2. **Use reliability-weighted ranking** - Higher reliability routes make better fallbacks
3. **Set appropriate timeouts** - Balance between speed and reliability
4. **Handle status updates** - Keep users informed during fallback
5. **Reset on manual retry** - Call `executor.reset()` before user-initiated retries

## Files Changed

| File                                                     | Description              |
| -------------------------------------------------------- | ------------------------ |
| `packages/utils/src/fallback-executor.ts`                | Core fallback logic      |
| `packages/utils/src/__tests__/fallback-executor.test.ts` | Test suite               |
| `packages/utils/src/index.ts`                            | Export fallback executor |
| `packages/ui/src/hooks/useBridgeExecution.ts`            | React hook integration   |

## Related Documentation

- [Network Timeout Handling](./NETWORK_TIMEOUT_HANDLING.md)
- [API Errors](./API_ERRORS.md)
- [Quick Reference](./QUICK_REFERENCE.md)
