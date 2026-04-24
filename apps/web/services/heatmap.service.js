"use strict";
/**
 * Bridge Usage Heatmap Service
 *
 * Frontend service for fetching heatmap data
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchHeatmapData = fetchHeatmapData;
exports.exportHeatmapData = exportHeatmapData;
exports.fetchBridgeBreakdown = fetchBridgeBreakdown;
exports.fetchTimeSeriesHeatmap = fetchTimeSeriesHeatmap;
exports.transformToMatrix = transformToMatrix;
exports.getCellData = getCellData;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
/**
 * Fetch heatmap data from the API
 */
async function fetchHeatmapData(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.startDate)
        queryParams.append('startDate', params.startDate);
    if (params.endDate)
        queryParams.append('endDate', params.endDate);
    if (params.bridges?.length)
        queryParams.append('bridges', params.bridges.join(','));
    if (params.tokens?.length)
        queryParams.append('tokens', params.tokens.join(','));
    if (params.groupByBridge)
        queryParams.append('groupByBridge', 'true');
    if (params.normalize)
        queryParams.append('normalize', 'true');
    const response = await fetch(`${API_BASE_URL}/analytics/heatmap?${queryParams.toString()}`, {
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
}
/**
 * Export heatmap data in various formats
 */
async function exportHeatmapData(format, params = {}) {
    const queryParams = new URLSearchParams();
    if (params.startDate)
        queryParams.append('startDate', params.startDate);
    if (params.endDate)
        queryParams.append('endDate', params.endDate);
    if (params.bridges?.length)
        queryParams.append('bridges', params.bridges.join(','));
    const response = await fetch(`${API_BASE_URL}/analytics/heatmap/export/${format}?${queryParams.toString()}`, {
        headers: {
            'Content-Type': 'application/json',
        },
    });
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
async function fetchBridgeBreakdown(sourceChain, destinationChain, params = {}) {
    const queryParams = new URLSearchParams();
    if (params.startDate)
        queryParams.append('startDate', params.startDate);
    if (params.endDate)
        queryParams.append('endDate', params.endDate);
    const response = await fetch(`${API_BASE_URL}/analytics/heatmap/chain-pair/${sourceChain}/${destinationChain}?${queryParams.toString()}`, {
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
}
/**
 * Get time-series heatmap data
 */
async function fetchTimeSeriesHeatmap(periods, periodType = 'day', params = {}) {
    const queryParams = new URLSearchParams();
    queryParams.append('periodType', periodType);
    if (params.startDate)
        queryParams.append('startDate', params.startDate);
    if (params.endDate)
        queryParams.append('endDate', params.endDate);
    if (params.bridges?.length)
        queryParams.append('bridges', params.bridges.join(','));
    const response = await fetch(`${API_BASE_URL}/analytics/heatmap/timeseries/${periods}?${queryParams.toString()}`, {
        headers: {
            'Content-Type': 'application/json',
        },
    });
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
function transformToMatrix(heatmapData) {
    const { rows, columns } = heatmapData;
    // Create index maps
    const rowIndexMap = new Map();
    rows.forEach((row, index) => rowIndexMap.set(row.sourceChain, index));
    const colIndexMap = new Map();
    columns.forEach((col, index) => colIndexMap.set(col, index));
    // Initialize matrix
    const matrix = rows.map(() => new Array(columns.length).fill(0));
    let maxValue = 0;
    // Fill matrix
    for (const row of rows) {
        const rowIndex = rowIndexMap.get(row.sourceChain);
        if (rowIndex === undefined)
            continue;
        for (const cell of row.cells) {
            const colIndex = colIndexMap.get(cell.destinationChain);
            if (colIndex === undefined)
                continue;
            matrix[rowIndex][colIndex] = cell.value;
            if (cell.value > maxValue)
                maxValue = cell.value;
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
function getCellData(heatmapData, sourceChain, destinationChain) {
    const row = heatmapData.rows.find(r => r.sourceChain === sourceChain);
    if (!row)
        return undefined;
    return row.cells.find(c => c.destinationChain === destinationChain);
}
//# sourceMappingURL=heatmap.service.js.map