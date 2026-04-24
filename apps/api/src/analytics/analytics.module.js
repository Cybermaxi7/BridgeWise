"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const analytics_service_1 = require("./analytics.service");
const analytics_controller_1 = require("./analytics.controller");
const analytics_collector_1 = require("./analytics.collector");
const abandonment_tracking_service_1 = require("./abandonment-tracking.service");
const abandonment_tracking_controller_1 = require("./abandonment-tracking.controller");
const bridge_usage_heatmap_service_1 = require("./bridge-usage-heatmap.service");
const bridge_usage_heatmap_controller_1 = require("./bridge-usage-heatmap.controller");
const bridge_analytics_entity_1 = require("./entities/bridge-analytics.entity");
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
let AnalyticsModule = class AnalyticsModule {
};
exports.AnalyticsModule = AnalyticsModule;
exports.AnalyticsModule = AnalyticsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([bridge_analytics_entity_1.BridgeAnalytics])],
        controllers: [
            analytics_controller_1.AnalyticsController,
            abandonment_tracking_controller_1.AbandonmentTrackingController,
            bridge_usage_heatmap_controller_1.BridgeUsageHeatmapController,
        ],
        providers: [
            analytics_service_1.AnalyticsService,
            analytics_collector_1.AnalyticsCollector,
            abandonment_tracking_service_1.AbandonmentTrackingService,
            bridge_usage_heatmap_service_1.BridgeUsageHeatmapService,
        ],
        exports: [
            analytics_service_1.AnalyticsService,
            analytics_collector_1.AnalyticsCollector,
            abandonment_tracking_service_1.AbandonmentTrackingService,
            bridge_usage_heatmap_service_1.BridgeUsageHeatmapService,
        ],
    })
], AnalyticsModule);
//# sourceMappingURL=analytics.module.js.map