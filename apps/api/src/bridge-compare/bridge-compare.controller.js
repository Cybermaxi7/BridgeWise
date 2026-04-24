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
exports.BridgeCompareController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const bridge_compare_service_1 = require("./bridge-compare.service");
const bridge_status_service_1 = require("./bridge-status.service");
const dto_1 = require("./dto");
let BridgeCompareController = class BridgeCompareController {
    constructor(bridgeCompareService, bridgeStatusService) {
        this.bridgeCompareService = bridgeCompareService;
        this.bridgeStatusService = bridgeStatusService;
    }
    async getQuotes(dto) {
        return this.bridgeCompareService.getQuotes(dto);
    }
    async getRouteDetails(bridgeId, dto) {
        return this.bridgeCompareService.getRouteDetails(dto, bridgeId);
    }
    getSupportedBridges() {
        return this.bridgeCompareService.getSupportedBridges();
    }
    getAllBridgesStatus() {
        return this.bridgeStatusService.getAllBridgesStatus();
    }
    getBridgeStatus(bridgeId) {
        return this.bridgeStatusService.getBridgeStatus(bridgeId);
    }
};
exports.BridgeCompareController = BridgeCompareController;
__decorate([
    (0, common_1.Get)('quotes'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Fetch ranked bridge quotes',
        description: 'Returns normalized, ranked quotes from all supported bridge providers for the requested route.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Ranked quotes returned successfully',
    }),
    (0, swagger_1.ApiBadRequestResponse)({ description: 'Invalid request parameters' }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'No routes found for the token pair' }),
    (0, swagger_1.ApiServiceUnavailableResponse)({
        description: 'All bridge providers unavailable',
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.GetQuotesDto]),
    __metadata("design:returntype", Promise)
], BridgeCompareController.prototype, "getQuotes", null);
__decorate([
    (0, common_1.Get)('quotes/:bridgeId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Get specific bridge route details',
        description: 'Returns the full normalized quote for a specific bridge provider.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'bridgeId',
        description: 'Bridge provider identifier',
        example: 'stargate',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Route details returned' }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Route not found' }),
    __param(0, (0, common_1.Param)('bridgeId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.GetQuotesDto]),
    __metadata("design:returntype", Promise)
], BridgeCompareController.prototype, "getRouteDetails", null);
__decorate([
    (0, common_1.Get)('providers'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'List all supported bridge providers',
        description: 'Returns all configured bridge providers with their supported chains and tokens.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Providers listed successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BridgeCompareController.prototype, "getSupportedBridges", null);
__decorate([
    (0, common_1.Get)('status'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all bridge statuses',
        description: 'Returns the current status and uptime metrics for all bridge providers.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Bridge statuses returned successfully',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Array)
], BridgeCompareController.prototype, "getAllBridgesStatus", null);
__decorate([
    (0, common_1.Get)('status/:bridgeId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Get specific bridge status',
        description: 'Returns the current status, uptime, and health metrics for a specific bridge.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'bridgeId',
        description: 'Bridge provider identifier',
        example: 'stargate',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Bridge status returned' }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Bridge not found' }),
    __param(0, (0, common_1.Param)('bridgeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Object)
], BridgeCompareController.prototype, "getBridgeStatus", null);
exports.BridgeCompareController = BridgeCompareController = __decorate([
    (0, swagger_1.ApiTags)('bridge-compare'),
    (0, common_1.Controller)('bridge-compare'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
    })),
    __metadata("design:paramtypes", [bridge_compare_service_1.BridgeCompareService,
        bridge_status_service_1.BridgeStatusService])
], BridgeCompareController);
//# sourceMappingURL=bridge-compare.controller.js.map