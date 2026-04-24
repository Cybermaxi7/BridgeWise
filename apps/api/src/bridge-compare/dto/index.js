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
exports.RouteSelectDto = exports.GetQuotesDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const enums_1 = require("../enums");
class GetQuotesDto {
    constructor() {
        this.rankingMode = enums_1.RankingMode.BALANCED;
    }
}
exports.GetQuotesDto = GetQuotesDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Source blockchain',
        enum: enums_1.SupportedChain,
        example: 'stellar',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], GetQuotesDto.prototype, "sourceChain", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Destination blockchain',
        enum: enums_1.SupportedChain,
        example: 'ethereum',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], GetQuotesDto.prototype, "destinationChain", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Source token symbol', example: 'USDC' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], GetQuotesDto.prototype, "sourceToken", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Destination token symbol (defaults to sourceToken)',
        example: 'USDC',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GetQuotesDto.prototype, "destinationToken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Amount to bridge', example: 100 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    (0, class_validator_1.Min)(0.000001),
    __metadata("design:type", Number)
], GetQuotesDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Ranking mode for route comparison',
        enum: enums_1.RankingMode,
        default: enums_1.RankingMode.BALANCED,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enums_1.RankingMode),
    __metadata("design:type", String)
], GetQuotesDto.prototype, "rankingMode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Max acceptable slippage %',
        example: 0.5,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], GetQuotesDto.prototype, "slippageTolerance", void 0);
class RouteSelectDto {
}
exports.RouteSelectDto = RouteSelectDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Bridge provider ID' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RouteSelectDto.prototype, "bridgeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Source chain' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RouteSelectDto.prototype, "sourceChain", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Destination chain' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RouteSelectDto.prototype, "destinationChain", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Source token' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RouteSelectDto.prototype, "sourceToken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Input amount' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], RouteSelectDto.prototype, "amount", void 0);
//# sourceMappingURL=index.js.map