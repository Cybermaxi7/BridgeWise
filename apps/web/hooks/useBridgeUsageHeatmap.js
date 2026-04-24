"use strict";
/**
 * useBridgeUsageHeatmap Hook
 *
 * React hook for fetching and managing bridge usage heatmap data
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.useBridgeUsageHeatmap = useBridgeUsageHeatmap;
exports.useBridgeBreakdown = useBridgeBreakdown;
exports.useTimeSeriesHeatmap = useTimeSeriesHeatmap;
const react_1 = require("react");
const heatmap_service_1 = require("../services/heatmap.service");
/**
 * Hook for fetching bridge usage heatmap data
 */
function useBridgeUsageHeatmap(params = {}, options = {}) {
    const [heatmapData, setHeatmapData] = (0, react_1.useState)(null);
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const fetchData = (0, react_1.useCallback)(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await (0, heatmap_service_1.fetchHeatmapData)(params);
            setHeatmapData(data);
        }
        catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch heatmap data'));
        }
        finally {
            setIsLoading(false);
        }
    }, [JSON.stringify(params)]);
    // Initial fetch
    (0, react_1.useEffect)(() => {
        if (options.autoFetch !== false) {
            fetchData();
        }
    }, [fetchData, options.autoFetch]);
    // Auto-refresh
    (0, react_1.useEffect)(() => {
        if (options.refetchInterval) {
            const interval = setInterval(fetchData, options.refetchInterval);
            return () => clearInterval(interval);
        }
    }, [fetchData, options.refetchInterval]);
    // Transform to matrix
    let matrix = [];
    let rowLabels = [];
    let colLabels = [];
    let maxValue = 0;
    if (heatmapData) {
        const transformed = (0, heatmap_service_1.transformToMatrix)(heatmapData);
        matrix = transformed.matrix;
        rowLabels = transformed.rowLabels;
        colLabels = transformed.colLabels;
        maxValue = transformed.maxValue;
    }
    return {
        heatmapData,
        matrix,
        rowLabels,
        colLabels,
        maxValue,
        isLoading,
        error,
        refetch: fetchData,
    };
}
/**
 * Hook for fetching bridge breakdown for a chain pair
 */
function useBridgeBreakdown(sourceChain, destinationChain, options = {}) {
    const [breakdown, setBreakdown] = (0, react_1.useState)([]);
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        if (!sourceChain || !destinationChain)
            return;
        const fetchBreakdown = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await (0, heatmap_service_1.fetchBridgeBreakdown)(sourceChain, destinationChain, options);
                setBreakdown(data);
            }
            catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to fetch breakdown'));
            }
            finally {
                setIsLoading(false);
            }
        };
        fetchBreakdown();
    }, [sourceChain, destinationChain, JSON.stringify(options)]);
    return { breakdown, isLoading, error };
}
/**
 * Hook for time-series heatmap data
 */
function useTimeSeriesHeatmap(periods, periodType = 'day', params = {}) {
    const [timeSeriesData, setTimeSeriesData] = (0, react_1.useState)([]);
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await (0, heatmap_service_1.fetchTimeSeriesHeatmap)(periods, periodType, params);
                setTimeSeriesData(data);
            }
            catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to fetch time series'));
            }
            finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [periods, periodType, JSON.stringify(params)]);
    return { timeSeriesData, isLoading, error };
}
//# sourceMappingURL=useBridgeUsageHeatmap.js.map