/**
 * Bridge Usage Heatmap Controller
 * 
 * REST API endpoints for heatmap visualization data
 */

import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { BridgeUsageHeatmapService } from './bridge-usage-heatmap.service';

@ApiTags('Analytics - Heatmap')
@Controller('analytics/heatmap')
export class BridgeUsageHeatmapController {
  constructor(private readonly heatmapService: BridgeUsageHeatmapService) {}

  @Get('')
  @ApiOperation({
    summary: 'Get bridge usage heatmap data',
    description: 'Returns aggregated usage data structured for heatmap visualization',
  })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date (ISO string)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (ISO string)' })
  @ApiQuery({ name: 'bridges', required: false, description: 'Comma-separated bridge names to filter' })
  @ApiQuery({ name: 'tokens', required: false, description: 'Comma-separated tokens to filter' })
  @ApiQuery({ name: 'groupByBridge', required: false, description: 'Include bridge breakdown' })
  @ApiQuery({ name: 'normalize', required: false, description: 'Normalize values to 0-100 scale' })
  @ApiResponse({ status: 200, description: 'Heatmap data retrieved' })
  async getHeatmapData(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('bridges') bridges?: string,
    @Query('tokens') tokens?: string,
    @Query('groupByBridge') groupByBridge?: string,
    @Query('normalize') normalize?: string,
  ) {
    return this.heatmapService.getHeatmapData({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      bridges: bridges?.split(',').filter(Boolean),
      tokens: tokens?.split(',').filter(Boolean),
      groupByBridge: groupByBridge === 'true',
      normalize: normalize === 'true',
    });
  }

  @Get('export/:format')
  @ApiOperation({
    summary: 'Export heatmap data',
    description: 'Export heatmap data in various formats (json, csv, matrix)',
  })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date (ISO string)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (ISO string)' })
  @ApiResponse({ status: 200, description: 'Exported data' })
  async exportHeatmap(
    @Param('format') format: 'json' | 'csv' | 'matrix',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('bridges') bridges?: string,
  ) {
    return this.heatmapService.exportHeatmapData(format, {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      bridges: bridges?.split(',').filter(Boolean),
    });
  }

  @Get('chain-pair/:sourceChain/:destinationChain')
  @ApiOperation({
    summary: 'Get bridge breakdown for chain pair',
    description: 'Returns usage breakdown by bridge for a specific source-destination chain pair',
  })
  @ApiResponse({ status: 200, description: 'Bridge breakdown retrieved' })
  async getBridgeBreakdown(
    @Param('sourceChain') sourceChain: string,
    @Param('destinationChain') destinationChain: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.heatmapService.getBridgeBreakdown(
      sourceChain,
      destinationChain,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('timeseries/:periods')
  @ApiOperation({
    summary: 'Get time-series heatmap data',
    description: 'Returns heatmap data for multiple time periods for trend analysis',
  })
  @ApiQuery({ name: 'periodType', required: false, description: 'day, week, or month' })
  @ApiResponse({ status: 200, description: 'Time-series heatmap data retrieved' })
  async getTimeSeriesHeatmap(
    @Param('periods') periods: string,
    @Query('periodType') periodType?: 'day' | 'week' | 'month',
  ) {
    return this.heatmapService.getTimeSeriesHeatmap(
      parseInt(periods, 10),
      periodType || 'day',
    );
  }
}