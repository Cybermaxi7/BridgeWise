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
exports.LayerZeroController = void 0;
const common_1 = require("@nestjs/common");
const layerzero_service_1 = require("../services/layerzero.service");
const layerzero_type_1 = require("../types/layerzero.type");
class EstimateDto {
}
let LayerZeroController = class LayerZeroController {
    constructor(layerZeroService) {
        this.layerZeroService = layerZeroService;
    }
    /**
     * Get complete bridge estimate (fees + latency)
     * POST /layerzero/estimate
     */
    async getEstimate(dto) {
        this.validateEstimateDto(dto);
        const route = {
            sourceChainId: dto.sourceChainId,
            destinationChainId: dto.destinationChainId,
            tokenAddress: dto.tokenAddress,
        };
        return this.layerZeroService.getBridgeEstimate(route, dto.payload);
    }
    /**
     * Get fee estimate only
     * POST /layerzero/estimate/fees
     */
    async estimateFees(dto) {
        this.validateEstimateDto(dto);
        const route = {
            sourceChainId: dto.sourceChainId,
            destinationChainId: dto.destinationChainId,
            tokenAddress: dto.tokenAddress,
        };
        return this.layerZeroService.estimateFees(route, dto.payload);
    }
    /**
     * Get latency estimate only
     * POST /layerzero/estimate/latency
     */
    async estimateLatency(dto) {
        this.validateRouteDto(dto);
        const route = {
            sourceChainId: dto.sourceChainId,
            destinationChainId: dto.destinationChainId,
            tokenAddress: dto.tokenAddress,
        };
        return this.layerZeroService.estimateLatency(route);
    }
    /**
     * Health check for specific chain
     * GET /layerzero/health/:chainId
     */
    async checkHealth(chainId) {
        if (!this.isValidChainId(chainId)) {
            throw new common_1.BadRequestException(`Invalid chain ID: ${chainId}`);
        }
        return this.layerZeroService.checkHealth(chainId);
    }
    /**
     * Health check for all chains
     * GET /layerzero/health
     */
    async checkAllHealth() {
        return this.layerZeroService.checkAllHealth();
    }
    /**
     * Get cached health status
     * GET /layerzero/status
     */
    getStatus() {
        const status = this.layerZeroService.getHealthStatus();
        if (!status)
            return [];
        return Array.isArray(status) ? status : [status];
    }
    /**
     * Get cached health status for specific chain
     * GET /layerzero/status/:chainId
     */
    getChainStatus(chainId) {
        if (!this.isValidChainId(chainId)) {
            throw new common_1.BadRequestException(`Invalid chain ID: ${chainId}`);
        }
        const status = this.layerZeroService.getHealthStatus(chainId);
        if (!status) {
            throw new common_1.BadRequestException(`No health data available for chain ${chainId}`);
        }
        return status;
    }
    /**
     * Private validation methods
     */
    validateEstimateDto(dto) {
        if (!this.isValidChainId(dto.sourceChainId)) {
            throw new common_1.BadRequestException(`Invalid source chain ID: ${dto.sourceChainId}`);
        }
        if (!this.isValidChainId(dto.destinationChainId)) {
            throw new common_1.BadRequestException(`Invalid destination chain ID: ${dto.destinationChainId}`);
        }
        if (dto.sourceChainId === dto.destinationChainId) {
            throw new common_1.BadRequestException('Source and destination chains must be different');
        }
        if (!dto.tokenAddress || !dto.tokenAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
            throw new common_1.BadRequestException('Invalid token address');
        }
        if (!dto.payload || !dto.payload.startsWith('0x')) {
            throw new common_1.BadRequestException('Payload must be a hex string starting with 0x');
        }
    }
    validateRouteDto(dto) {
        if (!this.isValidChainId(dto.sourceChainId)) {
            throw new common_1.BadRequestException(`Invalid source chain ID: ${dto.sourceChainId}`);
        }
        if (!this.isValidChainId(dto.destinationChainId)) {
            throw new common_1.BadRequestException(`Invalid destination chain ID: ${dto.destinationChainId}`);
        }
        if (dto.sourceChainId === dto.destinationChainId) {
            throw new common_1.BadRequestException('Source and destination chains must be different');
        }
        if (!dto.tokenAddress || !dto.tokenAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
            throw new common_1.BadRequestException('Invalid token address');
        }
    }
    isValidChainId(chainId) {
        return Object.values(layerzero_type_1.LayerZeroChainId).includes(chainId);
    }
};
exports.LayerZeroController = LayerZeroController;
__decorate([
    (0, common_1.Post)('estimate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [EstimateDto]),
    __metadata("design:returntype", Promise)
], LayerZeroController.prototype, "getEstimate", null);
__decorate([
    (0, common_1.Post)('estimate/fees'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [EstimateDto]),
    __metadata("design:returntype", Promise)
], LayerZeroController.prototype, "estimateFees", null);
__decorate([
    (0, common_1.Post)('estimate/latency'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LayerZeroController.prototype, "estimateLatency", null);
__decorate([
    (0, common_1.Get)('health/:chainId'),
    __param(0, (0, common_1.Param)('chainId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], LayerZeroController.prototype, "checkHealth", null);
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LayerZeroController.prototype, "checkAllHealth", null);
__decorate([
    (0, common_1.Get)('status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Array)
], LayerZeroController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Get)('status/:chainId'),
    __param(0, (0, common_1.Param)('chainId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Object)
], LayerZeroController.prototype, "getChainStatus", null);
exports.LayerZeroController = LayerZeroController = __decorate([
    (0, common_1.Controller)('layerzero'),
    __metadata("design:paramtypes", [layerzero_service_1.LayerZeroService])
], LayerZeroController);
//# sourceMappingURL=layerzero.controller.js.map