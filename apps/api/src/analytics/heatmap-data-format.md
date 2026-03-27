# Bridge Usage Heatmap Data

## Overview

The Bridge Usage Heatmap feature aggregates usage data across chains and bridges into a structure optimized for heatmap visualization.

## Data Collection

### Sources
- **Bridge Analytics**: Historical transfer data from `bridge_analytics` table
- **Abandonment Tracking**: Quote request vs execution data

### Data Points Collected
- Transaction counts (total transfers)
- Volume (total value bridged)
- Success rate (successful vs failed transfers)
- Average settlement time
- Abandonment rate (for context)

## Data Format

### HeatmapData Structure

```typescript
interface HeatmapData {
  rows: HeatmapRow[];      // Source chains
  columns: string[];       // Destination chains
  bridges: string[];      // Available bridges
  timeRange: {
    start: Date;
    end: Date;
  };
  generatedAt: Date;
}

interface HeatmapRow {
  sourceChain: string;
  cells: HeatmapCell[];
}

interface HeatmapCell {
  sourceChain: string;
  destinationChain: string;
  bridgeName?: string;     // Present when grouped by bridge
  value: number;           // Transaction count (or normalized)
  label?: string;
  metadata?: {
    volume: number;
    successRate: number;
    avgTime: number;
    transactionCount: number;
  };
}
```

### JSON Example

```json
{
  "rows": [
    {
      "sourceChain": "ethereum",
      "cells": [
        {
          "sourceChain": "ethereum",
          "destinationChain": "polygon",
          "value": 1500,
          "metadata": {
            "volume": 2500000,
            "successRate": 98.5,
            "avgTime": 120000,
            "transactionCount": 1500
          }
        },
        {
          "sourceChain": "ethereum",
          "destinationChain": "arbitrum",
          "value": 890,
          "metadata": {
            "volume": 1800000,
            "successRate": 97.2,
            "avgTime": 180000,
            "transactionCount": 890
          }
        }
      ]
    }
  ],
  "columns": ["polygon", "arbitrum", "optimism", "avalanche"],
  "bridges": ["Stargate", "LayerZero", "Hop"],
  "timeRange": {
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-01-07T23:59:59Z"
  },
  "generatedAt": "2024-01-08T10:30:00Z"
}
```

## API Endpoints

### GET /analytics/heatmap

Get heatmap data with filters.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| startDate | string | Start date (ISO string), default: 7 days ago |
| endDate | string | End date (ISO string), default: now |
| bridges | string | Comma-separated bridge names to filter |
| tokens | string | Comma-separated tokens to filter |
| groupByBridge | boolean | Include bridge breakdown (default: false) |
| normalize | boolean | Normalize values to 0-100 scale (default: false) |

### GET /analytics/heatmap/export/:format

Export heatmap data in various formats.

**Formats:**
- `json` - Full structured data
- `csv` - CSV with source chain, destination chains, totals
- `matrix` - 2D array (row = source, col = destination)

### GET /analytics/heatmap/chain-pair/:sourceChain/:destinationChain

Get bridge breakdown for a specific chain pair.

**Example Response:**
```json
[
  { "bridgeName": "Stargate", "transfers": 800, "volume": 1500000, "successRate": 98.5 },
  { "bridgeName": "LayerZero", "transfers": 500, "volume": 800000, "successRate": 97.8 },
  { "bridgeName": "Hop", "transfers": 200, "volume": 200000, "successRate": 99.1 }
]
```

### GET /analytics/heatmap/timeseries/:periods

Get time-series heatmap data for trend analysis.

**Parameters:**
- `periods` - Number of periods to return
- `periodType` - day, week, or month (default: day)

## Visualization Ready

### Matrix Format
The heatmap data can be easily transformed to a 2D matrix for visualization libraries:

```typescript
// Transform to matrix
const { matrix, rowLabels, colLabels } = transformToMatrix(heatmapData);

// matrix[i][j] = value for rowLabels[i] -> colLabels[j]
```

### Color Scale
For heatmap coloring:
- Low (0-20): Light gray/blue
- Medium (20-60): Yellow/green
- High (60-100): Red/orange

## Filtering Examples

### Get last 30 days of data
```
GET /analytics/heatmap?startDate=2024-01-01&endDate=2024-01-31
```

### Get specific bridges only
```
GET /analytics/heatmap?bridges=Stargate,LayerZero
```

### Get normalized values for visualization
```
GET /analytics/heatmap?normalize=true
```

### Export as CSV
```
GET /analytics/heatmap/export/csv?startDate=2024-01-01&endDate=2024-01-31
```

## Data Aggregation Accuracy

The aggregation sums the following metrics:
- `totalTransfers` from bridge_analytics table
- `totalVolume` from bridge_analytics table  
- Weighted average for success rate

## Testing Requirements

### Validate Aggregation
- [ ] Sum of all cells equals total transactions in period
- [ ] Volume totals match source data
- [ ] Chain pair filtering works correctly
- [ ] Time range filtering works correctly

### Validate Export
- [ ] JSON export contains all fields
- [ ] CSV export has correct headers
- [ ] Matrix export has correct dimensions

### Validate Visualization
- [ ] Matrix transformation produces correct dimensions
- [ ] Normalization scales to 0-100 correctly
- [ ] Empty cells handled properly

## Future Enhancements

1. **Real-time Updates**: WebSocket for live data
2. **More Filters**: User segment, device type, geography
3. **Historical Comparison**: Compare periods side-by-side
4. **Drill-down**: Click cell to see transaction details
5. **Animated Transitions**: Animate between time periods