"use strict";
/**
 * useTokenMetadata Hook
 *
 * React hook for fetching and managing token metadata
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTokenMetadata = useTokenMetadata;
exports.useBatchTokenMetadata = useBatchTokenMetadata;
exports.useTokenMetadataCache = useTokenMetadataCache;
const react_1 = require("react");
const token_metadata_service_1 = require("../services/token-metadata.service");
/**
 * Hook to fetch token metadata for a given chain and address
 *
 * @param chainId - The chain ID
 * @param address - The token contract address
 * @param options - Additional options
 * @returns Token metadata, loading state, and error
 */
function useTokenMetadata(chainId, address, options) {
    const [metadata, setMetadata] = (0, react_1.useState)(null);
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const shouldFetch = options?.enabled !== false && chainId && address;
    const fetchMetadata = (0, react_1.useCallback)(async () => {
        if (!shouldFetch)
            return;
        setIsLoading(true);
        setError(null);
        try {
            // First check client-side cache
            const cached = (0, token_metadata_service_1.getCachedMetadata)(chainId, address);
            if (cached) {
                setMetadata(cached);
                setIsLoading(false);
                return;
            }
            // Fetch from API
            const result = await (0, token_metadata_service_1.fetchTokenMetadata)(chainId, address);
            setMetadata(result);
        }
        catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch metadata'));
        }
        finally {
            setIsLoading(false);
        }
    }, [chainId, address, shouldFetch]);
    (0, react_1.useEffect)(() => {
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
function useBatchTokenMetadata(tokens) {
    const [metadataMap, setMetadataMap] = (0, react_1.useState)(new Map());
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        if (!tokens.length)
            return;
        const fetchBatch = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const { fetchBatchTokenMetadata } = await Promise.resolve().then(() => __importStar(require('../services/token-metadata.service')));
                const results = await fetchBatchTokenMetadata(tokens);
                setMetadataMap(results);
            }
            catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to batch fetch'));
            }
            finally {
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
function useTokenMetadataCache() {
    const [cacheSize, setCacheSize] = (0, react_1.useState)(0);
    (0, react_1.useEffect)(() => {
        // Update cache size periodically
        const interval = setInterval(() => {
            // This would need access to the actual cache implementation
            // For now, we'll just track that it can be cleared
        }, 5000);
        return () => clearInterval(interval);
    }, []);
    const clearCache = (0, react_1.useCallback)(() => {
        (0, token_metadata_service_1.clearMetadataCache)();
        setCacheSize(0);
    }, []);
    return { cacheSize, clearCache };
}
//# sourceMappingURL=useTokenMetadata.js.map