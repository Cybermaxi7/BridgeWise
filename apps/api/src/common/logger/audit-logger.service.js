"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLoggerService = exports.AuditEventType = void 0;
const common_1 = require("@nestjs/common");
var AuditEventType;
(function (AuditEventType) {
    AuditEventType["ROUTE_SELECTION"] = "ROUTE_SELECTION";
    AuditEventType["ROUTE_EXECUTION"] = "ROUTE_EXECUTION";
    AuditEventType["TRANSACTION_CREATED"] = "TRANSACTION_CREATED";
    AuditEventType["TRANSACTION_UPDATED"] = "TRANSACTION_UPDATED";
    AuditEventType["FEE_ESTIMATION"] = "FEE_ESTIMATION";
    AuditEventType["BRIDGE_TRANSFER"] = "BRIDGE_TRANSFER";
})(AuditEventType || (exports.AuditEventType = AuditEventType = {}));
let AuditLoggerService = class AuditLoggerService {
    constructor() {
        this.logger = new common_1.Logger('AuditLogger');
    }
    logRouteSelection(data) {
        const entry = {
            eventType: AuditEventType.ROUTE_SELECTION,
            timestamp: new Date().toISOString(),
            requestId: data.requestId,
            metadata: {
                sourceChain: data.sourceChain,
                destinationChain: data.destinationChain,
                amount: this.sanitizeAmount(data.amount),
                selectedAdapter: data.selectedAdapter,
                routeScore: data.routeScore,
                alternativeCount: data.alternativeCount,
            },
        };
        this.logger.log(JSON.stringify(entry));
    }
    logRouteExecution(data) {
        const entry = {
            eventType: AuditEventType.ROUTE_EXECUTION,
            timestamp: new Date().toISOString(),
            requestId: data.requestId,
            metadata: {
                transactionId: data.transactionId,
                adapter: data.adapter,
                sourceChain: data.sourceChain,
                destinationChain: data.destinationChain,
                status: data.status,
                executionTimeMs: data.executionTimeMs,
            },
        };
        this.logger.log(JSON.stringify(entry));
    }
    logTransactionCreated(data) {
        const entry = {
            eventType: AuditEventType.TRANSACTION_CREATED,
            timestamp: new Date().toISOString(),
            requestId: data.requestId,
            metadata: {
                transactionId: data.transactionId,
                type: data.type,
                totalSteps: data.totalSteps,
            },
        };
        this.logger.log(JSON.stringify(entry));
    }
    logTransactionUpdated(data) {
        const entry = {
            eventType: AuditEventType.TRANSACTION_UPDATED,
            timestamp: new Date().toISOString(),
            requestId: data.requestId,
            metadata: {
                transactionId: data.transactionId,
                previousStatus: data.previousStatus,
                newStatus: data.newStatus,
                currentStep: data.currentStep,
            },
        };
        this.logger.log(JSON.stringify(entry));
    }
    logFeeEstimation(data) {
        const entry = {
            eventType: AuditEventType.FEE_ESTIMATION,
            timestamp: new Date().toISOString(),
            requestId: data.requestId,
            metadata: {
                adapter: data.adapter,
                sourceChain: data.sourceChain,
                destinationChain: data.destinationChain,
                estimatedFee: this.sanitizeAmount(data.estimatedFee),
                responseTimeMs: data.responseTimeMs,
            },
        };
        this.logger.log(JSON.stringify(entry));
    }
    logBridgeTransfer(data) {
        const entry = {
            eventType: AuditEventType.BRIDGE_TRANSFER,
            timestamp: new Date().toISOString(),
            requestId: data.requestId,
            metadata: {
                transactionId: data.transactionId,
                adapter: data.adapter,
                txHash: data.txHash ? this.sanitizeTxHash(data.txHash) : undefined,
                status: data.status,
                errorCode: data.errorCode,
            },
        };
        this.logger.log(JSON.stringify(entry));
    }
    sanitizeAmount(amount) {
        // Only log first 4 and last 4 characters for large amounts
        if (amount.length > 12) {
            return `${amount.slice(0, 4)}...${amount.slice(-4)}`;
        }
        return amount;
    }
    sanitizeTxHash(hash) {
        // Only log first 8 and last 8 characters of transaction hash
        if (hash.length > 20) {
            return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
        }
        return hash;
    }
};
exports.AuditLoggerService = AuditLoggerService;
exports.AuditLoggerService = AuditLoggerService = __decorate([
    (0, common_1.Injectable)()
], AuditLoggerService);
//# sourceMappingURL=audit-logger.service.js.map