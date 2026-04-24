"use strict";
/**
 * Token Metadata Controller
 *
 * REST API endpoints for fetching token metadata
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
exports.TokenMetadataController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const token_metadata_service_1 = require("./token-metadata.service");
let TokenMetadataController = class TokenMetadataController {
    constructor(tokenMetadataService) {
        this.tokenMetadataService = tokenMetadataService;
    }
    async getMetadata(chainId, address) {
        const metadata = await this.tokenMetadataService.getTokenMetadata({
            chainId: parseInt(chainId, 10),
            tokenAddress: address,
        });
        return metadata;
    }
    async getBatchMetadata(tokens) {
        const tokenPairs = tokens.split(',').map((t) => {
            const [chainId, address] = t.split(':');
            return { chainId: parseInt(chainId, 10), tokenAddress: address };
        });
        const results = await this.tokenMetadataService.batchGetMetadata(tokenPairs);
        return Object.fromEntries(results);
    }
    async getCacheStats() {
        return this.tokenMetadataService.getCacheStats();
    }
    async clearCache() {
        this.tokenMetadataService.clearCache();
        return { message: 'Cache cleared successfully' };
    }
};
exports.TokenMetadataController = TokenMetadataController;
__decorate([
    (0, common_1.Get)('metadata'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get token metadata',
        description: 'Fetches token metadata (name, symbol, logo, decimals) for a given chain and token address',
    }),
    (0, swagger_1.ApiQuery)({ name: 'chainId', type: Number, description: 'Chain ID (e.g., 1 for Ethereum, 137 for Polygon)' }),
    (0, swagger_1.ApiQuery)({ name: 'address', type: String, description: 'Token contract address' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Token metadata retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid request parameters' }),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, common_1.Query)('chainId')),
    __param(1, (0, common_1.Query)('address')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TokenMetadataController.prototype, "getMetadata", null);
__decorate([
    (0, common_1.Get)('metadata/batch'),
    (0, swagger_1.ApiOperation)({
        summary: 'Batch get token metadata',
        description: 'Fetches metadata for multiple tokens at once',
    }),
    (0, swagger_1.ApiQuery)({ name: 'tokens', type: String, description: 'Comma-separated list of chainId:address pairs (e.g., "1:0x...,137:0x...")' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Token metadata batch retrieved successfully' }),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, common_1.Query)('tokens')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TokenMetadataController.prototype, "getBatchMetadata", null);
__decorate([
    (0, common_1.Get)('cache/stats'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get cache statistics',
        description: 'Returns current cache size and statistics',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TokenMetadataController.prototype, "getCacheStats", null);
__decorate([
    (0, common_1.Get)('cache/clear'),
    (0, swagger_1.ApiOperation)({
        summary: 'Clear metadata cache',
        description: 'Clears all cached token metadata',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TokenMetadataController.prototype, "clearCache", null);
exports.TokenMetadataController = TokenMetadataController = __decorate([
    (0, swagger_1.ApiTags)('Token Metadata'),
    (0, common_1.Controller)('tokens'),
    __metadata("design:paramtypes", [token_metadata_service_1.TokenMetadataService])
], TokenMetadataController);
//# sourceMappingURL=token-metadata.controller.js.map