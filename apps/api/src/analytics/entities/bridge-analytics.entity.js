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
exports.BridgeAnalytics = void 0;
const typeorm_1 = require("typeorm");
/**
 * BridgeAnalytics Entity
 *
 * Stores aggregated analytics data for bridge routes including:
 * - Transfer counts (total, successful, failed)
 * - Performance metrics (settlement times, fees)
 * - Slippage statistics
 * - Last updated timestamp for cache invalidation
 */
let BridgeAnalytics = class BridgeAnalytics {
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
exports.BridgeAnalytics = BridgeAnalytics;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], BridgeAnalytics.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bridge_name' }),
    __metadata("design:type", String)
], BridgeAnalytics.prototype, "bridgeName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'source_chain' }),
    __metadata("design:type", String)
], BridgeAnalytics.prototype, "sourceChain", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'destination_chain' }),
    __metadata("design:type", String)
], BridgeAnalytics.prototype, "destinationChain", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'token', nullable: true }),
    __metadata("design:type", String)
], BridgeAnalytics.prototype, "token", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_transfers', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], BridgeAnalytics.prototype, "totalTransfers", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'successful_transfers', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], BridgeAnalytics.prototype, "successfulTransfers", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'failed_transfers', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], BridgeAnalytics.prototype, "failedTransfers", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'average_settlement_time_ms',
        type: 'bigint',
        nullable: true,
    }),
    __metadata("design:type", Number)
], BridgeAnalytics.prototype, "averageSettlementTimeMs", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'average_fee',
        type: 'decimal',
        precision: 30,
        scale: 10,
        nullable: true,
    }),
    __metadata("design:type", Number)
], BridgeAnalytics.prototype, "averageFee", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'average_slippage_percent',
        type: 'decimal',
        precision: 10,
        scale: 4,
        nullable: true,
    }),
    __metadata("design:type", Number)
], BridgeAnalytics.prototype, "averageSlippagePercent", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'total_volume',
        type: 'decimal',
        precision: 30,
        scale: 10,
        default: 0,
    }),
    __metadata("design:type", Number)
], BridgeAnalytics.prototype, "totalVolume", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'min_settlement_time_ms', type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], BridgeAnalytics.prototype, "minSettlementTimeMs", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'max_settlement_time_ms', type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], BridgeAnalytics.prototype, "maxSettlementTimeMs", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'last_updated' }),
    __metadata("design:type", Date)
], BridgeAnalytics.prototype, "lastUpdated", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], BridgeAnalytics.prototype, "createdAt", void 0);
exports.BridgeAnalytics = BridgeAnalytics = __decorate([
    (0, typeorm_1.Entity)('bridge_analytics'),
    (0, typeorm_1.Index)(['bridgeName', 'sourceChain', 'destinationChain']),
    (0, typeorm_1.Index)(['lastUpdated'])
], BridgeAnalytics);
//# sourceMappingURL=bridge-analytics.entity.js.map