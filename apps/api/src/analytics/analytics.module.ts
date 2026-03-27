import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsCollector } from './analytics.collector';
import { AbandonmentTrackingService } from './abandonment-tracking.service';
import { AbandonmentTrackingController } from './abandonment-tracking.controller';
import { BridgeUsageHeatmapService } from './bridge-usage-heatmap.service';
import { BridgeUsageHeatmapController } from './bridge-usage-heatmap.controller';
import { BridgeAnalytics } from './entities/bridge-analytics.entity';

/**
 * Analytics Module
 *
 * Provides analytics functionality for BridgeWise including:
 * - Aggregated metrics for bridge routes
 * - Time-series data for trend analysis
 * - Real-time data collection from transactions
 * - REST API endpoints for analytics data
 * - Quote abandonment tracking
 * - Bridge usage heatmap data
 */
@Module({
  imports: [TypeOrmModule.forFeature([BridgeAnalytics])],
  controllers: [
    AnalyticsController,
    AbandonmentTrackingController,
    BridgeUsageHeatmapController,
  ],
  providers: [
    AnalyticsService,
    AnalyticsCollector,
    AbandonmentTrackingService,
    BridgeUsageHeatmapService,
  ],
  exports: [
    AnalyticsService,
    AnalyticsCollector,
    AbandonmentTrackingService,
    BridgeUsageHeatmapService,
  ],
})
export class AnalyticsModule {}
