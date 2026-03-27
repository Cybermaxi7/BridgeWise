# Token Metadata Auto-Fetch

## Overview

The Token Metadata Auto-Fetch feature automatically retrieves token metadata (name, symbol, logo, decimals) from trusted external sources, caches the results, and provides the data to the frontend UI.

## Problem Solved

- **Manual token configuration is inefficient**: Previously, tokens had to be manually configured in the system
- **Missing metadata affects UX**: Without proper metadata, token names, symbols, and logos wouldn't display correctly

## Solution

The solution implements:
1. **Automatic fetching** from trusted external APIs (CoinGecko as primary source)
2. **Built-in fallback registry** with common tokens (USDC, USDT, ETH, etc.)
3. **Caching mechanism** to avoid repeated API calls
4. **Frontend integration** through hooks and services

## Architecture

### Backend (NestJS)

```
apps/api/src/token-metadata/
├── token-metadata.module.ts      # NestJS module
├── token-metadata.service.ts     # Core service with caching
├── token-metadata.controller.ts  # REST API endpoints
└── token-metadata.constants.ts   # Configuration constants
```

### Frontend (Next.js)

```
apps/web/
├── types/token-metadata.types.ts       # TypeScript types
├── services/token-metadata.service.ts  # API client with client-side cache
└── hooks/useTokenMetadata.ts          # React hooks
```

## API Endpoints

### GET /tokens/metadata

Fetch metadata for a single token.

**Query Parameters:**
- `chainId` (number): The blockchain chain ID (e.g., 1 for Ethereum, 137 for Polygon)
- `address` (string): The token contract address

**Example:**
```
GET /tokens/metadata?chainId=1&address=0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48
```

**Response:**
```json
{
  "address": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  "chainId": 1,
  "name": "USD Coin",
  "symbol": "USDC",
  "decimals": 6,
  "logoUrl": "https://assets.coingecko.com/coins/images/6319/small/usdc.png",
  "price": 1.0,
  "lastUpdated": "2024-01-15T10:30:00.000Z"
}
```

### GET /tokens/metadata/batch

Fetch metadata for multiple tokens at once.

**Query Parameters:**
- `tokens` (string): Comma-separated list of "chainId:address" pairs

**Example:**
```
GET /tokens/metadata/batch?tokens=1:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48,137:0x2791bca1f2de4661ed88a30c99a7a9449aa84174
```

### GET /tokens/cache/stats

Get cache statistics.

### GET /tokens/cache/clear

Clear the metadata cache.

## Metadata Sources

### Primary Source: CoinGecko API

- **URL**: `https://api.coingecko.com/api/v3/`
- **Endpoint**: `/coins/{platform}/contract/{contract_address}`
- **Rate Limits**: ~10-30 calls/minute (free tier)
- **Data Quality**: High - comprehensive token database

**Supported Chains:**
| Chain ID | Chain Name | CoinGecko Platform ID |
|----------|------------|----------------------|
| 1 | Ethereum | ethereum |
| 56 | BSC | binancesmartchain |
| 137 | Polygon | polygon-pos |
| 42161 | Arbitrum | arbitrum-one |
| 10 | Optimism | optimism |
| 43114 | Avalanche | avalanche-c |

### Fallback: Local Token Registry

Built-in registry with common tokens provides instant metadata without API calls:

- USDC on all major chains
- USDT on all major chains
- ETH (native) on EVM chains
- WBTC on Ethereum
- MATIC on Polygon
- BNB on BSC
- AVAX on Avalanche
- XLM on Stellar

### Default Fallback

For completely unknown tokens, returns default metadata:
- `name`: "Unknown Token"
- `symbol`: "UNKNOWN"
- `decimals`: 18 (most common)
- `logoUrl`: null

## Caching

### Server-Side Cache (Backend)

- **Type**: In-memory Map
- **TTL**: 1 hour (configurable via `CACHE_TTL_MS`)
- **Max Size**: 1000 tokens (configurable)
- **Key Format**: `{chainId}:{address}`

### Client-Side Cache (Frontend)

- **Type**: In-memory Map (in service)
- **TTL**: 1 hour
- **Auto-prefetch**: Common tokens on app initialization

## Usage Examples

### Frontend Hook Usage

```typescript
import { useTokenMetadata } from './hooks/useTokenMetadata';

function TokenDisplay({ chainId, address }) {
  const { metadata, isLoading, error } = useTokenMetadata(chainId, address);

  if (isLoading) return <Loading />;
  if (error) return <Error />;
  
  return (
    <div>
      <img src={metadata.logoUrl} alt={metadata.name} />
      <span>{metadata.symbol}</span>
    </div>
  );
}
```

### Service Usage

```typescript
import { fetchTokenMetadata, prefetchCommonTokens } from './services/token-metadata.service';

// Prefetch common tokens on app start
useEffect(() => {
  prefetchCommonTokens();
}, []);

// Fetch specific token
const metadata = await fetchTokenMetadata(1, '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48');
```

## Testing Requirements

### Metadata Accuracy
- Verify token names match external API
- Verify symbols are correctly extracted
- Verify decimal places are accurate
- Verify logo URLs are valid and accessible

### Caching Validation
- Verify cache hit on repeated requests
- Verify cache expires after TTL
- Verify cache clear works correctly
- Verify batch requests are properly cached

### Error Handling
- Verify graceful fallback for unknown tokens
- Verify handling of network errors
- Verify handling of rate limiting
- Verify handling of invalid addresses

## Configuration

Environment variables (optional):
- `COINGECKO_API_KEY`: For higher rate limits (optional)

## Future Enhancements

1. **Additional Sources**: Add more token APIs (CoinMarketCap, DexScreener)
2. **Persistent Cache**: Redis for distributed caching
3. **Price Data**: Include real-time pricing in metadata
4. **Custom Registry**: Allow custom token configurations
5. **Websocket Updates**: Real-time metadata updates