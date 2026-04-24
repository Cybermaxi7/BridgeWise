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
exports.TransactionRetryService = void 0;
const common_1 = require("@nestjs/common");
const transactions_service_1 = require("../transactions.service");
const transaction_entity_1 = require("../entities/transaction.entity");
let TransactionRetryService = class TransactionRetryService {
    constructor(transactionService) {
        this.transactionService = transactionService;
        this.retryLogs = [];
        this.retryPolicy = {
            maxRetries: 3,
            backoffMs: 1000,
            backoffStrategy: 'exponential',
        };
        this.retryStateListeners = new Map();
    }
    setPolicy(policy) {
        this.retryPolicy = { ...this.retryPolicy, ...policy };
    }
    onRetryStateChange(transactionId, callback) {
        this.retryStateListeners.set(transactionId, callback);
    }
    offRetryStateChange(transactionId) {
        this.retryStateListeners.delete(transactionId);
    }
    notifyRetryStateChange(state) {
        const callback = this.retryStateListeners.get(state.transactionId);
        if (callback) {
            callback(state);
        }
    }
    async retryTransaction(transaction) {
        if (!this.isSafeToRetry(transaction))
            return null;
        // Get current retry count or initialize to 0
        const currentRetryCount = transaction.retryCount || 0;
        const maxRetries = this.retryPolicy.maxRetries;
        let attempt = currentRetryCount;
        let lastError = '';
        // Notify UI of retry start
        this.notifyRetryStateChange({
            transactionId: transaction.id,
            isRetrying: true,
            currentAttempt: attempt + 1,
            maxAttempts: maxRetries,
        });
        while (attempt < maxRetries) {
            try {
                // Calculate backoff time
                let backoffTime = 0;
                if (attempt > 0) {
                    backoffTime = this.calculateBackoff(attempt);
                    // Notify UI of countdown
                    this.notifyRetryStateChange({
                        transactionId: transaction.id,
                        isRetrying: true,
                        currentAttempt: attempt + 1,
                        maxAttempts: maxRetries,
                        nextRetryIn: backoffTime,
                    });
                    await this.sleep(backoffTime);
                }
                // Update transaction status to IN_PROGRESS
                const updated = await this.transactionService.update(transaction.id, {
                    status: transaction_entity_1.TransactionStatus.IN_PROGRESS,
                    retryCount: attempt + 1,
                    maxRetries: maxRetries,
                });
                // Notify UI of retry attempt
                this.notifyRetryStateChange({
                    transactionId: transaction.id,
                    isRetrying: true,
                    currentAttempt: attempt + 1,
                    maxAttempts: maxRetries,
                });
                // Simulate execution (replace with actual execution logic)
                // If successful:
                this.notifyRetryStateChange({
                    transactionId: transaction.id,
                    isRetrying: false,
                    currentAttempt: attempt + 1,
                    maxAttempts: maxRetries,
                });
                return updated;
            }
            catch (err) {
                lastError = err.message || String(err);
                this.logRetryAttempt(transaction.id, attempt + 1, lastError);
                attempt++;
                if (attempt < maxRetries) {
                    // Notify UI of failed attempt
                    this.notifyRetryStateChange({
                        transactionId: transaction.id,
                        isRetrying: true,
                        currentAttempt: attempt,
                        maxAttempts: maxRetries,
                        error: lastError,
                    });
                }
            }
        }
        // Mark as failed after max retries
        await this.transactionService.markFailed(transaction.id, lastError);
        // Notify UI of final failure
        this.notifyRetryStateChange({
            transactionId: transaction.id,
            isRetrying: false,
            currentAttempt: attempt,
            maxAttempts: maxRetries,
            error: `Max retries (${maxRetries}) exceeded: ${lastError}`,
        });
        this.offRetryStateChange(transaction.id);
        return null;
    }
    isSafeToRetry(transaction) {
        // Only retry if status is FAILED and not completed
        return (transaction.status === transaction_entity_1.TransactionStatus.FAILED &&
            !transaction.completedAt);
    }
    calculateBackoff(attempt) {
        let ms = this.retryPolicy.backoffMs;
        if (this.retryPolicy.backoffStrategy === 'exponential') {
            ms = ms * Math.pow(2, attempt - 1);
        }
        // Cap backoff at 30 seconds
        return Math.min(ms, 30000);
    }
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    logRetryAttempt(transactionId, attempt, error) {
        this.retryLogs.push({
            transactionId,
            attempt,
            error,
            timestamp: new Date(),
        });
        // TODO: Integrate with analytics collector
    }
    getRetryLogs(transactionId) {
        if (!transactionId)
            return this.retryLogs;
        return this.retryLogs.filter((log) => log.transactionId === transactionId);
    }
    getRetryState(transaction) {
        return {
            retryCount: transaction.retryCount || 0,
            maxRetries: transaction.maxRetries || this.retryPolicy.maxRetries,
            attempts: transaction.retryAttempts || [],
            error: transaction.error,
        };
    }
};
exports.TransactionRetryService = TransactionRetryService;
exports.TransactionRetryService = TransactionRetryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [transactions_service_1.TransactionsService])
], TransactionRetryService);
//# sourceMappingURL=transaction-retry.service.js.map