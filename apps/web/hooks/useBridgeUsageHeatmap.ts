/**
 * useBridgeUsageHeatmap Hook
 * 
 * React hook for fetching and managing bridge usage heatmap data
 */

import { useState, useEffect, useCallback } from 'react';
import {
  fetchHeatmapData,
  fetchBridgeBreakdown,
  fetchTimeSeriesHeatmap,
  transformToMatrix,
} from '../services/heatmap.service';
import { HeatmapData, HeatmapQueryParams, BridgeBreakdown } from '../types/heatmap.types';

interface UseHeatmapOptions {
  autoFetch?: boolean;
  refetchInterval?: number; // ms
}

interface UseBridgeUsageHeatmapResult {
  heatmapData: HeatmapData | null;
  matrix: number[][];
  rowLabels: string[];
  colLabels: string[];
  maxValue: number;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching bridge usage heatmap data
 */
export function useBridgeUsageHeatmap(
  params: HeatmapQueryOptions = {},
  options: UseHeatmapOptions = {}
): UseBridgeUsageHeatmapResult {
  const [heatmapData, setHeatmapData] = useState<HeatmapData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchHeatmapData(params);
      setHeatmapData(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch heatmap data'));
    } finally {
      setIsLoading(false);
    }
  }, [JSON.stringify(params)]);

  // Initial fetch
  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchData();
    }
  }, [fetchData, options.autoFetch]);

  // Auto-refresh
  useEffect(() => {
    if (options.refetchInterval) {
      const interval = setInterval(fetchData, options.refetchInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, options.refetchInterval]);

  // Transform to matrix
  let matrix: number[][] = [];
  let rowLabels: string[] = [];
  let colLabels: string[] = [];
  let maxValue = 0;

  if (heatmapData) {
    const transformed = transformToMatrix(heatmapData);
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

interface HeatmapQueryOptions {
  startDate?: string;
  endDate?: string;
  bridges?: string[];
  tokens?: string[];
  normalize?: boolean;
}

/**
 * Hook for fetching bridge breakdown for a chain pair
 */
export function useBridgeBreakdown(
  sourceChain: string,
  destinationChain: string,
  options: { startDate?: string; endDate?: string } = {}
) {
  const [breakdown, setBreakdown] = useState<BridgeBreakdown[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!sourceChain || !destinationChain) return;

    const fetchBreakdown = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchBridgeBreakdown(sourceChain, destinationChain, options);
        setBreakdown(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch breakdown'));
      } finally {
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
export function useTimeSeriesHeatmap(
  periods: number,
  periodType: 'day' | 'week' | 'month' = 'day',
  params: HeatmapQueryOptions = {}
) {
  const [timeSeriesData, setTimeSeriesData] = useState<HeatmapData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchTimeSeriesHeatmap(periods, periodType, params);
        setTimeSeriesData(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch time series'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [periods, periodType, JSON.stringify(params)]);

  return { timeSeriesData, isLoading, error };
}