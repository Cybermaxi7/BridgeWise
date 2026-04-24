"use strict";
/**
 * useAbandonmentTracking Hook
 *
 * React hook for tracking quote events and fetching abandonment metrics
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAbandonmentTracking = useAbandonmentTracking;
exports.useAbandonmentMetrics = useAbandonmentMetrics;
exports.useQuoteToExecutionFlow = useQuoteToExecutionFlow;
const react_1 = require("react");
const abandonment_tracking_service_1 = require("../services/abandonment-tracking.service");
/**
 * Hook for tracking quote abandonment
 *
 * Automatically tracks quote requests when users fetch quotes
 * and quote executions when users execute transactions
 */
function useAbandonmentTracking(options = {}) {
    const [sessionId] = (0, react_1.useState)(() => options.sessionId || (0, abandonment_tracking_service_1.generateSessionId)());
    const [metrics, setMetrics] = (0, react_1.useState)(null);
    const [isLoadingMetrics, setIsLoadingMetrics] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const [hasFetchedQuotes, setHasFetchedQuotes] = (0, react_1.useState)(false);
    const hasFetchedQuotesRef = (0, react_1.useRef)(false);
    // Track quote request
    const trackQuoteRequest = (0, react_1.useCallback)(async (data) => {
        await (0, abandonment_tracking_service_1.trackQuoteRequested)({
            sessionId,
            ...data,
        });
        hasFetchedQuotesRef.current = true;
        setHasFetchedQuotes(true);
    }, [sessionId]);
    // Track quote execution (when transaction is initiated)
    const trackQuoteExecution = (0, react_1.useCallback)(async (data) => {
        await (0, abandonment_tracking_service_1.trackQuoteExecuted)({
            sessionId,
            ...data,
        });
    }, [sessionId]);
    // Fetch metrics
    const refreshMetrics = (0, react_1.useCallback)(async () => {
        setIsLoadingMetrics(true);
        setError(null);
        try {
            const data = await (0, abandonment_tracking_service_1.fetchAbandonmentMetrics)({
                // Default to last 24 hours
                startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                endDate: new Date().toISOString(),
            });
            setMetrics(data);
        }
        catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch metrics'));
        }
        finally {
            setIsLoadingMetrics(false);
        }
    }, []);
    // Initial metrics fetch
    (0, react_1.useEffect)(() => {
        refreshMetrics();
    }, [refreshMetrics]);
    return {
        sessionId,
        trackQuoteRequest,
        trackQuoteExecution,
        metrics,
        isLoadingMetrics,
        error,
        refreshMetrics,
    };
}
/**
 * Hook for fetching abandonment analytics data
 */
function useAbandonmentMetrics(params) {
    const [metrics, setMetrics] = (0, react_1.useState)(null);
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const fetchMetrics = (0, react_1.useCallback)(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await (0, abandonment_tracking_service_1.fetchAbandonmentMetrics)(params);
            setMetrics(data);
        }
        catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch abandonment metrics'));
        }
        finally {
            setIsLoading(false);
        }
    }, [JSON.stringify(params)]);
    (0, react_1.useEffect)(() => {
        fetchMetrics();
    }, [fetchMetrics]);
    // Auto-refresh if enabled
    (0, react_1.useEffect)(() => {
        if (params.autoRefresh && params.refreshIntervalMs) {
            const interval = setInterval(fetchMetrics, params.refreshIntervalMs);
            return () => clearInterval(interval);
        }
    }, [params.autoRefresh, params.refreshIntervalMs, fetchMetrics]);
    return {
        metrics,
        isLoading,
        error,
        refetch: fetchMetrics,
    };
}
/**
 * Hook for tracking if user has fetched quotes but not executed
 */
function useQuoteToExecutionFlow() {
    const [hasFetchedQuotes, setHasFetchedQuotes] = (0, react_1.useState)(false);
    const [hasExecutedQuote, setHasExecutedQuote] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        const events = (0, abandonment_tracking_service_1.getLocalQuoteEvents)();
        const requested = events.some((e) => e.type === 'quote_requested');
        const executed = events.some((e) => e.type === 'quote_executed');
        setHasFetchedQuotes(requested);
        setHasExecutedQuote(executed);
    }, []);
    const isAbandoned = hasFetchedQuotes && !hasExecutedQuote;
    const conversionRate = hasFetchedQuotes
        ? (hasExecutedQuote ? 100 : 0)
        : null;
    return {
        hasFetchedQuotes,
        hasExecutedQuote,
        isAbandoned,
        conversionRate,
    };
}
//# sourceMappingURL=useAbandonmentTracking.js.map