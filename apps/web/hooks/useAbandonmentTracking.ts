/**
 * useAbandonmentTracking Hook
 * 
 * React hook for tracking quote events and fetching abandonment metrics
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  trackQuoteRequested,
  trackQuoteExecuted,
  fetchAbandonmentMetrics,
  fetchAbandonmentStats,
  generateSessionId,
  getLocalQuoteEvents,
} from '../services/abandonment-tracking.service';
import { AbandonmentMetrics } from '../types/abandonment.types';

interface UseAbandonmentTrackingOptions {
  autoTrack?: boolean;
  sessionId?: string;
}

interface UseAbandonmentTrackingResult {
  sessionId: string;
  trackQuoteRequest: (data: {
    bridgeName?: string;
    sourceChain: string;
    destinationChain: string;
    sourceToken: string;
    destinationToken?: string;
    amount: string;
  }) => Promise<void>;
  trackQuoteExecution: (data: {
    quoteId?: string;
    bridgeName: string;
    sourceChain: string;
    destinationChain: string;
    sourceToken: string;
    destinationToken?: string;
    amount: string;
    transactionHash?: string;
  }) => Promise<void>;
  metrics: AbandonmentMetrics | null;
  isLoadingMetrics: boolean;
  error: Error | null;
  refreshMetrics: () => Promise<void>;
}

/**
 * Hook for tracking quote abandonment
 * 
 * Automatically tracks quote requests when users fetch quotes
 * and quote executions when users execute transactions
 */
export function useAbandonmentTracking(
  options: UseAbandonmentTrackingOptions = {},
): UseAbandonmentTrackingResult {
  const [sessionId] = useState(() => options.sessionId || generateSessionId());
  const [metrics, setMetrics] = useState<AbandonmentMetrics | null>(null);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasFetchedQuotes, setHasFetchedQuotes] = useState(false);
  
  const hasFetchedQuotesRef = useRef(false);

  // Track quote request
  const trackQuoteRequest = useCallback(
    async (data: {
      bridgeName?: string;
      sourceChain: string;
      destinationChain: string;
      sourceToken: string;
      destinationToken?: string;
      amount: string;
    }) => {
      await trackQuoteRequested({
        sessionId,
        ...data,
      });
      hasFetchedQuotesRef.current = true;
      setHasFetchedQuotes(true);
    },
    [sessionId],
  );

  // Track quote execution (when transaction is initiated)
  const trackQuoteExecution = useCallback(
    async (data: {
      quoteId?: string;
      bridgeName: string;
      sourceChain: string;
      destinationChain: string;
      sourceToken: string;
      destinationToken?: string;
      amount: string;
      transactionHash?: string;
    }) => {
      await trackQuoteExecuted({
        sessionId,
        ...data,
      });
    },
    [sessionId],
  );

  // Fetch metrics
  const refreshMetrics = useCallback(async () => {
    setIsLoadingMetrics(true);
    setError(null);

    try {
      const data = await fetchAbandonmentMetrics({
        // Default to last 24 hours
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
      });
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch metrics'));
    } finally {
      setIsLoadingMetrics(false);
    }
  }, []);

  // Initial metrics fetch
  useEffect(() => {
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
export function useAbandonmentMetrics(params: {
  startDate?: string;
  endDate?: string;
  bridgeName?: string;
  sourceChain?: string;
  destinationChain?: string;
  token?: string;
  groupBy?: 'bridge' | 'sourceChain' | 'destinationChain' | 'token' | 'none';
  autoRefresh?: boolean;
  refreshIntervalMs?: number;
}) {
  const [metrics, setMetrics] = useState<AbandonmentMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchMetrics = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchAbandonmentMetrics(params);
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch abandonment metrics'));
    } finally {
      setIsLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // Auto-refresh if enabled
  useEffect(() => {
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
export function useQuoteToExecutionFlow() {
  const [hasFetchedQuotes, setHasFetchedQuotes] = useState(false);
  const [hasExecutedQuote, setHasExecutedQuote] = useState(false);

  useEffect(() => {
    const events = getLocalQuoteEvents();
    
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