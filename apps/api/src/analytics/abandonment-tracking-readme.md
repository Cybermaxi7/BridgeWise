# Quote Abandonment Tracking

## Overview

Track quote abandonment rate by measuring how often users fetch quotes but do not execute transactions. This metric helps identify drop-off points in the user journey and improve conversion.

## Problem Solved

- **No visibility into drop-off behavior**: Previously, there was no way to measure how many users looked at quotes but didn't proceed to execute a transaction
- **Unable to identify UX issues**: High abandonment rates could indicate confusing UI, poor pricing, or other issues

## Metric Definition

### Abandonment Rate Formula

```
Abandonment Rate = ((Quotes Requested - Quotes Executed) / Quotes Requested) × 100
```

### Example
- 100 users fetch quotes
- 30 users execute a transaction
- Abandonment Rate = ((100 - 30) / 100) × 100 = 70%

### Additional Metrics
- **Total Quotes Requested**: Number of times users fetched quotes
- **Total Quotes Executed**: Number of times users initiated transactions
- **Average Time to Execute**: Average time between quote request and execution (ms)

## Tracking Logic

### Quote Request Event
Triggered when:
- User visits the bridge compare page
- User changes token/chain/amount parameters
- User explicitly clicks "Get Quotes" or similar action

Data captured:
- Session ID (unique per user session)
- Source chain, destination chain
- Token pair (source, destination)
- Amount
- Timestamp
- Bridge name (if specific bridge selected)

### Quote Execution Event
Triggered when:
- User clicks "Execute" or "Bridge" button
- User signs transaction in wallet
- Transaction is submitted to blockchain

Data captured:
- Session ID (links to original quote request)
- Selected bridge
- Transaction hash (if available)
- All quote request data

### Session Tracking
- Sessions expire after 30 minutes of inactivity
- Sessions without execution are counted as abandoned
- Sessions can span multiple page views (localStorage-based)

## API Endpoints

### GET /analytics/abandonment/metrics

Get abandonment metrics with optional filters.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| startDate | string | Start date (ISO string), default: 24h ago |
| endDate | string | End date (ISO string), default: now |
| bridgeName | string | Filter by specific bridge |
| sourceChain | string | Filter by source chain |
| destinationChain | string | Filter by destination chain |
| token | string | Filter by token |
| groupBy | string | Group results by: bridge, sourceChain, destinationChain, token, none |

**Response:**
```json
{
  "totalQuotesRequested": 1500,
  "totalQuotesExecuted": 450,
  "abandonmentRate": 70,
  "avgTimeToExecute": 45000,
  "byBridge": {
    "Stargate": {
      "totalQuotesRequested": 500,
      "totalQuotesExecuted": 200,
      "abandonmentRate": 60
    }
  }
}
```

### GET /analytics/abandonment/events

Get raw events for detailed analysis.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| startDate | string | Start date (ISO string) |
| endDate | string | End date (ISO string) |
| eventType | string | quote_requested or quote_executed |
| limit | number | Max events to return (default: 1000) |

### GET /analytics/abandonment/stats

Get current tracking statistics.

**Response:**
```json
{
  "activeSessions": 25,
  "totalEvents": 5430
}
```

## Frontend Integration

### Hook Usage

```typescript
import { useAbandonmentTracking } from './hooks/useAbandonmentTracking';

function BridgePage() {
  const { 
    sessionId, 
    trackQuoteRequest, 
    trackQuoteExecution 
  } = useAbandonmentTracking();

  // Track when user fetches quotes
  const handleFetchQuotes = async (params) => {
    await trackQuoteRequest({
      sourceChain: params.fromChain,
      destinationChain: params.toChain,
      sourceToken: params.token,
      amount: params.amount,
    });
    // ... fetch quotes logic
  };

  // Track when user executes transaction
  const handleExecute = async (quote) => {
    await trackQuoteExecution({
      bridgeName: quote.bridgeName,
      sourceChain: quote.sourceChain,
      destinationChain: quote.destinationChain,
      sourceToken: quote.sourceToken,
      amount: quote.inputAmount,
      transactionHash: txHash,
    });
    // ... execute transaction logic
  };
}
```

### Service Usage

```typescript
import { 
  fetchAbandonmentMetrics, 
  fetchAbandonmentEvents 
} from './services/abandonment-tracking.service';

// Get overall metrics
const metrics = await fetchAbandonmentMetrics({
  startDate: '2024-01-01T00:00:00Z',
  endDate: '2024-01-31T23:59:59Z',
  groupBy: 'bridge',
});

// Get events for export
const { events, count } = await fetchAbandonmentEvents({
  eventType: 'quote_requested',
  limit: 100,
});
```

## Events Logged

### Event: `quote.requested`
Emitted when a user fetches quotes. Can be consumed by other services:
- Analytics collector
- Rate limiting services
- Fraud detection

### Event: `quote.executed`
Emitted when a user executes a transaction. Links to the original quote request via sessionId.

## Data Export

Events can be exported via the `/analytics/abandonment/events` endpoint for:
- CSV/Excel export
- Business intelligence tools
- A/B testing analysis
- Customer journey mapping

## Testing Requirements

### Simulate User Drop-offs
1. Fetch quotes without executing - should increment totalQuotesRequested
2. Fetch quotes then execute - should increment both requested and executed
3. Multiple sessions - each session tracked independently
4. Session timeout - sessions older than 30 min should not count as abandonment

### Test Cases
- [ ] Quote request increments counter
- [ ] Quote execution increments counter  
- [ ] Session links request to execution
- [ ] Abandonment rate calculates correctly
- [ ] Grouping by bridge works
- [ ] Grouping by chain works
- [ ] Grouping by token works
- [ ] Events export correctly
- [ ] Time filtering works

## Future Enhancements

1. **Persistent Storage**: Store events in database for long-term retention
2. **Real-time Dashboard**: Live abandonment metrics in admin panel
3. **Alerting**: Notify when abandonment rate exceeds threshold
4. **Cohort Analysis**: Track abandonment by user segment
5. **Funnel Analysis**: Break down abandonment by step in journey
6. **Correlation**: Link abandonment to pricing, slippage, execution time