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
exports.ReliabilityRankingFactorDto = exports.BridgeReliabilityResponseDto = exports.ReliabilityBadgeDto = exports.GetReliabilityDto = exports.RecordBridgeEventDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const reliability_enum_1 = require("./reliability.enum");
// ─── Record Event ────────────────────────────────────────────────────────────
class RecordBridgeEventDto {
}
exports.RecordBridgeEventDto = RecordBridgeEventDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Stargate' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RecordBridgeEventDto.prototype, "bridgeName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ethereum' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RecordBridgeEventDto.prototype, "sourceChain", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'polygon' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RecordBridgeEventDto.prototype, "destinationChain", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: reliability_enum_1.TransactionOutcome }),
    (0, class_validator_1.IsEnum)(reliability_enum_1.TransactionOutcome),
    __metadata("design:type", String)
], RecordBridgeEventDto.prototype, "outcome", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '0xabc123' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecordBridgeEventDto.prototype, "transactionHash", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'RPC timeout after 30s' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecordBridgeEventDto.prototype, "failureReason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 12000 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], RecordBridgeEventDto.prototype, "durationMs", void 0);
// ─── Query Reliability ────────────────────────────────────────────────────────
class GetReliabilityDto {
}
exports.GetReliabilityDto = GetReliabilityDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Stargate' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], GetReliabilityDto.prototype, "bridgeName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ethereum' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], GetReliabilityDto.prototype, "sourceChain", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'polygon' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], GetReliabilityDto.prototype, "destinationChain", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: reliability_enum_1.WindowMode,
        default: reliability_enum_1.WindowMode.TRANSACTION_COUNT,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(reliability_enum_1.WindowMode),
    __metadata("design:type", String)
], GetReliabilityDto.prototype, "windowMode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 100 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(10000),
    __metadata("design:type", Number)
], GetReliabilityDto.prototype, "windowSize", void 0);
// ─── Response ─────────────────────────────────────────────────────────────────
class ReliabilityBadgeDto {
}
exports.ReliabilityBadgeDto = ReliabilityBadgeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: reliability_enum_1.ReliabilityTier }),
    __metadata("design:type", String)
], ReliabilityBadgeDto.prototype, "tier", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'High Reliability' }),
    __metadata("design:type", String)
], ReliabilityBadgeDto.prototype, "label", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '#22c55e' }),
    __metadata("design:type", String)
], ReliabilityBadgeDto.prototype, "color", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Score based on last 100 transactions. Excludes user-cancelled events.',
    }),
    __metadata("design:type", String)
], ReliabilityBadgeDto.prototype, "tooltip", void 0);
class BridgeReliabilityResponseDto {
}
exports.BridgeReliabilityResponseDto = BridgeReliabilityResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Stargate' }),
    __metadata("design:type", String)
], BridgeReliabilityResponseDto.prototype, "bridgeName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ethereum' }),
    __metadata("design:type", String)
], BridgeReliabilityResponseDto.prototype, "sourceChain", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'polygon' }),
    __metadata("design:type", String)
], BridgeReliabilityResponseDto.prototype, "destinationChain", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 240 }),
    __metadata("design:type", Number)
], BridgeReliabilityResponseDto.prototype, "totalAttempts", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 235 }),
    __metadata("design:type", Number)
], BridgeReliabilityResponseDto.prototype, "successfulTransfers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 3 }),
    __metadata("design:type", Number)
], BridgeReliabilityResponseDto.prototype, "failedTransfers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2 }),
    __metadata("design:type", Number)
], BridgeReliabilityResponseDto.prototype, "timeoutCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 97.92 }),
    __metadata("design:type", Number)
], BridgeReliabilityResponseDto.prototype, "reliabilityPercent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 97.92 }),
    __metadata("design:type", Number)
], BridgeReliabilityResponseDto.prototype, "reliabilityScore", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: ReliabilityBadgeDto }),
    __metadata("design:type", ReliabilityBadgeDto)
], BridgeReliabilityResponseDto.prototype, "badge", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-01-15T10:30:00.000Z' }),
    __metadata("design:type", Date)
], BridgeReliabilityResponseDto.prototype, "lastComputedAt", void 0);
// ─── Ranking Integration ──────────────────────────────────────────────────────
class ReliabilityRankingFactorDto {
}
exports.ReliabilityRankingFactorDto = ReliabilityRankingFactorDto;
//# sourceMappingURL=reliability.dto.js.map