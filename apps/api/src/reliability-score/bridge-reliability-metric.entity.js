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
exports.BridgeReliabilityMetric = void 0;
const typeorm_1 = require("typeorm");
const reliability_enum_1 = require("./reliability.enum");
let BridgeReliabilityMetric = class BridgeReliabilityMetric {
};
exports.BridgeReliabilityMetric = BridgeReliabilityMetric;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], BridgeReliabilityMetric.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], BridgeReliabilityMetric.prototype, "bridgeName", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    __metadata("design:type", String)
], BridgeReliabilityMetric.prototype, "sourceChain", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    __metadata("design:type", String)
], BridgeReliabilityMetric.prototype, "destinationChain", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], BridgeReliabilityMetric.prototype, "totalAttempts", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], BridgeReliabilityMetric.prototype, "successfulTransfers", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], BridgeReliabilityMetric.prototype, "failedTransfers", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], BridgeReliabilityMetric.prototype, "timeoutCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], BridgeReliabilityMetric.prototype, "reliabilityPercent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], BridgeReliabilityMetric.prototype, "reliabilityScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: reliability_enum_1.ReliabilityTier, default: reliability_enum_1.ReliabilityTier.LOW }),
    __metadata("design:type", String)
], BridgeReliabilityMetric.prototype, "reliabilityTier", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], BridgeReliabilityMetric.prototype, "windowConfig", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], BridgeReliabilityMetric.prototype, "lastComputedAt", void 0);
exports.BridgeReliabilityMetric = BridgeReliabilityMetric = __decorate([
    (0, typeorm_1.Entity)('bridge_reliability_metrics'),
    (0, typeorm_1.Unique)(['bridgeName', 'sourceChain', 'destinationChain'])
], BridgeReliabilityMetric);
//# sourceMappingURL=bridge-reliability-metric.entity.js.map