"use strict";
/**
 * Abandonment Tracking Controller
 *
 * REST API endpoints for quote abandonment metrics
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
exports.AbandonmentTrackingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const abandonment_tracking_service_1 = require("./abandonment-tracking.service");
let AbandonmentTrackingController = class AbandonmentTrackingController {
    constructor(abandonmentService) {
        this.abandonmentService = abandonmentService;
    }
    async getMetrics(startDate, endDate, bridgeName, sourceChain, destinationChain, token, groupBy) {
        const metrics = this.abandonmentService.getAbandonmentMetrics({
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            bridgeName,
            sourceChain,
            destinationChain,
            token,
            groupBy,
        });
        return metrics;
    }
    async getEvents(startDate, endDate, eventType, limit) {
        const events = this.abandonmentService.getEvents({
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            eventType: eventType,
            limit: limit ? parseInt(limit, 10) : undefined,
        });
        return { events, count: events.length };
    }
    async getStats() {
        return this.abandonmentService.getStats();
    }
};
exports.AbandonmentTrackingController = AbandonmentTrackingController;
__decorate([
    (0, common_1.Get)('metrics'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get quote abandonment metrics',
        description: 'Returns abandonment rate and related metrics for a time period',
    }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, description: 'Start date (ISO string)' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, description: 'End date (ISO string)' }),
    (0, swagger_1.ApiQuery)({ name: 'bridgeName', required: false, description: 'Filter by bridge name' }),
    (0, swagger_1.ApiQuery)({ name: 'sourceChain', required: false, description: 'Filter by source chain' }),
    (0, swagger_1.ApiQuery)({ name: 'destinationChain', required: false, description: 'Filter by destination chain' }),
    (0, swagger_1.ApiQuery)({ name: 'token', required: false, description: 'Filter by token' }),
    (0, swagger_1.ApiQuery)({ name: 'groupBy', required: false, description: 'Group by: bridge, sourceChain, destinationChain, token' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Abandonment metrics retrieved' }),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, common_1.Query)('bridgeName')),
    __param(3, (0, common_1.Query)('sourceChain')),
    __param(4, (0, common_1.Query)('destinationChain')),
    __param(5, (0, common_1.Query)('token')),
    __param(6, (0, common_1.Query)('groupBy')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AbandonmentTrackingController.prototype, "getMetrics", null);
__decorate([
    (0, common_1.Get)('events'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get quote events',
        description: 'Returns quote request and execution events for analysis',
    }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, description: 'Start date (ISO string)' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, description: 'End date (ISO string)' }),
    (0, swagger_1.ApiQuery)({ name: 'eventType', required: false, description: 'Filter by event type: quote_requested, quote_executed' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Number of events to return (default: 1000)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Events retrieved' }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, common_1.Query)('eventType')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], AbandonmentTrackingController.prototype, "getEvents", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get tracking statistics',
        description: 'Returns current tracking system statistics',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Statistics retrieved' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AbandonmentTrackingController.prototype, "getStats", null);
exports.AbandonmentTrackingController = AbandonmentTrackingController = __decorate([
    (0, swagger_1.ApiTags)('Analytics - Abandonment'),
    (0, common_1.Controller)('analytics/abandonment'),
    __metadata("design:paramtypes", [abandonment_tracking_service_1.AbandonmentTrackingService])
], AbandonmentTrackingController);
//# sourceMappingURL=abandonment-tracking.controller.js.map