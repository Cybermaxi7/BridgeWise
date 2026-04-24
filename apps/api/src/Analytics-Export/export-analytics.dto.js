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
exports.ExportAnalyticsDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const analytics_metric_enum_1 = require("../enums/analytics-metric.enum");
let DateRangeConstraint = class DateRangeConstraint {
    validate(_value, args) {
        const { startDate, endDate } = args.object;
        if (!startDate || !endDate)
            return true;
        return new Date(startDate) < new Date(endDate);
    }
    defaultMessage() {
        return 'startDate must be before endDate';
    }
};
DateRangeConstraint = __decorate([
    (0, class_validator_1.ValidatorConstraint)({ name: 'DateRangeValid', async: false })
], DateRangeConstraint);
let MaxRangeConstraint = class MaxRangeConstraint {
    constructor() {
        this.MAX_DAYS = 365;
    }
    validate(_value, args) {
        const { startDate, endDate } = args.object;
        if (!startDate || !endDate)
            return true;
        const diffMs = new Date(endDate).getTime() - new Date(startDate).getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        return diffDays <= this.MAX_DAYS;
    }
    defaultMessage() {
        return 'Date range cannot exceed 365 days';
    }
};
MaxRangeConstraint = __decorate([
    (0, class_validator_1.ValidatorConstraint)({ name: 'MaxRangeValid', async: false })
], MaxRangeConstraint);
class ExportAnalyticsDto {
    constructor() {
        this.includeMetadata = true;
        this.delimiter = ',';
        this.dateFormat = 'iso';
        this.timezone = 'UTC';
        this.async = false;
    }
}
exports.ExportAnalyticsDto = ExportAnalyticsDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.IsEnum)(analytics_metric_enum_1.AnalyticsMetric, { each: true }),
    (0, class_transformer_1.Transform)(({ value }) => Array.isArray(value) ? value : [value]),
    __metadata("design:type", Array)
], ExportAnalyticsDto.prototype, "metrics", void 0);
__decorate([
    (0, class_validator_1.IsISO8601)(),
    (0, class_validator_1.Validate)(DateRangeConstraint),
    (0, class_validator_1.Validate)(MaxRangeConstraint),
    __metadata("design:type", String)
], ExportAnalyticsDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsISO8601)(),
    __metadata("design:type", String)
], ExportAnalyticsDto.prototype, "endDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ExportAnalyticsDto.prototype, "networkId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ExportAnalyticsDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    __metadata("design:type", Boolean)
], ExportAnalyticsDto.prototype, "includeMetadata", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)([',', ';', '\t']),
    __metadata("design:type", String)
], ExportAnalyticsDto.prototype, "delimiter", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['iso', 'unix', 'locale']),
    __metadata("design:type", String)
], ExportAnalyticsDto.prototype, "dateFormat", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ExportAnalyticsDto.prototype, "timezone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(1_000_000),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], ExportAnalyticsDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    __metadata("design:type", Boolean)
], ExportAnalyticsDto.prototype, "async", void 0);
//# sourceMappingURL=export-analytics.dto.js.map