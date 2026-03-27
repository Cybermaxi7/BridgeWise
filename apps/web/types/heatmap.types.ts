/**
 * Bridge Usage Heatmap Types
 * 
 * Type definitions for bridge usage heatmap data
 */

/**
 * Heatmap cell data
 */
export interface HeatmapCell {
  sourceChain: string;
  destinationChain: string;
  bridgeName?: string;
  value: number;
  label?: string;
  metadata?: {
    volume?: number;
    successRate?: number;
    avgTime?: number;
    transactionCount?: number;
  };
}

/**
 * Heatmap row (source chain)
 */
export interface HeatmapRow {
  sourceChain: string;
  cells: HeatmapCell[];
}

/**
 * Complete heatmap data
 */
export interface HeatmapData {
  rows: HeatmapRow[];
  columns: string[];
  bridges: string[];
  timeRange: {
    start: string;
    end: string;
  };
  generatedAt: string;
}

/**
 * Bridge breakdown for a specific chain pair
 */
export interface BridgeBreakdown {
  bridgeName: string;
  transfers: number;
  volume: number;
  successRate: number;
}

/**
 * Query parameters for heatmap
 */
export interface HeatmapQueryParams {
  startDate?: string;
  endDate?: string;
  bridges?: string[];
  tokens?: string[];
  groupByBridge?: boolean;
  normalize?: boolean;
}

/**
 * Time series heatmap period
 */
export interface TimeSeriesHeatmapPeriod {
  rows: HeatmapRow[];
  columns: string[];
  bridges: string[];
  timeRange: {
    start: string;
    end: string;
  };
  generatedAt: string;
}