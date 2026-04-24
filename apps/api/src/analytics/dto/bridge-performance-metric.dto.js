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
exports.TriggerAggregationDto = exports.BridgePerformanceComparisonResponseDto = exports.BridgePerformanceComparisonDto = exports.HistoricalTrendsDto = exports.BridgePerformanceMetricResponseDto = exports.BridgePerformanceMetricDto = exports.BridgePerformanceMetricQueryDto = exports.TimeIntervalEnum = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
/**
 * Time interval enum for validation
 */
var TimeIntervalEnum;
(function (TimeIntervalEnum) {
    TimeIntervalEnum["HOURLY"] = "hourly";
    TimeIntervalEnum["DAILY"] = "daily";
    TimeIntervalEnum["WEEKLY"] = "weekly";
    TimeIntervalEnum["MONTHLY"] = "monthly";
})(TimeIntervalEnum || (exports.TimeIntervalEnum = TimeIntervalEnum = {}));
/**
 * DTO for querying historical performance metrics
 */
class BridgePerformanceMetricQueryDto {
    constructor() {
        this.timeInterval = TimeIntervalEnum.DAILY;
        this.page = 1;
        this.limit = 50;
    }
}
exports.BridgePerformanceMetricQueryDto = BridgePerformanceMetricQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by bridge name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BridgePerformanceMetricQueryDto.prototype, "bridgeName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by source chain' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BridgePerformanceMetricQueryDto.prototype, "sourceChain", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by destination chain' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BridgePerformanceMetricQueryDto.prototype, "destinationChain", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by token' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BridgePerformanceMetricQueryDto.prototype, "token", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Time interval for aggregation',
        enum: TimeIntervalEnum,
        default: TimeIntervalEnum.DAILY,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(TimeIntervalEnum),
    __metadata("design:type", String)
], BridgePerformanceMetricQueryDto.prototype, "timeInterval", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Start date for time range (ISO 8601)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], BridgePerformanceMetricQueryDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'End date for time range (ISO 8601)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], BridgePerformanceMetricQueryDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Page number for pagination',
        default: 1,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], BridgePerformanceMetricQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Items per page', default: 50 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], BridgePerformanceMetricQueryDto.prototype, "limit", void 0);
/**
 * DTO for a single performance metric data point
 */
class BridgePerformanceMetricDto {
}
exports.BridgePerformanceMetricDto = BridgePerformanceMetricDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Bridge name' }),
    __metadata("design:type", String)
], BridgePerformanceMetricDto.prototype, "bridgeName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Source chain' }),
    __metadata("design:type", String)
], BridgePerformanceMetricDto.prototype, "sourceChain", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Destination chain' }),
    __metadata("design:type", String)
], BridgePerformanceMetricDto.prototype, "destinationChain", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Token symbol' }),
    __metadata("design:type", String)
], BridgePerformanceMetricDto.prototype, "token", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Time interval', enum: TimeIntervalEnum }),
    __metadata("design:type", String)
], BridgePerformanceMetricDto.prototype, "timeInterval", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Timestamp for this metric period' }),
    __metadata("design:type", Date)
], BridgePerformanceMetricDto.prototype, "timestamp", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total transfers in this period' }),
    __metadata("design:type", Number)
], BridgePerformanceMetricDto.prototype, "totalTransfers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Successful transfers' }),
    __metadata("design:type", Number)
], BridgePerformanceMetricDto.prototype, "successfulTransfers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Failed transfers' }),
    __metadata("design:type", Number)
], BridgePerformanceMetricDto.prototype, "failedTransfers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Success rate percentage' }),
    __metadata("design:type", Number)
], BridgePerformanceMetricDto.prototype, "successRate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Failure rate percentage' }),
    __metadata("design:type", Number)
], BridgePerformanceMetricDto.prototype, "failureRate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Average settlement time in milliseconds',
    }),
    __metadata("design:type", Number)
], BridgePerformanceMetricDto.prototype, "averageSettlementTimeMs", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Minimum settlement time' }),
    __metadata("design:type", Number)
], BridgePerformanceMetricDto.prototype, "minSettlementTimeMs", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Maximum settlement time' }),
    __metadata("design:type", Number)
], BridgePerformanceMetricDto.prototype, "maxSettlementTimeMs", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Average fee amount' }),
    __metadata("design:type", Number)
], BridgePerformanceMetricDto.prototype, "averageFee", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Minimum fee' }),
    __metadata("design:type", Number)
], BridgePerformanceMetricDto.prototype, "minFee", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Maximum fee' }),
    __metadata("design:type", Number)
], BridgePerformanceMetricDto.prototype, "maxFee", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Average slippage percentage' }),
    __metadata("design:type", Number)
], BridgePerformanceMetricDto.prototype, "averageSlippagePercent", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Minimum slippage' }),
    __metadata("design:type", Number)
], BridgePerformanceMetricDto.prototype, "minSlippagePercent", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Maximum slippage' }),
    __metadata("design:type", Number)
], BridgePerformanceMetricDto.prototype, "maxSlippagePercent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total volume transferred' }),
    __metadata("design:type", Number)
], BridgePerformanceMetricDto.prototype, "totalVolume", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total fees collected' }),
    __metadata("design:type", Number)
], BridgePerformanceMetricDto.prototype, "totalFees", void 0);
/**
 * DTO for paginated performance metrics response
 */
