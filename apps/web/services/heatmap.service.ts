/**
 * Bridge Usage Heatmap Service
 * 
 * Frontend service for fetching heatmap data
 */

import { HeatmapData, HeatmapQueryParams, BridgeBreakdown, TimeSeriesHeatmapPeriod, HeatmapCell } from '../types/heatmap.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Fetch heatmap data from the API
 */
export async function fetchHeatmapData(params: HeatmapQueryParams = {}): Promise<HeatmapData> {
  const queryParams = new URLSearchParams();
  
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);
  if (params.bridges?.length) queryParams.append('bridges', params.bridges.join(','));
  if (params.tokens?.length) queryParams.append('tokens', params.tokens.join(','));
  if (params.groupByBridge) queryParams.append('groupByBridge', 'true');
  if (params.normalize) queryParams.append('normalize', 'true');

  const response = await fetch(
    `${API_BASE_URL}/analytics/heatmap?${queryParams.toString()}`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

/**
 * Export heatmap data in various formats
 */
export async function exportHeatmapData(
  format: 'json' | 'csv' | 'matrix',
  params: HeatmapQueryParams = {}
): Promise<any> {
  const queryParams = new URLSearchParams();
  
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);
  if (params.bridges?.length) queryParams.append('bridges', params.bridges.join(','));

  const response = await fetch(
    `${API_BASE_URL}/analytics/heatmap/export/${format}?${queryParams.toString()}`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  if (format === 'csv') {
    return response.text();
  }

  return response.json();
}

/**
 * Get bridge breakdown for a specific chain pair
 */
export async function fetchBridgeBreakdown(
  sourceChain: string,
  destinationChain: string,
  params: { startDate?: string; endDate?: string } = {}
): Promise<BridgeBreakdown[]> {
  const queryParams = new URLSearchParams();
  
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);

  const response = await fetch(
    `${API_BASE_URL}/analytics/heatmap/chain-pair/${sourceChain}/${destinationChain}?${queryParams.toString()}`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

/**
 * Get time-series heatmap data
 */
export async function fetchTimeSeriesHeatmap(
  periods: number,
  periodType: 'day' | 'week' | 'month' = 'day',
  params: HeatmapQueryParams = {}
): Promise<TimeSeriesHeatmapPeriod[]> {
  const queryParams = new URLSearchParams();
  
  queryParams.append('periodType', periodType);
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);
  if (params.bridges?.length) queryParams.append('bridges', params.bridges.join(','));

  const response = await fetch(
    `${API_BASE_URL}/analytics/heatmap/timeseries/${periods}?${queryParams.toString()}`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

/**
 * Transform heatmap data to matrix format for visualization
 * 
 * @param heatmapData - Raw heatmap data from API
 * @returns 2D matrix with chain pairs
 */
export function transformToMatrix(heatmapData: HeatmapData): {
  matrix: number[][];
  rowLabels: string[];
  colLabels: string[];
  maxValue: number;
} {
  const { rows, columns } = heatmapData;
  
  // Create index maps
  const rowIndexMap = new Map<string, number>();
  rows.forEach((row, index) => rowIndexMap.set(row.sourceChain, index));
  
  const colIndexMap = new Map<string, number>();
  columns.forEach((col, index) => colIndexMap.set(col, index));

  // Initialize matrix
  const matrix: number[][] = rows.map(() => new Array(columns.length).fill(0));
  
  let maxValue = 0;
  
  // Fill matrix
  for (const row of rows) {
    const rowIndex = rowIndexMap.get(row.sourceChain);
    if (rowIndex === undefined) continue;
    
    for (const cell of row.cells) {
      const colIndex = colIndexMap.get(cell.destinationChain);
      if (colIndex === undefined) continue;
      
      matrix[rowIndex][colIndex] = cell.value;
      if (cell.value > maxValue) maxValue = cell.value;
    }
  }

  return {
    matrix,
    rowLabels: rows.map(r => r.sourceChain),
    colLabels: columns,
    maxValue,
  };
}

/**
 * Get cell data for a specific chain pair
 */
export function getCellData(
  heatmapData: HeatmapData,
  sourceChain: string,
  destinationChain: string
): HeatmapCell | undefined {
  const row = heatmapData.rows.find(r => r.sourceChain === sourceChain);
  if (!row) return undefined;
  
  return row.cells.find(c => c.destinationChain === destinationChain);
}