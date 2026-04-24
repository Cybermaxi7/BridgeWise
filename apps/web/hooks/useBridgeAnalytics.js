"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useBridgeAnalytics = useBridgeAnalytics;
exports.useTimeSeriesAnalytics = useTimeSeriesAnalytics;
exports.useTopPerformingBridges = useTopPerformingBridges;
exports.useSlippageStatistics = useSlippageStatistics;
const react_1 = require("react");
/**
 * API base URL - can be overridden via environment variable
 */
const API_BASE_URL = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL
    : typeof window !== 'undefined'
        ? ''
        : '';
/**
 * Default options for useBridgeAnalytics
 */
const DEFAULT_OPTIONS = {
    page: 1,
    limit: 50,
    refreshInterval: 0,
    enabled: true,
};
/**
 * Check if running in browser environment (SSR-safe)
 */
const isBrowser = () => {
    return typeof window !== 'undefined';
};
/**
 * Build query string from options
 */
const buildQueryString = (options) => {
    const params = new URLSearchParams();
    if (options.bridgeName)
        params.append('bridgeName', options.bridgeName);
    if (options.sourceChain)
        params.append('sourceChain', options.sourceChain);
    if (options.destinationChain)
        params.append('destinationChain', options.destinationChain);
    if (options.token)
        params.append('token', options.token);
    if (options.startDate)
        params.append('startDate', options.startDate.toISOString());
    if (options.endDate)
        params.append('endDate', options.endDate.toISOString());
    if (options.page)
        params.append('page', options.page.toString());
    if (options.limit)
        params.append('limit', options.limit.toString());
    return params.toString();
};
/**
 * useBridgeAnalytics Hook
 *
 * SSR-safe React hook for fetching bridge analytics data.
 * Provides real-time analytics with optional auto-refresh.
 *
 * @example
 * ```tsx
 * const { analyticsData, loading, error, refetch } = useBridgeAnalytics({
 *   bridgeName: 'hop',
 *   sourceChain: 'ethereum',
 *   destinationChain: 'polygon',
 *   refreshInterval: 30000, // Refresh every 30 seconds
 * });
 * ```
 */
