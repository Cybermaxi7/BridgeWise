"use strict";
/**
 * Bridge Usage Heatmap Controller
 *
 * REST API endpoints for heatmap visualization data
 */
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
exports.BridgeUsageHeatmapController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const bridge_usage_heatmap_service_1 = require("./bridge-usage-heatmap.service");
let BridgeUsageHeatmapController = class BridgeUsageHeatmapController {
    constructor(heatmapService) {
        this.heatmapService = heatmapService;
    }
    async getHeatmapData(startDate, endDate, bridges, tokens, groupByBridge, normalize) {
        return this.heatmapService.getHeatmapData({
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            bridges: bridges?.split(',').filter(Boolean),
            tokens: tokens?.split(',').filter(Boolean),
            groupByBridge: groupByBridge === 'true',
            normalize: normalize === 'true',
        });
    }
    async exportHeatmap(format, startDate, endDate, bridges) {
        return this.heatmapService.exportHeatmapData(format, {
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            bridges: bridges?.split(',').filter(Boolean),
        });
    }
    async getBridgeBreakdown(sourceChain, destinationChain, startDate, endDate) {
        return this.heatmapService.getBridgeBreakdown(sourceChain, destinationChain, startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
    }
    async getTimeSeriesHeatmap(periods, periodType) {
        return this.heatmapService.getTimeSeriesHeatmap(parseInt(periods, 10), periodType || 'day');
    }
};
exports.BridgeUsageHeatmapController = BridgeUsageHeatmapController;
__decorate([
    (0, common_1.Get)(''),
    (0, swagger_1.ApiOperation)({
        summary: 'Get bridge usage heatmap data',
        description: 'Returns aggregated usage data structured for heatmap visualization',
    }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, description: 'Start date (ISO string)' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, description: 'End date (ISO string)' }),
    (0, swagger_1.ApiQuery)({ name: 'bridges', required: false, description: 'Comma-separated bridge names to filter' }),
    (0, swagger_1.ApiQuery)({ name: 'tokens', required: false, description: 'Comma-separated tokens to filter' }),
    (0, swagger_1.ApiQuery)({ name: 'groupByBridge', required: false, description: 'Include bridge breakdown' }),
    (0, swagger_1.ApiQuery)({ name: 'normalize', required: false, description: 'Normalize values to 0-100 scale' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Heatmap data retrieved' }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, common_1.Query)('bridges')),
    __param(3, (0, common_1.Query)('tokens')),
    __param(4, (0, common_1.Query)('groupByBridge')),
    __param(5, (0, common_1.Query)('normalize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], BridgeUsageHeatmapController.prototype, "getHeatmapData", null);
__decorate([
    (0, common_1.Get)('export/:format'),
    (0, swagger_1.ApiOperation)({
        summary: 'Export heatmap data',
        description: 'Export heatmap data in various formats (json, csv, matrix)',
    }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, description: 'Start date (ISO string)' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, description: 'End date (ISO string)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Exported data' }),
    __param(0, (0, common_1.Param)('format')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __param(3, (0, common_1.Query)('bridges')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], BridgeUsageHeatmapController.prototype, "exportHeatmap", null);
__decorate([
    (0, common_1.Get)('chain-pair/:sourceChain/:destinationChain'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get bridge breakdown for chain pair',
        description: 'Returns usage breakdown by bridge for a specific source-destination chain pair',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Bridge breakdown retrieved' }),
    __param(0, (0, common_1.Param)('sourceChain')),
    __param(1, (0, common_1.Param)('destinationChain')),
    __param(2, (0, common_1.Query)('startDate')),
    __param(3, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], BridgeUsageHeatmapController.prototype, "getBridgeBreakdown", null);
__decorate([
    (0, common_1.Get)('timeseries/:periods'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get time-series heatmap data',
        description: 'Returns heatmap data for multiple time periods for trend analysis',
    }),
    (0, swagger_1.ApiQuery)({ name: 'periodType', required: false, description: 'day, week, or month' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Time-series heatmap data retrieved' }),
    __param(0, (0, common_1.Param)('periods')),
    __param(1, (0, common_1.Query)('periodType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BridgeUsageHeatmapController.prototype, "getTimeSeriesHeatmap", null);
exports.BridgeUsageHeatmapController = BridgeUsageHeatmapController = __decorate([
    (0, swagger_1.ApiTags)('Analytics - Heatmap'),
    (0, common_1.Controller)('analytics/heatmap'),
    __metadata("design:paramtypes", [bridge_usage_heatmap_service_1.BridgeUsageHeatmapService])
], BridgeUsageHeatmapController);
//# sourceMappingURL=bridge-usage-heatmap.controller.js.map