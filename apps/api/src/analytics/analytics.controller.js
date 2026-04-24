"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const analytics_service_1 = require("./analytics.service");
const bridge_analytics_dto_1 = require("./dto/bridge-analytics.dto");
/**
 * Analytics Controller
 *
 * REST API endpoints for BridgeWise analytics data.
 * Provides metrics on bridge usage, performance, and trends.
 */
let AnalyticsController = class AnalyticsController {
    constructor(analyticsService) {
        this.analyticsService = analyticsService;
    }
    /**
     * Get aggregated analytics data with optional filters
     */
    async getAnalytics(query) {
        return this.analyticsService.getAnalytics(query);
    }
    /**
     * Get analytics for a specific route
     */
    async getRouteAnalytics(bridgeName, sourceChain, destinationChain, token) {
        const analytics = await this.analyticsService.getRouteAnalytics(bridgeName, sourceChain, destinationChain, token);
        if (!analytics) {
            // Return empty analytics for new routes
            return {
                bridgeName,
                sourceChain,
                destinationChain,
                token,
                totalTransfers: 0,
                successfulTransfers: 0,
                failedTransfers: 0,
                successRate: 0,
                failureRate: 0,
                totalVolume: 0,
                lastUpdated: new Date(),
            };
        }
        return analytics;
    }
    /**
     * Get time-series analytics data for trend analysis
     */
    async getTimeSeriesAnalytics(bridgeName, sourceChain, destinationChain, granularity, startDate, endDate, token) {
        return this.analyticsService.getTimeSeriesAnalytics(bridgeName, sourceChain, destinationChain, granularity, new Date(startDate), new Date(endDate), token);
    }
    /**
     * Get top performing bridges
     */
    async getTopPerformingBridges(limit) {
        const limitNum = limit ? parseInt(limit, 10) : 10;
        return this.analyticsService.getTopPerformingBridges(limitNum);
    }
    /**
     * Get slippage statistics for a route
     */
    async getSlippageStatistics(bridgeName, sourceChain, destinationChain, token) {
        const stats = await this.analyticsService.getSlippageStatistics(bridgeName, sourceChain, destinationChain, token);
        if (!stats) {
            return { message: 'No slippage data available for this route' };
        }
        return stats;
    }
    /**
     * Get user activity insights
     */
    async getUserActivityInsights() {
        return this.analyticsService.getUserActivityInsights();
    }
    /**
     * Trigger analytics recalculation
     * Useful for initial setup or data correction
     */
    async recalculateAnalytics() {
        await this.analyticsService.recalculateAllAnalytics();
        return { message: 'Analytics recalculation completed successfully' };
    }
};
exports.AnalyticsController = AnalyticsController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Get bridge analytics data',
        description: 'Returns aggregated analytics metrics for bridge routes with optional filtering by bridge, chain, token, and time range.',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Analytics data retrieved successfully',
        type: bridge_analytics_dto_1.BridgeAnalyticsResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Invalid query parameters',
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bridge_analytics_dto_1.BridgeAnalyticsQueryDto]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getAnalytics", null);
__decorate([
    (0, common_1.Get)('routes/:bridgeName/:sourceChain/:destinationChain'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Get analytics for a specific route',
        description: 'Returns detailed analytics for a specific bridge route.',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Route analytics retrieved successfully',
        type: bridge_analytics_dto_1.RouteAnalyticsDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Route analytics not found',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'token',
        required: false,
        description: 'Filter by token symbol',
    }),
    __param(0, (0, common_1.Param)('bridgeName')),
    __param(1, (0, common_1.Param)('sourceChain')),
    __param(2, (0, common_1.Param)('destinationChain')),
    __param(3, (0, common_1.Query)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getRouteAnalytics", null);
__decorate([
    (0, common_1.Get)('trends/:bridgeName/:sourceChain/:destinationChain'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Get time-series analytics trends',
        description: 'Returns time-series data for analyzing trends over time.',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Trend data retrieved successfully',
        type: bridge_analytics_dto_1.TimeSeriesAnalyticsDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Invalid parameters',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'granularity',
        required: true,
        enum: ['hour', 'day', 'week', 'month'],
        description: 'Time granularity for data points',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'startDate',
        required: true,
        description: 'Start date (ISO 8601)',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'endDate',
        required: true,
        description: 'End date (ISO 8601)',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'token',
        required: false,
        description: 'Filter by token symbol',
    }),
    __param(0, (0, common_1.Param)('bridgeName')),
    __param(1, (0, common_1.Param)('sourceChain')),
    __param(2, (0, common_1.Param)('destinationChain')),
    __param(3, (0, common_1.Query)('granularity', new common_1.ParseEnumPipe(['hour', 'day', 'week', 'month']))),
    __param(4, (0, common_1.Query)('startDate')),
    __param(5, (0, common_1.Query)('endDate')),
    __param(6, (0, common_1.Query)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getTimeSeriesAnalytics", null);
__decorate([
    (0, common_1.Get)('top-performing'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Get top performing bridges',
        description: 'Returns top bridges ranked by volume, success rate, and speed.',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Top performing bridges retrieved successfully',
        type: bridge_analytics_dto_1.TopPerformingBridgesDto,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        description: 'Number of results per category (default: 10)',
    }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getTopPerformingBridges", null);
__decorate([
    (0, common_1.Get)('slippage/:bridgeName/:sourceChain/:destinationChain'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Get slippage statistics',
        description: 'Returns slippage distribution and statistics for a route.',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Slippage statistics retrieved successfully',
        type: bridge_analytics_dto_1.SlippageStatisticsDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'No slippage data available',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'token',
        required: false,
        description: 'Filter by token symbol',
    }),
    __param(0, (0, common_1.Param)('bridgeName')),
    __param(1, (0, common_1.Param)('sourceChain')),
    __param(2, (0, common_1.Param)('destinationChain')),
    __param(3, (0, common_1.Query)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getSlippageStatistics", null);
__decorate([
    (0, common_1.Get)('insights/user-activity'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Get user activity insights',
        description: 'Returns aggregated user activity metrics and popular routes.',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'User activity insights retrieved successfully',
        type: bridge_analytics_dto_1.UserActivityInsightsDto,
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getUserActivityInsights", null);
__decorate([
    (0, common_1.Get)('admin/recalculate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Recalculate all analytics',
        description: 'Recalculates all analytics from raw data. Use with caution.',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Analytics recalculation started',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "recalculateAnalytics", null);
exports.AnalyticsController = AnalyticsController = __decorate([
    (0, swagger_1.ApiTags)('Bridge Analytics'),
    (0, common_1.Controller)('api/v1/bridge-analytics'),
    __metadata("design:paramtypes", [analytics_service_1.AnalyticsService])
], AnalyticsController);
//# sourceMappingURL=analytics.controller.js.map