function useBridgeAnalytics(options = {}) {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
    const { enabled, refreshInterval } = mergedOptions;
    const [analyticsData, setAnalyticsData] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const [total, setTotal] = (0, react_1.useState)(0);
    const [page, setPage] = (0, react_1.useState)(mergedOptions.page || 1);
    const [totalPages, setTotalPages] = (0, react_1.useState)(0);
    const abortControllerRef = (0, react_1.useRef)(null);
    const intervalRef = (0, react_1.useRef)(null);
    /**
     * Fetch analytics data
     */
    const fetchAnalytics = (0, react_1.useCallback)(async () => {
        // Skip if not in browser (SSR safety)
        if (!isBrowser()) {
            return;
        }
        // Cancel any in-flight request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();
        setLoading(true);
        setError(null);
        try {
            const queryString = buildQueryString(mergedOptions);
            const url = `${API_BASE_URL}/api/v1/bridge-analytics${queryString ? `?${queryString}` : ''}`;
            const response = await fetch(url, {
                signal: abortControllerRef.current.signal,
                headers: {
                    Accept: 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch analytics: ${response.status} ${response.statusText}`);
            }
            const result = await response.json();
            setAnalyticsData(result.data || []);
            setTotal(result.total || 0);
            setPage(result.page || 1);
            setTotalPages(result.totalPages || 0);
        }
        catch (err) {
            // Don't set error if request was aborted
            if (err instanceof Error && err.name === 'AbortError') {
                return;
            }
            setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        }
        finally {
            setLoading(false);
        }
    }, [mergedOptions]);
    /**
     * Refetch data manually
     */
    const refetch = (0, react_1.useCallback)(async () => {
        await fetchAnalytics();
    }, [fetchAnalytics]);
    // Initial fetch and when options change
    (0, react_1.useEffect)(() => {
        if (enabled) {
            fetchAnalytics();
        }
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [
        enabled,
        mergedOptions.bridgeName,
        mergedOptions.sourceChain,
        mergedOptions.destinationChain,
        mergedOptions.token,
        mergedOptions.startDate?.toISOString(),
        mergedOptions.endDate?.toISOString(),
        mergedOptions.page,
        mergedOptions.limit,
        fetchAnalytics,
    ]);
    // Auto-refresh interval
    (0, react_1.useEffect)(() => {
        if (enabled && refreshInterval && refreshInterval > 0) {
            intervalRef.current = setInterval(() => {
                fetchAnalytics();
            }, refreshInterval);
        }
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [enabled, refreshInterval, fetchAnalytics]);
    return {
        analyticsData,
        loading,
        error,
        total,
        page,
        totalPages,
        refetch,
    };
}
/**
 * useTimeSeriesAnalytics Hook
 *
 * Fetches time-series analytics data for trend analysis.
 * SSR-safe with optional auto-refresh.
 *
 * @example
 * ```tsx
 * const { data, loading, error } = useTimeSeriesAnalytics({
 *   bridgeName: 'hop',
 *   sourceChain: 'ethereum',
 *   destinationChain: 'polygon',
 *   granularity: 'day',
 *   startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
 *   endDate: new Date(),
 * });
 * ```
 */
function useTimeSeriesAnalytics(options) {
    const [data, setData] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const abortControllerRef = (0, react_1.useRef)(null);
    const fetchTimeSeries = (0, react_1.useCallback)(async () => {
        if (!isBrowser()) {
            return;
        }
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                granularity: options.granularity,
                startDate: options.startDate.toISOString(),
                endDate: options.endDate.toISOString(),
            });
            if (options.token) {
                params.append('token', options.token);
            }
            const url = `${API_BASE_URL}/api/v1/bridge-analytics/trends/${encodeURIComponent(options.bridgeName)}/${encodeURIComponent(options.sourceChain)}/${encodeURIComponent(options.destinationChain)}?${params.toString()}`;
            const response = await fetch(url, {
                signal: abortControllerRef.current.signal,
                headers: {
                    Accept: 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch time series: ${response.status} ${response.statusText}`);
            }
            const result = await response.json();
            setData(result.data || []);
        }
        catch (err) {
            if (err instanceof Error && err.name === 'AbortError') {
                return;
            }
            setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        }
        finally {
            setLoading(false);
        }
    }, [options]);
    const refetch = (0, react_1.useCallback)(async () => {
        await fetchTimeSeries();
    }, [fetchTimeSeries]);
    (0, react_1.useEffect)(() => {
        fetchTimeSeries();
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [fetchTimeSeries]);
    return { data, loading, error, refetch };
}
/**
 * useTopPerformingBridges Hook
 *
 * Fetches top performing bridges by volume, success rate, and speed.
 *
 * @example
 * ```tsx
 * const { data, loading, error } = useTopPerformingBridges({ limit: 5 });
 * ```
 */
function useTopPerformingBridges(options) {
    const [data, setData] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const fetchTopBridges = (0, react_1.useCallback)(async () => {
        if (!isBrowser()) {
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (options?.limit) {
                params.append('limit', options.limit.toString());
            }
            const url = `${API_BASE_URL}/api/v1/bridge-analytics/top-performing${params.toString() ? `?${params.toString()}` : ''}`;
            const response = await fetch(url, {
                headers: {
                    Accept: 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch top bridges: ${response.status} ${response.statusText}`);
            }
            const result = await response.json();
            setData(result);
        }
        catch (err) {
            setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        }
        finally {
            setLoading(false);
        }
    }, [options?.limit]);
    const refetch = (0, react_1.useCallback)(async () => {
        await fetchTopBridges();
    }, [fetchTopBridges]);
    (0, react_1.useEffect)(() => {
        fetchTopBridges();
    }, [fetchTopBridges]);
    return { data, loading, error, refetch };
}
/**
 * useSlippageStatistics Hook
 *
 * Fetches slippage statistics for a specific route.
 *
 * @example
 * ```tsx
 * const { data, loading, error } = useSlippageStatistics({
 *   bridgeName: 'hop',
 *   sourceChain: 'ethereum',
 *   destinationChain: 'polygon',
 *   token: 'USDC',
 * });
 * ```
 */
function useSlippageStatistics(options) {
    const [data, setData] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const fetchSlippageStats = (0, react_1.useCallback)(async () => {
        if (!isBrowser()) {
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (options.token) {
                params.append('token', options.token);
            }
            const url = `${API_BASE_URL}/api/v1/bridge-analytics/slippage/${encodeURIComponent(options.bridgeName)}/${encodeURIComponent(options.sourceChain)}/${encodeURIComponent(options.destinationChain)}${params.toString() ? `?${params.toString()}` : ''}`;
            const response = await fetch(url, {
                headers: {
                    Accept: 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch slippage stats: ${response.status} ${response.statusText}`);
            }
            const result = await response.json();
            setData(result.message ? null : result);
        }
        catch (err) {
            setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        }
        finally {
            setLoading(false);
        }
    }, [
        options.bridgeName,
        options.sourceChain,
        options.destinationChain,
        options.token,
    ]);
    const refetch = (0, react_1.useCallback)(async () => {
        await fetchSlippageStats();
    }, [fetchSlippageStats]);
    (0, react_1.useEffect)(() => {
        fetchSlippageStats();
    }, [fetchSlippageStats]);
    return { data, loading, error, refetch };
}
exports.default = useBridgeAnalytics;
//# sourceMappingURL=useBridgeAnalytics.js.map