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
exports.NormalizedQuoteDto = exports.CompareQuotesResponseDto = exports.GetQuotesDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class GetQuotesDto {
    constructor() {
        this.rankBy = 'score';
    }
}
exports.GetQuotesDto = GetQuotesDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: 'Source chain ID' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], GetQuotesDto.prototype, "fromChain", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 137, description: 'Destination chain ID' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], GetQuotesDto.prototype, "toChain", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'USDC', description: 'Token symbol to bridge' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_transformer_1.Transform)(({ value }) => value?.toUpperCase()),
    __metadata("design:type", String)
], GetQuotesDto.prototype, "token", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '1000',
        description: 'Amount to bridge (in token units)',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], GetQuotesDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'cost',
        enum: ['cost', 'speed', 'score'],
        description: 'Ranking strategy for results',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['cost', 'speed', 'score']),
    __metadata("design:type", String)
], GetQuotesDto.prototype, "rankBy", void 0);
class CompareQuotesResponseDto {
}
exports.CompareQuotesResponseDto = CompareQuotesResponseDto;
class NormalizedQuoteDto {
}
exports.NormalizedQuoteDto = NormalizedQuoteDto;
//# sourceMappingURL=get-quotes.dto.js.map