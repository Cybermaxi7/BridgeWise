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
exports.SpeedMetricsResponseDto = exports.RouteSpeedMetricDto = exports.SpeedMetricsQueryDto = exports.UpdateBenchmarkStatusDto = exports.ConfirmBenchmarkDto = exports.InitiateBenchmarkDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const bridge_benchmark_entity_1 = require("../entities/bridge-benchmark.entity");
class InitiateBenchmarkDto {
}
exports.InitiateBenchmarkDto = InitiateBenchmarkDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Stargate' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], InitiateBenchmarkDto.prototype, "bridgeName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ethereum' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], InitiateBenchmarkDto.prototype, "sourceChain", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'polygon' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], InitiateBenchmarkDto.prototype, "destinationChain", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'USDC' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], InitiateBenchmarkDto.prototype, "token", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: bridge_benchmark_entity_1.ChainType, default: bridge_benchmark_entity_1.ChainType.EVM }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(bridge_benchmark_entity_1.ChainType),
    __metadata("design:type", String)
], InitiateBenchmarkDto.prototype, "sourceChainType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: bridge_benchmark_entity_1.ChainType, default: bridge_benchmark_entity_1.ChainType.EVM }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(bridge_benchmark_entity_1.ChainType),
    __metadata("design:type", String)
], InitiateBenchmarkDto.prototype, "destinationChainType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '1000.00' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], InitiateBenchmarkDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'ISO timestamp when quote was requested',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], InitiateBenchmarkDto.prototype, "quoteRequestedAt", void 0);
class ConfirmBenchmarkDto {
}
exports.ConfirmBenchmarkDto = ConfirmBenchmarkDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Source chain transaction hash' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConfirmBenchmarkDto.prototype, "transactionHash", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Destination chain transaction hash' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConfirmBenchmarkDto.prototype, "destinationTxHash", void 0);
class UpdateBenchmarkStatusDto {
}
exports.UpdateBenchmarkStatusDto = UpdateBenchmarkStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: bridge_benchmark_entity_1.TransactionStatus }),
    (0, class_validator_1.IsEnum)(bridge_benchmark_entity_1.TransactionStatus),
    __metadata("design:type", String)
], UpdateBenchmarkStatusDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBenchmarkStatusDto.prototype, "transactionHash", void 0);
class SpeedMetricsQueryDto {
}
exports.SpeedMetricsQueryDto = SpeedMetricsQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by bridge name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SpeedMetricsQueryDto.prototype, "bridgeName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by source chain' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SpeedMetricsQueryDto.prototype, "sourceChain", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by destination chain' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SpeedMetricsQueryDto.prototype, "destinationChain", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by token' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SpeedMetricsQueryDto.prototype, "token", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Number of recent transactions used for rolling average',
        default: 50,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], SpeedMetricsQueryDto.prototype, "rollingWindow", void 0);
class RouteSpeedMetricDto {
}
exports.RouteSpeedMetricDto = RouteSpeedMetricDto;
class SpeedMetricsResponseDto {
}
exports.SpeedMetricsResponseDto = SpeedMetricsResponseDto;
//# sourceMappingURL=bridge-benchmark.dto.js.map