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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkCongestionDto = exports.FeeComparisonResponseDto = exports.FeeComparisonDto = exports.FeeComparisonQueryDto = exports.GasPriceDto = exports.BatchFeeEstimateResponseDto = exports.BatchFeeEstimateQueryDto = exports.FeeEstimateDto = exports.FeeEstimateQueryDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
/**
 * DTO for fee estimate query
 */
class FeeEstimateQueryDto {
    constructor() {
        this.includeUsd = true;
    }
}
exports.FeeEstimateQueryDto = FeeEstimateQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Bridge name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FeeEstimateQueryDto.prototype, "bridgeName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Source chain' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FeeEstimateQueryDto.prototype, "sourceChain", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Destination chain' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FeeEstimateQueryDto.prototype, "destinationChain", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Token symbol' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FeeEstimateQueryDto.prototype, "token", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Transfer amount' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], FeeEstimateQueryDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Include USD estimates', default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Boolean),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], FeeEstimateQueryDto.prototype, "includeUsd", void 0);
/**
 * DTO for fee estimate response
 */
class FeeEstimateDto {
}
exports.FeeEstimateDto = FeeEstimateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Bridge name' }),
    __metadata("design:type", String)
], FeeEstimateDto.prototype, "bridgeName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Source chain' }),
    __metadata("design:type", String)
], FeeEstimateDto.prototype, "sourceChain", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Destination chain' }),
    __metadata("design:type", String)
], FeeEstimateDto.prototype, "destinationChain", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Token symbol' }),
    __metadata("design:type", String)
], FeeEstimateDto.prototype, "token", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Transfer amount' }),
    __metadata("design:type", Number)
], FeeEstimateDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total fee in native token' }),
    __metadata("design:type", Number)
], FeeEstimateDto.prototype, "totalFee", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Gas fee component' }),
    __metadata("design:type", Number)
], FeeEstimateDto.prototype, "gasFee", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Bridge fee component' }),
    __metadata("design:type", Number)
], FeeEstimateDto.prototype, "bridgeFee", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Liquidity-based fee component', default: 0 }),
    __metadata("design:type", Number)
], FeeEstimateDto.prototype, "liquidityFee", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Protocol fee component', default: 0 }),
    __metadata("design:type", Number)
], FeeEstimateDto.prototype, "protocolFee", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Gas price in Gwei' }),
    __metadata("design:type", Number)
], FeeEstimateDto.prototype, "gasPriceGwei", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Gas limit estimate' }),
    __metadata("design:type", Number)
], FeeEstimateDto.prototype, "gasLimit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Network congestion level (0-100)' }),
    __metadata("design:type", Number)
], FeeEstimateDto.prototype, "networkCongestion", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Token used for fee payment' }),
    __metadata("design:type", String)
], FeeEstimateDto.prototype, "feeToken", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Fee token price in USD' }),
    __metadata("design:type", Number)
], FeeEstimateDto.prototype, "feeTokenPriceUsd", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Total fee in USD' }),
    __metadata("design:type", Number)
], FeeEstimateDto.prototype, "totalFeeUsd", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether this is a fallback estimate',
        default: false,
    }),
    __metadata("design:type", Boolean)
], FeeEstimateDto.prototype, "isFallback", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reason for fallback if applicable' }),
    __metadata("design:type", String)
], FeeEstimateDto.prototype, "fallbackReason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Estimated transaction duration in seconds',
    }),
    __metadata("design:type", Number)
], FeeEstimateDto.prototype, "estimatedDurationSeconds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last update timestamp' }),
    __metadata("design:type", Date)
], FeeEstimateDto.prototype, "lastUpdated", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Expiration timestamp' }),
    __metadata("design:type", Date)
], FeeEstimateDto.prototype, "expiresAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Cache TTL in seconds' }),
    __metadata("design:type", Number)
], FeeEstimateDto.prototype, "cacheTtlSeconds", void 0);
/**
 * DTO for batch fee estimates
 */
class BatchFeeEstimateQueryDto {
    constructor() {
        this.includeUsd = true;
    }
}
exports.BatchFeeEstimateQueryDto = BatchFeeEstimateQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Array of route identifiers', type: [Object] }),
    __metadata("design:type", Array)
], BatchFeeEstimateQueryDto.prototype, "routes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Include USD estimates', default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], BatchFeeEstimateQueryDto.prototype, "includeUsd", void 0);
/**
 * DTO for batch fee estimate response
 */
class BatchFeeEstimateResponseDto {
}
exports.BatchFeeEstimateResponseDto = BatchFeeEstimateResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Fee estimates for each route',
        type: [FeeEstimateDto],
    }),
    __metadata("design:type", Array)
], BatchFeeEstimateResponseDto.prototype, "estimates", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of successful estimates' }),
    __metadata("design:type", Number)
], BatchFeeEstimateResponseDto.prototype, "successful", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of fallback estimates' }),
    __metadata("design:type", Number)
], BatchFeeEstimateResponseDto.prototype, "fallbacks", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Response generation timestamp' }),
    __metadata("design:type", Date)
], BatchFeeEstimateResponseDto.prototype, "generatedAt", void 0);
/**
 * DTO for gas price response
 */
