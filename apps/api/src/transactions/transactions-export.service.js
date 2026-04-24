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
exports.TransactionsExportService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const transaction_entity_1 = require("./entities/transaction.entity");
let TransactionsExportService = class TransactionsExportService {
    constructor(transactionRepo) {
        this.transactionRepo = transactionRepo;
    }
    /**
     * Get transactions with filters for export
     */
    async getTransactionsForExport(filters) {
        const where = {};
        // Apply filters
        if (filters.account) {
            where.metadata = { account: filters.account };
        }
        if (filters.sourceChain) {
            where.metadata = {
                ...where.metadata,
                sourceChain: filters.sourceChain,
            };
        }
        if (filters.destinationChain) {
            where.metadata = {
                ...where.metadata,
                destinationChain: filters.destinationChain,
            };
        }
        if (filters.bridgeName) {
            where.metadata = {
                ...where.metadata,
                bridgeName: filters.bridgeName,
            };
        }
        if (filters.status) {
            where.status = filters.status;
        }
        if (filters.startDate && filters.endDate) {
            where.createdAt = (0, typeorm_2.Between)(new Date(filters.startDate), new Date(filters.endDate));
        }
        const transactions = await this.transactionRepo.find({
            where,
            order: { createdAt: 'DESC' },
        });
        return transactions.map((tx) => this.mapToExportData(tx));
    }
    /**
     * Convert transactions to CSV format
     */
    convertToCSV(data) {
        if (!data || data.length === 0) {
            return '';
        }
        const headers = [
            'ID',
            'Type',
            'Status',
            'Source Chain',
            'Destination Chain',
            'Bridge Name',
            'Amount',
            'Fee',
            'TX Hash',
            'Created At',
            'Completed At',
        ];
        const rows = data.map((item) => [
            this.escapeCsvValue(item.id),
            this.escapeCsvValue(item.type),
            this.escapeCsvValue(item.status),
            this.escapeCsvValue(item.sourceChain || ''),
            this.escapeCsvValue(item.destinationChain || ''),
            this.escapeCsvValue(item.bridgeName || ''),
            this.escapeCsvValue(item.amount?.toString() || ''),
            this.escapeCsvValue(item.fee?.toString() || ''),
            this.escapeCsvValue(item.txHash || ''),
            this.escapeCsvValue(this.formatDate(item.createdAt)),
            this.escapeCsvValue(item.completedAt ? this.formatDate(item.completedAt) : ''),
        ].join(','));
        return [headers.join(','), ...rows].join('\n');
    }
    /**
     * Convert transactions to JSON format
     */
    convertToJSON(data) {
        return JSON.stringify(data, null, 2);
    }
    /**
     * Map database transaction to export data format
     */
    mapToExportData(tx) {
        const metadata = tx.metadata || {};
        return {
            id: tx.id,
            type: tx.type,
            status: tx.status,
            sourceChain: metadata.sourceChain,
            destinationChain: metadata.destinationChain,
            bridgeName: metadata.bridgeName,
            amount: metadata.amount ? parseFloat(metadata.amount) : undefined,
            fee: metadata.fee ? parseFloat(metadata.fee) : undefined,
            txHash: metadata.txHash,
            createdAt: tx.createdAt,
            completedAt: tx.completedAt,
        };
    }
    /**
     * Escape special characters for CSV
     */
    escapeCsvValue(value) {
        if (value === undefined || value === null) {
            return '';
        }
        const stringValue = value.toString();
        // If contains comma, quote, or newline, wrap in quotes and escape quotes
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
    }
    /**
     * Format date for export
     */
    formatDate(date) {
        return date.toISOString();
    }
};
exports.TransactionsExportService = TransactionsExportService;
exports.TransactionsExportService = TransactionsExportService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TransactionsExportService);
//# sourceMappingURL=transactions-export.service.js.map