class BridgePerformanceMetricResponseDto {
}
exports.BridgePerformanceMetricResponseDto = BridgePerformanceMetricResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Performance metrics data',
        type: [BridgePerformanceMetricDto],
    }),
    __metadata("design:type", Array)
], BridgePerformanceMetricResponseDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of records' }),
    __metadata("design:type", Number)
], BridgePerformanceMetricResponseDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Current page number' }),
    __metadata("design:type", Number)
], BridgePerformanceMetricResponseDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Items per page' }),
    __metadata("design:type", Number)
], BridgePerformanceMetricResponseDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of pages' }),
    __metadata("design:type", Number)
], BridgePerformanceMetricResponseDto.prototype, "totalPages", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Time interval used' }),
    __metadata("design:type", String)
], BridgePerformanceMetricResponseDto.prototype, "timeInterval", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Response generation timestamp' }),
    __metadata("design:type", Date)
], BridgePerformanceMetricResponseDto.prototype, "generatedAt", void 0);
/**
 * DTO for historical trends data
 */
class HistoricalTrendsDto {
}
exports.HistoricalTrendsDto = HistoricalTrendsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Bridge name' }),
    __metadata("design:type", String)
], HistoricalTrendsDto.prototype, "bridgeName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Source chain' }),
    __metadata("design:type", String)
], HistoricalTrendsDto.prototype, "sourceChain", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Destination chain' }),
    __metadata("design:type", String)
], HistoricalTrendsDto.prototype, "destinationChain", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Token symbol' }),
    __metadata("design:type", String)
], HistoricalTrendsDto.prototype, "token", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Time interval', enum: TimeIntervalEnum }),
    __metadata("design:type", String)
], HistoricalTrendsDto.prototype, "timeInterval", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Trend data points',
        type: [BridgePerformanceMetricDto],
    }),
    __metadata("design:type", Array)
], HistoricalTrendsDto.prototype, "trends", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Response generation timestamp' }),
    __metadata("design:type", Date)
], HistoricalTrendsDto.prototype, "generatedAt", void 0);
/**
 * DTO for performance comparison between bridges
 */
class BridgePerformanceComparisonDto {
}
exports.BridgePerformanceComparisonDto = BridgePerformanceComparisonDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Bridge name' }),
    __metadata("design:type", String)
], BridgePerformanceComparisonDto.prototype, "bridgeName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Source chain' }),
    __metadata("design:type", String)
], BridgePerformanceComparisonDto.prototype, "sourceChain", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Destination chain' }),
    __metadata("design:type", String)
], BridgePerformanceComparisonDto.prototype, "destinationChain", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Time interval', enum: TimeIntervalEnum }),
    __metadata("design:type", String)
], BridgePerformanceComparisonDto.prototype, "timeInterval", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of data points' }),
    __metadata("design:type", Number)
], BridgePerformanceComparisonDto.prototype, "dataPoints", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Average success rate over period' }),
    __metadata("design:type", Number)
], BridgePerformanceComparisonDto.prototype, "avgSuccessRate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Average settlement time over period' }),
    __metadata("design:type", Number)
], BridgePerformanceComparisonDto.prototype, "avgSettlementTimeMs", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Average fee over period' }),
    __metadata("design:type", Number)
], BridgePerformanceComparisonDto.prototype, "avgFee", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Average slippage over period' }),
    __metadata("design:type", Number)
], BridgePerformanceComparisonDto.prototype, "avgSlippagePercent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total volume over period' }),
    __metadata("design:type", Number)
], BridgePerformanceComparisonDto.prototype, "totalVolume", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total transfers over period' }),
    __metadata("design:type", Number)
], BridgePerformanceComparisonDto.prototype, "totalTransfers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Trend direction (improving/declining/stable)' }),
    __metadata("design:type", String)
], BridgePerformanceComparisonDto.prototype, "trendDirection", void 0);
/**
 * DTO for performance comparison response
 */
class BridgePerformanceComparisonResponseDto {
}
exports.BridgePerformanceComparisonResponseDto = BridgePerformanceComparisonResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Comparison data',
        type: [BridgePerformanceComparisonDto],
    }),
    __metadata("design:type", Array)
], BridgePerformanceComparisonResponseDto.prototype, "comparisons", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Time interval used' }),
    __metadata("design:type", String)
], BridgePerformanceComparisonResponseDto.prototype, "timeInterval", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Start date of comparison period' }),
    __metadata("design:type", Date)
], BridgePerformanceComparisonResponseDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'End date of comparison period' }),
    __metadata("design:type", Date)
], BridgePerformanceComparisonResponseDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Response generation timestamp' }),
    __metadata("design:type", Date)
], BridgePerformanceComparisonResponseDto.prototype, "generatedAt", void 0);
/**
 * DTO for aggregation trigger request
 */
class TriggerAggregationDto {
    constructor() {
        this.timeInterval = TimeIntervalEnum.DAILY;
    }
}
exports.TriggerAggregationDto = TriggerAggregationDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Time interval to aggregate',
        enum: TimeIntervalEnum,
        default: TimeIntervalEnum.DAILY,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(TimeIntervalEnum),
    __metadata("design:type", String)
], TriggerAggregationDto.prototype, "timeInterval", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Date to aggregate (defaults to previous period)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], TriggerAggregationDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Specific bridge to aggregate' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TriggerAggregationDto.prototype, "bridgeName", void 0);
//# sourceMappingURL=bridge-performance-metric.dto.js.map