class GasPriceDto {
}
exports.GasPriceDto = GasPriceDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Chain name' }),
    __metadata("design:type", String)
], GasPriceDto.prototype, "chain", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Gas price in Gwei' }),
    __metadata("design:type", Number)
], GasPriceDto.prototype, "gasPriceGwei", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Base fee (EIP-1559)' }),
    __metadata("design:type", Number)
], GasPriceDto.prototype, "baseFeeGwei", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Priority fee (EIP-1559)' }),
    __metadata("design:type", Number)
], GasPriceDto.prototype, "priorityFeeGwei", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Network congestion level (0-100)' }),
    __metadata("design:type", Number)
], GasPriceDto.prototype, "congestionLevel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Recommended gas limit' }),
    __metadata("design:type", Number)
], GasPriceDto.prototype, "recommendedGasLimit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last updated timestamp' }),
    __metadata("design:type", Date)
], GasPriceDto.prototype, "lastUpdated", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Expiration timestamp' }),
    __metadata("design:type", Date)
], GasPriceDto.prototype, "expiresAt", void 0);
/**
 * DTO for fee comparison request
 */
class FeeComparisonQueryDto {
}
exports.FeeComparisonQueryDto = FeeComparisonQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Source chain' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FeeComparisonQueryDto.prototype, "sourceChain", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Destination chain' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FeeComparisonQueryDto.prototype, "destinationChain", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Token symbol' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FeeComparisonQueryDto.prototype, "token", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Transfer amount' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], FeeComparisonQueryDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Bridge names to compare' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], FeeComparisonQueryDto.prototype, "bridges", void 0);
/**
 * DTO for fee comparison result
 */
class FeeComparisonDto {
}
exports.FeeComparisonDto = FeeComparisonDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Bridge name' }),
    __metadata("design:type", String)
], FeeComparisonDto.prototype, "bridgeName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total fee' }),
    __metadata("design:type", Number)
], FeeComparisonDto.prototype, "totalFee", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Total fee in USD' }),
    __metadata("design:type", Number)
], FeeComparisonDto.prototype, "totalFeeUsd", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Fee breakdown' }),
    __metadata("design:type", Object)
], FeeComparisonDto.prototype, "breakdown", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether this is a fallback estimate' }),
    __metadata("design:type", Boolean)
], FeeComparisonDto.prototype, "isFallback", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Rank by total fee (1 = cheapest)' }),
    __metadata("design:type", Number)
], FeeComparisonDto.prototype, "rank", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Savings compared to most expensive option' }),
    __metadata("design:type", Number)
], FeeComparisonDto.prototype, "savingsPercent", void 0);
/**
 * DTO for fee comparison response
 */
class FeeComparisonResponseDto {
}
exports.FeeComparisonResponseDto = FeeComparisonResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Fee comparisons', type: [FeeComparisonDto] }),
    __metadata("design:type", Array)
], FeeComparisonResponseDto.prototype, "comparisons", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Cheapest option' }),
    __metadata("design:type", FeeComparisonDto)
], FeeComparisonResponseDto.prototype, "cheapest", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Fastest option (if data available)' }),
    __metadata("design:type", FeeComparisonDto)
], FeeComparisonResponseDto.prototype, "fastest", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Source chain' }),
    __metadata("design:type", String)
], FeeComparisonResponseDto.prototype, "sourceChain", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Destination chain' }),
    __metadata("design:type", String)
], FeeComparisonResponseDto.prototype, "destinationChain", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Response generation timestamp' }),
    __metadata("design:type", Date)
], FeeComparisonResponseDto.prototype, "generatedAt", void 0);
/**
 * DTO for network congestion status
 */
class NetworkCongestionDto {
}
exports.NetworkCongestionDto = NetworkCongestionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Chain name' }),
    __metadata("design:type", String)
], NetworkCongestionDto.prototype, "chain", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Congestion level (0-100)' }),
    __metadata("design:type", Number)
], NetworkCongestionDto.prototype, "congestionLevel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Congestion status' }),
    __metadata("design:type", String)
], NetworkCongestionDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Average gas price in Gwei' }),
    __metadata("design:type", Number)
], NetworkCongestionDto.prototype, "averageGasPriceGwei", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Pending transaction count' }),
    __metadata("design:type", Number)
], NetworkCongestionDto.prototype, "pendingTransactions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Average block time in seconds' }),
    __metadata("design:type", Number)
], NetworkCongestionDto.prototype, "averageBlockTimeSeconds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last updated timestamp' }),
    __metadata("design:type", Date)
], NetworkCongestionDto.prototype, "lastUpdated", void 0);
//# sourceMappingURL=fee-estimate.dto.js.map