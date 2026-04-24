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
exports.UserActivityInsightsDto = exports.SlippageStatisticsDto = exports.TopPerformingBridgesDto = exports.BridgeAnalyticsResponseDto = exports.TimeSeriesAnalyticsDto = exports.TimeSeriesDataPointDto = exports.RouteAnalyticsDto = exports.BridgeAnalyticsQueryDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
/**
 * DTO for querying bridge analytics with filters
 */
class BridgeAnalyticsQueryDto {
    constructor() {
        this.page = 1;
        this.limit = 50;
    }
}
exports.BridgeAnalyticsQueryDto = BridgeAnalyticsQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by bridge name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BridgeAnalyticsQueryDto.prototype, "bridgeName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by source chain' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BridgeAnalyticsQueryDto.prototype, "sourceChain", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by destination chain' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BridgeAnalyticsQueryDto.prototype, "destinationChain", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by token' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BridgeAnalyticsQueryDto.prototype, "token", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Start date for time range filter (ISO 8601)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], BridgeAnalyticsQueryDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'End date for time range filter (ISO 8601)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], BridgeAnalyticsQueryDto.prototype, "endDate", void 0);
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
], BridgeAnalyticsQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Items per page', default: 50 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], BridgeAnalyticsQueryDto.prototype, "limit", void 0);
/**
 * DTO for route-specific analytics data
 */
class RouteAnalyticsDto {
}
exports.RouteAnalyticsDto = RouteAnalyticsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Bridge name' }),
    __metadata("design:type", String)
], RouteAnalyticsDto.prototype, "bridgeName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Source chain' }),
    __metadata("design:type", String)
], RouteAnalyticsDto.prototype, "sourceChain", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Destination chain' }),
    __metadata("design:type", String)
], RouteAnalyticsDto.prototype, "destinationChain", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Token symbol' }),
    __metadata("design:type", String)
], RouteAnalyticsDto.prototype, "token", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of transfers' }),
    __metadata("design:type", Number)
], RouteAnalyticsDto.prototype, "totalTransfers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of successful transfers' }),
    __metadata("design:type", Number)
], RouteAnalyticsDto.prototype, "successfulTransfers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of failed transfers' }),
    __metadata("design:type", Number)
], RouteAnalyticsDto.prototype, "failedTransfers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Success rate percentage' }),
    __metadata("design:type", Number)
], RouteAnalyticsDto.prototype, "successRate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Failure rate percentage' }),
    __metadata("design:type", Number)
], RouteAnalyticsDto.prototype, "failureRate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Average settlement time in milliseconds',
    }),
    __metadata("design:type", Number)
], RouteAnalyticsDto.prototype, "averageSettlementTimeMs", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Minimum settlement time in milliseconds',
    }),
    __metadata("design:type", Number)
], RouteAnalyticsDto.prototype, "minSettlementTimeMs", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Maximum settlement time in milliseconds',
    }),
    __metadata("design:type", Number)
], RouteAnalyticsDto.prototype, "maxSettlementTimeMs", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Average fee amount' }),
    __metadata("design:type", Number)
], RouteAnalyticsDto.prototype, "averageFee", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Average slippage percentage' }),
    __metadata("design:type", Number)
], RouteAnalyticsDto.prototype, "averageSlippagePercent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total volume transferred' }),
    __metadata("design:type", Number)
], RouteAnalyticsDto.prototype, "totalVolume", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last updated timestamp' }),
    __metadata("design:type", Date)
], RouteAnalyticsDto.prototype, "lastUpdated", void 0);
/**
 * DTO for time-series analytics data point
 */
class TimeSeriesDataPointDto {
}
exports.TimeSeriesDataPointDto = TimeSeriesDataPointDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Timestamp for the data point' }),
    __metadata("design:type", Date)
], TimeSeriesDataPointDto.prototype, "timestamp", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of transfers in this period' }),
    __metadata("design:type", Number)
], TimeSeriesDataPointDto.prototype, "transfers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of successful transfers' }),
    __metadata("design:type", Number)
], TimeSeriesDataPointDto.prototype, "successfulTransfers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of failed transfers' }),
    __metadata("design:type", Number)
], TimeSeriesDataPointDto.prototype, "failedTransfers", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Average settlement time' }),
    __metadata("design:type", Number)
], TimeSeriesDataPointDto.prototype, "averageSettlementTimeMs", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Average fee' }),
    __metadata("design:type", Number)
], TimeSeriesDataPointDto.prototype, "averageFee", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Average slippage' }),
    __metadata("design:type", Number)
], TimeSeriesDataPointDto.prototype, "averageSlippagePercent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total volume' }),
    __metadata("design:type", Number)
], TimeSeriesDataPointDto.prototype, "totalVolume", void 0);
/**
 * DTO for time-series analytics response
 */
