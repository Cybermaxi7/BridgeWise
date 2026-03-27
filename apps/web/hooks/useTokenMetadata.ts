/**
 * useTokenMetadata Hook
 * 
 * React hook for fetching and managing token metadata
 */

import { useState, useEffect, useCallback } from 'react';
import { TokenMetadata } from '../types/token-metadata.types';
import {
  fetchTokenMetadata,
  getCachedMetadata,
  clearMetadataCache,
} from '../services/token-metadata.service';

interface UseTokenMetadataOptions {
  enabled?: boolean;
}

interface UseTokenMetadataResult {
  metadata: TokenMetadata | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch token metadata for a given chain and address
 * 
 * @param chainId - The chain ID
 * @param address - The token contract address
 * @param options - Additional options
 * @returns Token metadata, loading state, and error
 */
export function useTokenMetadata(
  chainId: number,
  address: string,
  options?: UseTokenMetadataOptions,
): UseTokenMetadataResult {
  const [metadata, setMetadata] = useState<TokenMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const shouldFetch = options?.enabled !== false && chainId && address;

  const fetchMetadata = useCallback(async () => {
    if (!shouldFetch) return;

    setIsLoading(true);
    setError(null);

    try {
      // First check client-side cache
      const cached = getCachedMetadata(chainId, address);
      if (cached) {
        setMetadata(cached);
        setIsLoading(false);
        return;
      }

      // Fetch from API
      const result = await fetchTokenMetadata(chainId, address);
      setMetadata(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch metadata'));
    } finally {
      setIsLoading(false);
    }
  }, [chainId, address, shouldFetch]);

  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  return {
    metadata,
    isLoading,
    error,
    refetch: fetchMetadata,
  };
}

/**
 * Hook for batch fetching multiple token metadata
 * 
 * @param tokens - Array of { chainId, address } objects
 * @returns Map of token address to metadata
 */
export function useBatchTokenMetadata(
  tokens: { chainId: number; address: string }[],
) {
  const [metadataMap, setMetadataMap] = useState<Map<string, TokenMetadata>>(
    new Map(),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!tokens.length) return;

    const fetchBatch = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { fetchBatchTokenMetadata } = await import(
          '../services/token-metadata.service'
        );
        const results = await fetchBatchTokenMetadata(tokens);
        setMetadataMap(results);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to batch fetch'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchBatch();
  }, [JSON.stringify(tokens)]);

  return { metadataMap, isLoading, error };
}

/**
 * Hook for clearing the metadata cache
 */
export function useTokenMetadataCache() {
  const [cacheSize, setCacheSize] = useState(0);

  useEffect(() => {
    // Update cache size periodically
    const interval = setInterval(() => {
      // This would need access to the actual cache implementation
      // For now, we'll just track that it can be cleared
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const clearCache = useCallback(() => {
    clearMetadataCache();
    setCacheSize(0);
  }, []);

  return { cacheSize, clearCache };
}