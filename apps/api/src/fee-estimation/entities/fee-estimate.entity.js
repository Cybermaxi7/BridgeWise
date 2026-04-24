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
exports.FeeEstimate = void 0;
const typeorm_1 = require("typeorm");
/**
 * FeeEstimate Entity
 *
 * Stores dynamic fee estimates for bridge routes.
 * Includes breakdown of gas fees, bridge fees, and liquidity impact.
 */
let FeeEstimate = class FeeEstimate {
};
exports.FeeEstimate = FeeEstimate;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], FeeEstimate.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bridge_name' }),
    __metadata("design:type", String)
], FeeEstimate.prototype, "bridgeName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'source_chain' }),
    __metadata("design:type", String)
], FeeEstimate.prototype, "sourceChain", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'destination_chain' }),
    __metadata("design:type", String)
], FeeEstimate.prototype, "destinationChain", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'token', nullable: true }),
    __metadata("design:type", String)
], FeeEstimate.prototype, "token", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'amount',
        type: 'decimal',
        precision: 30,
        scale: 10,
        nullable: true,
    }),
    __metadata("design:type", Number)
], FeeEstimate.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_fee', type: 'decimal', precision: 30, scale: 10 }),
    __metadata("design:type", Number)
], FeeEstimate.prototype, "totalFee", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'gas_fee', type: 'decimal', precision: 30, scale: 10 }),
    __metadata("design:type", Number)
], FeeEstimate.prototype, "gasFee", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bridge_fee', type: 'decimal', precision: 30, scale: 10 }),
    __metadata("design:type", Number)
], FeeEstimate.prototype, "bridgeFee", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'liquidity_fee',
        type: 'decimal',
        precision: 30,
        scale: 10,
        default: 0,
    }),
    __metadata("design:type", Number)
], FeeEstimate.prototype, "liquidityFee", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'protocol_fee',
        type: 'decimal',
        precision: 30,
        scale: 10,
        default: 0,
    }),
    __metadata("design:type", Number)
], FeeEstimate.prototype, "protocolFee", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'gas_price_gwei',
        type: 'decimal',
        precision: 20,
        scale: 4,
        nullable: true,
    }),
    __metadata("design:type", Number)
], FeeEstimate.prototype, "gasPriceGwei", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'gas_limit', type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], FeeEstimate.prototype, "gasLimit", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'network_congestion',
        type: 'decimal',
        precision: 5,
        scale: 2,
        nullable: true,
    }),
    __metadata("design:type", Number)
], FeeEstimate.prototype, "networkCongestion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fee_token' }),
    __metadata("design:type", String)
], FeeEstimate.prototype, "feeToken", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'fee_token_price_usd',
        type: 'decimal',
        precision: 20,
        scale: 8,
        nullable: true,
    }),
    __metadata("design:type", Number)
], FeeEstimate.prototype, "feeTokenPriceUsd", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'total_fee_usd',
        type: 'decimal',
        precision: 20,
        scale: 8,
        nullable: true,
    }),
    __metadata("design:type", Number)
], FeeEstimate.prototype, "totalFeeUsd", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_fallback', default: false }),
    __metadata("design:type", Boolean)
], FeeEstimate.prototype, "isFallback", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fallback_reason', nullable: true }),
    __metadata("design:type", String)
], FeeEstimate.prototype, "fallbackReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'estimated_duration_seconds', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], FeeEstimate.prototype, "estimatedDurationSeconds", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'last_updated' }),
    __metadata("design:type", Date)
], FeeEstimate.prototype, "lastUpdated", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expires_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], FeeEstimate.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cache_ttl_seconds', type: 'int', default: 60 }),
    __metadata("design:type", Number)
], FeeEstimate.prototype, "cacheTtlSeconds", void 0);
exports.FeeEstimate = FeeEstimate = __decorate([
    (0, typeorm_1.Entity)('fee_estimates'),
    (0, typeorm_1.Index)(['bridgeName', 'sourceChain', 'destinationChain']),
    (0, typeorm_1.Index)(['sourceChain', 'lastUpdated'])
], FeeEstimate);
//# sourceMappingURL=fee-estimate.entity.js.map