class TimeSeriesAnalyticsDto {
}
exports.TimeSeriesAnalyticsDto = TimeSeriesAnalyticsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Bridge name' }),
    __metadata("design:type", String)
], TimeSeriesAnalyticsDto.prototype, "bridgeName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Source chain' }),
    __metadata("design:type", String)
], TimeSeriesAnalyticsDto.prototype, "sourceChain", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Destination chain' }),
    __metadata("design:type", String)
], TimeSeriesAnalyticsDto.prototype, "destinationChain", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Token symbol' }),
    __metadata("design:type", String)
], TimeSeriesAnalyticsDto.prototype, "token", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Time granularity (hour, day, week, month)' }),
    __metadata("design:type", String)
], TimeSeriesAnalyticsDto.prototype, "granularity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Time series data points',
        type: [TimeSeriesDataPointDto],
    }),
    __metadata("design:type", Array)
], TimeSeriesAnalyticsDto.prototype, "data", void 0);
/**
 * DTO for paginated analytics response
 */
class BridgeAnalyticsResponseDto {
}
exports.BridgeAnalyticsResponseDto = BridgeAnalyticsResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Analytics data', type: [RouteAnalyticsDto] }),
    __metadata("design:type", Array)
], BridgeAnalyticsResponseDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of records' }),
    __metadata("design:type", Number)
], BridgeAnalyticsResponseDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Current page number' }),
    __metadata("design:type", Number)
], BridgeAnalyticsResponseDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Items per page' }),
    __metadata("design:type", Number)
], BridgeAnalyticsResponseDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of pages' }),
    __metadata("design:type", Number)
], BridgeAnalyticsResponseDto.prototype, "totalPages", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Response generation timestamp' }),
    __metadata("design:type", Date)
], BridgeAnalyticsResponseDto.prototype, "generatedAt", void 0);
/**
 * DTO for top performing bridges response
 */
class TopPerformingBridgesDto {
}
exports.TopPerformingBridgesDto = TopPerformingBridgesDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Top bridges by volume',
        type: [RouteAnalyticsDto],
    }),
    __metadata("design:type", Array)
], TopPerformingBridgesDto.prototype, "byVolume", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Top bridges by success rate',
        type: [RouteAnalyticsDto],
    }),
    __metadata("design:type", Array)
], TopPerformingBridgesDto.prototype, "bySuccessRate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Top bridges by speed',
        type: [RouteAnalyticsDto],
    }),
    __metadata("design:type", Array)
], TopPerformingBridgesDto.prototype, "bySpeed", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Response generation timestamp' }),
    __metadata("design:type", Date)
], TopPerformingBridgesDto.prototype, "generatedAt", void 0);
/**
 * DTO for slippage statistics
 */
class SlippageStatisticsDto {
}
exports.SlippageStatisticsDto = SlippageStatisticsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Bridge name' }),
    __metadata("design:type", String)
], SlippageStatisticsDto.prototype, "bridgeName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Source chain' }),
    __metadata("design:type", String)
], SlippageStatisticsDto.prototype, "sourceChain", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Destination chain' }),
    __metadata("design:type", String)
], SlippageStatisticsDto.prototype, "destinationChain", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Average slippage percentage' }),
    __metadata("design:type", Number)
], SlippageStatisticsDto.prototype, "averageSlippagePercent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Minimum slippage percentage' }),
    __metadata("design:type", Number)
], SlippageStatisticsDto.prototype, "minSlippagePercent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Maximum slippage percentage' }),
    __metadata("design:type", Number)
], SlippageStatisticsDto.prototype, "maxSlippagePercent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of high slippage transfers (>1%)' }),
    __metadata("design:type", Number)
], SlippageStatisticsDto.prototype, "highSlippageCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Percentage of transfers with high slippage' }),
    __metadata("design:type", Number)
], SlippageStatisticsDto.prototype, "highSlippagePercentage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Slippage distribution buckets' }),
    __metadata("design:type", Array)
], SlippageStatisticsDto.prototype, "distribution", void 0);
/**
 * DTO for user activity insights
 */
class UserActivityInsightsDto {
}
exports.UserActivityInsightsDto = UserActivityInsightsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total unique users (anonymized)' }),
    __metadata("design:type", Number)
], UserActivityInsightsDto.prototype, "totalUniqueUsers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total transfers' }),
    __metadata("design:type", Number)
], UserActivityInsightsDto.prototype, "totalTransfers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Average transfers per user' }),
    __metadata("design:type", Number)
], UserActivityInsightsDto.prototype, "averageTransfersPerUser", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Most active time period' }),
    __metadata("design:type", Object)
], UserActivityInsightsDto.prototype, "peakActivityPeriod", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Most popular routes',
        type: [RouteAnalyticsDto],
    }),
    __metadata("design:type", Array)
], UserActivityInsightsDto.prototype, "popularRoutes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Response generation timestamp' }),
    __metadata("design:type", Date)
], UserActivityInsightsDto.prototype, "generatedAt", void 0);
//# sourceMappingURL=bridge-analytics.dto.js.map