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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const transaction_entity_1 = require("./entities/transaction.entity");
const audit_logger_service_1 = require("../common/logger/audit-logger.service");
let TransactionsService = class TransactionsService {
    constructor(transactionRepo, eventEmitter, auditLogger) {
        this.transactionRepo = transactionRepo;
        this.eventEmitter = eventEmitter;
        this.auditLogger = auditLogger;
    }
    async create(dto) {
        const transaction = this.transactionRepo.create({
            type: dto.type,
            metadata: dto.metadata || {},
            state: {},
            totalSteps: dto.totalSteps || 0,
            status: transaction_entity_1.TransactionStatus.PENDING,
        });
        const saved = await this.transactionRepo.save(transaction);
        this.auditLogger.logTransactionCreated({
            transactionId: saved.id,
            type: saved.type,
            totalSteps: saved.totalSteps,
        });
        this.emitStateChange(saved);
        return saved;
    }
    async findById(id) {
        const transaction = await this.transactionRepo.findOne({ where: { id } });
        if (!transaction) {
            throw new common_1.NotFoundException(`Transaction ${id} not found`);
        }
        return transaction;
    }
    async update(id, dto) {
        const transaction = await this.findById(id);
        const previousStatus = transaction.status;
        if (dto.status)
            transaction.status = dto.status;
        if (dto.state)
            transaction.state = { ...transaction.state, ...dto.state };
        if (dto.currentStep !== undefined)
            transaction.currentStep = dto.currentStep;
        if (dto.error)
            transaction.error = dto.error;
        if (dto.status === transaction_entity_1.TransactionStatus.COMPLETED) {
            transaction.completedAt = new Date();
        }
        const updated = await this.transactionRepo.save(transaction);
        if (dto.status && previousStatus !== dto.status) {
            this.auditLogger.logTransactionUpdated({
                transactionId: updated.id,
                previousStatus,
                newStatus: updated.status,
                currentStep: updated.currentStep,
            });
        }
        this.emitStateChange(updated);
        return updated;
    }
    async updateState(id, stateUpdate) {
        return this.update(id, { state: stateUpdate });
    }
    async advanceStep(id, stepData) {
        const transaction = await this.findById(id);
        const nextStep = transaction.currentStep + 1;
        const updates = {
            currentStep: nextStep,
            status: transaction_entity_1.TransactionStatus.IN_PROGRESS,
        };
        if (stepData) {
            updates.state = stepData;
        }
        // Check if completed
        if (nextStep >= transaction.totalSteps && transaction.totalSteps > 0) {
            updates.status = transaction_entity_1.TransactionStatus.COMPLETED;
        }
        return this.update(id, updates);
    }
    async markFailed(id, error) {
        return this.update(id, {
            status: transaction_entity_1.TransactionStatus.FAILED,
            error,
        });
    }
    async markPartial(id, error) {
        return this.update(id, {
            status: transaction_entity_1.TransactionStatus.PARTIAL,
            error,
        });
    }
    async getRecentTransactions(limit = 10) {
        return this.transactionRepo.find({
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }
    emitStateChange(transaction) {
        this.eventEmitter.emit('transaction.updated', transaction);
    }
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        event_emitter_1.EventEmitter2,
        audit_logger_service_1.AuditLoggerService])
], TransactionsService);
//# sourceMappingURL=transactions.service.js.map