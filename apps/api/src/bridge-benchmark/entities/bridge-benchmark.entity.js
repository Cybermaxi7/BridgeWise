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
exports.BridgeBenchmark = exports.ChainType = exports.TransactionStatus = void 0;
const typeorm_1 = require("typeorm");
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["PENDING"] = "pending";
    TransactionStatus["SUBMITTED"] = "submitted";
    TransactionStatus["CONFIRMED"] = "confirmed";
    TransactionStatus["FAILED"] = "failed";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
var ChainType;
(function (ChainType) {
    ChainType["EVM"] = "evm";
    ChainType["STELLAR"] = "stellar";
})(ChainType || (exports.ChainType = ChainType = {}));
let BridgeBenchmark = class BridgeBenchmark {
};
exports.BridgeBenchmark = BridgeBenchmark;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], BridgeBenchmark.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bridge_name' }),
    __metadata("design:type", String)
], BridgeBenchmark.prototype, "bridgeName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'source_chain' }),
    __metadata("design:type", String)
], BridgeBenchmark.prototype, "sourceChain", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'destination_chain' }),
    __metadata("design:type", String)
], BridgeBenchmark.prototype, "destinationChain", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], BridgeBenchmark.prototype, "token", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'source_chain_type',
        type: 'enum',
        enum: ChainType,
        default: ChainType.EVM,
    }),
    __metadata("design:type", String)
], BridgeBenchmark.prototype, "sourceChainType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'destination_chain_type',
        type: 'enum',
        enum: ChainType,
        default: ChainType.EVM,
    }),
    __metadata("design:type", String)
], BridgeBenchmark.prototype, "destinationChainType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: TransactionStatus,
        default: TransactionStatus.PENDING,
    }),
    __metadata("design:type", String)
], BridgeBenchmark.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'transaction_hash', nullable: true }),
    __metadata("design:type", String)
], BridgeBenchmark.prototype, "transactionHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'destination_tx_hash', nullable: true }),
    __metadata("design:type", String)
], BridgeBenchmark.prototype, "destinationTxHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'quote_requested_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], BridgeBenchmark.prototype, "quoteRequestedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'start_time', type: 'timestamptz' }),
    __metadata("design:type", Date)
], BridgeBenchmark.prototype, "startTime", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'destination_confirmed_at',
        type: 'timestamptz',
        nullable: true,
    }),
    __metadata("design:type", Date)
], BridgeBenchmark.prototype, "destinationConfirmedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'completion_time', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], BridgeBenchmark.prototype, "completionTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'duration_ms', type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], BridgeBenchmark.prototype, "durationMs", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'amount',
        type: 'decimal',
        precision: 30,
        scale: 10,
        nullable: true,
    }),
    __metadata("design:type", Number)
], BridgeBenchmark.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], BridgeBenchmark.prototype, "createdAt", void 0);
exports.BridgeBenchmark = BridgeBenchmark = __decorate([
    (0, typeorm_1.Entity)('bridge_benchmarks'),
    (0, typeorm_1.Index)(['bridgeName', 'sourceChain', 'destinationChain'])
], BridgeBenchmark);
//# sourceMappingURL=bridge-benchmark.entity.js.map