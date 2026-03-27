/**
 * Token Metadata Service
 * 
 * Frontend service for fetching token metadata from the API
 * Includes client-side caching to reduce API calls
 */

import { TokenMetadata, TokenMetadataCacheStats } from '../types/token-metadata.types';

// API base URL - can be configured via environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Cache configuration
const CACHE_TTL_MS = 3600000; // 1 hour
const cache = new Map<string, { metadata: TokenMetadata; timestamp: number }>();

/**
 * Get token metadata from API
 * 
 * @param chainId - The chain ID (e.g., 1 for Ethereum, 137 for Polygon)
 * @param address - The token contract address
 * @returns Token metadata or null if not found
 */
export async function fetchTokenMetadata(
  chainId: number,
  address: string,
): Promise<TokenMetadata | null> {
  const cacheKey = `${chainId}:${address.toLowerCase()}`;

  // Check client-side cache first
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.metadata;
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/tokens/metadata?chainId=${chainId}&address=${encodeURIComponent(address)}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const metadata = await response.json();

    // Update cache
    cache.set(cacheKey, { metadata, timestamp: Date.now() });

    return metadata;
  } catch (error) {
    console.error('Failed to fetch token metadata:', error);
    return null;
  }
}

/**
 * Batch fetch token metadata for multiple tokens
 * 
 * @param tokens - Array of { chainId, address } objects
 * @returns Map of address to token metadata
 */
export async function fetchBatchTokenMetadata(
  tokens: { chainId: number; address: string }[],
): Promise<Map<string, TokenMetadata>> {
  const results = new Map<string, TokenMetadata>();

  // Build query string
  const tokensParam = tokens
    .map((t) => `${t.chainId}:${t.address.toLowerCase()}`)
    .join(',');

  try {
    const response = await fetch(
      `${API_BASE_URL}/tokens/metadata/batch?tokens=${encodeURIComponent(tokensParam)}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Convert plain object back to Map
    for (const [key, value] of Object.entries(data)) {
      results.set(key.toLowerCase(), value as TokenMetadata);
    }

    return results;
  } catch (error) {
    console.error('Failed to batch fetch token metadata:', error);
    return results;
  }
}

/**
 * Get cache statistics
 * 
 * @returns Current cache statistics
 */
export function getMetadataCacheStats(): TokenMetadataCacheStats {
  return {
    size: cache.size,
    hits: 0, // Would need hit tracking implementation
  };
}

/**
 * Clear the client-side metadata cache
 */
export function clearMetadataCache(): void {
  cache.clear();
}

/**
 * Prefetch metadata for common tokens
 * 
 * This can be called on app initialization to pre-load
 * common token metadata into the cache
 */
export async function prefetchCommonTokens(): Promise<void> {
  const commonTokens = [
    // Ethereum
    { chainId: 1, address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' }, // USDC
    { chainId: 1, address: '0xdac17f958d2ee523a2206206994597c13d831ec7' }, // USDT
    { chainId: 1, address: '0x0000000000000000000000000000000000000000' }, // ETH (native)
    { chainId: 1, address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599' }, // WBTC
    // Polygon
    { chainId: 137, address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174' }, // USDC
    { chainId: 137, address: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f' }, // USDT
    // Arbitrum
    { chainId: 42161, address: '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8' }, // USDC
    // Optimism
    { chainId: 10, address: '0x7f5c764cbc14f9669b88837ca1490cca17c31607' }, // USDC
    // Avalanche
    { chainId: 43114, address: '0xb97ef9ef8734c71904d8002f8b6bc99dd83774d0' }, // USDC
  ];

  // Prefetch in background without blocking
  fetchBatchTokenMetadata(commonTokens).catch((err) => {
    console.warn('Failed to prefetch common tokens:', err);
  });
}

/**
 * Get cached metadata synchronously (if available)
 * 
 * @param chainId - The chain ID
 * @param address - The token address
 * @returns Cached metadata or null if not in cache
 */
export function getCachedMetadata(
  chainId: number,
  address: string,
): TokenMetadata | null {
  const cacheKey = `${chainId}:${address.toLowerCase()}`;
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.metadata;
  }

  return null;
}