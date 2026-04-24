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
exports.BridgePerformanceMetric = void 0;
const typeorm_1 = require("typeorm");
/**
 * BridgePerformanceMetric Entity
 *
 * Stores historical performance metrics for bridge routes over time.
 * Supports multiple time intervals for flexible analysis.
 */
let BridgePerformanceMetric = class BridgePerformanceMetric {
    /**
     * Computed success rate percentage
     */
    get successRate() {
        if (this.totalTransfers === 0)
            return 0;
        return (this.successfulTransfers / this.totalTransfers) * 100;
    }
    /**
     * Computed failure rate percentage
     */
    get failureRate() {
        if (this.totalTransfers === 0)
            return 0;
        return (this.failedTransfers / this.totalTransfers) * 100;
    }
};
exports.BridgePerformanceMetric = BridgePerformanceMetric;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], BridgePerformanceMetric.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bridge_name' }),
    __metadata("design:type", String)
], BridgePerformanceMetric.prototype, "bridgeName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'source_chain' }),
    __metadata("design:type", String)
], BridgePerformanceMetric.prototype, "sourceChain", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'destination_chain' }),
    __metadata("design:type", String)
], BridgePerformanceMetric.prototype, "destinationChain", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'token', nullable: true }),
    __metadata("design:type", String)
], BridgePerformanceMetric.prototype, "token", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'time_interval',
        type: 'enum',
        enum: ['hourly', 'daily', 'weekly', 'monthly'],
    }),
    __metadata("design:type", String)
], BridgePerformanceMetric.prototype, "timeInterval", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_transfers', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], BridgePerformanceMetric.prototype, "totalTransfers", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'successful_transfers', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], BridgePerformanceMetric.prototype, "successfulTransfers", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'failed_transfers', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], BridgePerformanceMetric.prototype, "failedTransfers", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'average_settlement_time_ms',
        type: 'bigint',
        nullable: true,
    }),
    __metadata("design:type", Number)
], BridgePerformanceMetric.prototype, "averageSettlementTimeMs", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'min_settlement_time_ms', type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], BridgePerformanceMetric.prototype, "minSettlementTimeMs", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'max_settlement_time_ms', type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], BridgePerformanceMetric.prototype, "maxSettlementTimeMs", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'average_fee',
        type: 'decimal',
        precision: 30,
        scale: 10,
        nullable: true,
    }),
    __metadata("design:type", Number)
], BridgePerformanceMetric.prototype, "averageFee", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'min_fee',
        type: 'decimal',
        precision: 30,
        scale: 10,
        nullable: true,
    }),
    __metadata("design:type", Number)
], BridgePerformanceMetric.prototype, "minFee", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'max_fee',
        type: 'decimal',
        precision: 30,
        scale: 10,
        nullable: true,
    }),
    __metadata("design:type", Number)
], BridgePerformanceMetric.prototype, "maxFee", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'average_slippage_percent',
        type: 'decimal',
        precision: 10,
        scale: 4,
        nullable: true,
    }),
    __metadata("design:type", Number)
], BridgePerformanceMetric.prototype, "averageSlippagePercent", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'min_slippage_percent',
        type: 'decimal',
        precision: 10,
        scale: 4,
        nullable: true,
    }),
    __metadata("design:type", Number)
], BridgePerformanceMetric.prototype, "minSlippagePercent", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'max_slippage_percent',
        type: 'decimal',
        precision: 10,
        scale: 4,
        nullable: true,
    }),
    __metadata("design:type", Number)
], BridgePerformanceMetric.prototype, "maxSlippagePercent", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'total_volume',
        type: 'decimal',
        precision: 30,
        scale: 10,
        default: 0,
    }),
    __metadata("design:type", Number)
], BridgePerformanceMetric.prototype, "totalVolume", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'total_fees',
        type: 'decimal',
        precision: 30,
        scale: 10,
        default: 0,
    }),
    __metadata("design:type", Number)
], BridgePerformanceMetric.prototype, "totalFees", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], BridgePerformanceMetric.prototype, "timestamp", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], BridgePerformanceMetric.prototype, "createdAt", void 0);
exports.BridgePerformanceMetric = BridgePerformanceMetric = __decorate([
    (0, typeorm_1.Entity)('bridge_performance_metrics'),
    (0, typeorm_1.Index)([
        'bridgeName',
        'sourceChain',
        'destinationChain',
        'timeInterval',
        'timestamp',
    ]),
    (0, typeorm_1.Index)(['timeInterval', 'timestamp'])
], BridgePerformanceMetric);
//# sourceMappingURL=bridge-performance-metric.entity.js.map