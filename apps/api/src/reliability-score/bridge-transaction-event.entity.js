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
exports.BridgeTransactionEvent = void 0;
const typeorm_1 = require("typeorm");
const reliability_enum_1 = require("./reliability.enum");
let BridgeTransactionEvent = class BridgeTransactionEvent {
};
exports.BridgeTransactionEvent = BridgeTransactionEvent;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], BridgeTransactionEvent.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], BridgeTransactionEvent.prototype, "bridgeName", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    __metadata("design:type", String)
], BridgeTransactionEvent.prototype, "sourceChain", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    __metadata("design:type", String)
], BridgeTransactionEvent.prototype, "destinationChain", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: reliability_enum_1.TransactionOutcome }),
    __metadata("design:type", String)
], BridgeTransactionEvent.prototype, "outcome", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], BridgeTransactionEvent.prototype, "transactionHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'text' }),
    __metadata("design:type", String)
], BridgeTransactionEvent.prototype, "failureReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0, comment: 'ms to settlement or timeout' }),
    __metadata("design:type", Number)
], BridgeTransactionEvent.prototype, "durationMs", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], BridgeTransactionEvent.prototype, "createdAt", void 0);
exports.BridgeTransactionEvent = BridgeTransactionEvent = __decorate([
    (0, typeorm_1.Entity)('bridge_transaction_events'),
    (0, typeorm_1.Index)(['bridgeName', 'sourceChain', 'destinationChain', 'createdAt'])
], BridgeTransactionEvent);
//# sourceMappingURL=bridge-transaction-event.entity.js.map