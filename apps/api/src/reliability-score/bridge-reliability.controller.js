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
exports.BridgeReliabilityController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const bridge_reliability_service_1 = require("./bridge-reliability.service");
const reliability_dto_1 = require("./reliability.dto");
let BridgeReliabilityController = class BridgeReliabilityController {
    constructor(reliabilityService) {
        this.reliabilityService = reliabilityService;
    }
    /**
     * Record a bridge transaction outcome (called internally by bridge adapters).
     */
    async recordEvent(dto) {
        return this.reliabilityService.recordEvent(dto);
    }
    /**
     * Get reliability score for a specific bridge route.
     */
    async getReliability(dto) {
        return this.reliabilityService.getReliability(dto);
    }
    /**
     * Get all cached reliability metrics (for admin / ranking engine).
     */
    async getAllMetrics() {
        return this.reliabilityService.getAllMetrics();
    }
    /**
     * Get ranking adjustment factors for all bridges on a route.
     * Called by Smart Bridge Ranking engine (Issue #5).
     */
    async getRankingFactors(sourceChain, destinationChain, threshold, ignoreReliability) {
        return this.reliabilityService.getBulkReliabilityFactors(sourceChain, destinationChain, { threshold, ignoreReliability });
    }
};
exports.BridgeReliabilityController = BridgeReliabilityController;
__decorate([
    (0, common_1.Post)('events'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Record a bridge transaction outcome' }),
    (0, swagger_1.ApiBody)({ type: reliability_dto_1.RecordBridgeEventDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reliability_dto_1.RecordBridgeEventDto]),
    __metadata("design:returntype", Promise)
], BridgeReliabilityController.prototype, "recordEvent", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get reliability score for a bridge route' }),
    (0, swagger_1.ApiOkResponse)({ type: reliability_dto_1.BridgeReliabilityResponseDto }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reliability_dto_1.GetReliabilityDto]),
    __metadata("design:returntype", Promise)
], BridgeReliabilityController.prototype, "getReliability", null);
__decorate([
    (0, common_1.Get)('all'),
    (0, swagger_1.ApiOperation)({ summary: 'List all bridge reliability metrics (admin)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BridgeReliabilityController.prototype, "getAllMetrics", null);
__decorate([
    (0, common_1.Get)('ranking-factors'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get reliability ranking factors for a route',
        description: 'Returns reliability-adjusted scores for all bridges on a route.',
    }),
    __param(0, (0, common_1.Query)('sourceChain')),
    __param(1, (0, common_1.Query)('destinationChain')),
    __param(2, (0, common_1.Query)('threshold')),
    __param(3, (0, common_1.Query)('ignoreReliability')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Boolean]),
    __metadata("design:returntype", Promise)
], BridgeReliabilityController.prototype, "getRankingFactors", null);
exports.BridgeReliabilityController = BridgeReliabilityController = __decorate([
    (0, swagger_1.ApiTags)('Bridge Reliability'),
    (0, common_1.Controller)('bridge-reliability'),
    __metadata("design:paramtypes", [bridge_reliability_service_1.BridgeReliabilityService])
], BridgeReliabilityController);
//# sourceMappingURL=bridge-reliability.controller.js.map