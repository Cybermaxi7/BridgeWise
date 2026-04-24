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
exports.TransactionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const rxjs_1 = require("rxjs");
const event_emitter_1 = require("@nestjs/event-emitter");
const create_transaction_dto_1 = require("./dto/create-transaction.dto");
const update_transaction_dto_1 = require("./dto/update-transaction.dto");
const export_transactions_dto_1 = require("./dto/export-transactions.dto");
const transactions_service_1 = require("./transactions.service");
const transactions_export_service_1 = require("./transactions-export.service");
let TransactionsController = class TransactionsController {
    constructor(transactionService, exportService, eventEmitter) {
        this.transactionService = transactionService;
        this.exportService = exportService;
        this.eventEmitter = eventEmitter;
    }
    async create(dto) {
        return this.transactionService.create(dto);
    }
    async getTransaction(id) {
        return this.transactionService.findById(id);
    }
    async update(id, dto) {
        return this.transactionService.update(id, dto);
    }
    async advanceStep(id, stepData) {
        return this.transactionService.advanceStep(id, stepData);
    }
    streamTransactionEvents(id) {
        return new rxjs_1.Observable((observer) => {
            const handler = (transaction) => {
                if (transaction.id === id) {
                    observer.next({ data: transaction });
                }
            };
            this.eventEmitter.on('transaction.updated', handler);
            // Send initial state
            this.transactionService.findById(id).then((transaction) => {
                observer.next({ data: transaction });
            });
            return () => {
                this.eventEmitter.off('transaction.updated', handler);
            };
        });
    }
    async pollTransaction(id) {
        return this.transactionService.findById(id);
    }
    async exportTransactions(format, filters, res) {
        const data = await this.exportService.getTransactionsForExport(filters);
        if (format === export_transactions_dto_1.ExportFormat.CSV) {
            const csvContent = this.exportService.convertToCSV(data);
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="transactions_${new Date().toISOString().split('T')[0]}.csv"`);
            return res.send(csvContent);
        }
        else {
            const jsonContent = this.exportService.convertToJSON(data);
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="transactions_${new Date().toISOString().split('T')[0]}.json"`);
            return res.send(jsonContent);
        }
    }
};
exports.TransactionsController = TransactionsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new transaction',
        description: 'Initiates a new cross-chain transaction with the specified type and configuration. Supports multiple transaction types across different blockchain networks.',
    }),
    (0, swagger_1.ApiBody)({
        type: create_transaction_dto_1.CreateTransactionDto,
        description: 'Transaction creation payload',
        examples: {
            stellar: {
                summary: 'Create Stellar transaction',
                value: {
                    type: 'stellar-payment',
                    metadata: {
                        sourceAccount: 'GCXMWUAUF37IWOABB3GNXFZB7TBBBHL3IJKUSJUWVEKM3CXEGTHUMDSD',
                        destinationAccount: 'GBRPYHIL2CI3WHZSRJQEMQ5CPQIS2TCCQ7OXJGGUFR7XUWVEPSWR47U',
                        amount: '100',
                        asset: 'native',
                        memo: 'Cross-chain transfer',
                    },
                    totalSteps: 3,
                },
            },
            hop: {
                summary: 'Create Hop Protocol transaction',
                value: {
                    type: 'hop-bridge',
                    metadata: {
                        token: 'USDC',
                        amount: '500',
                        sourceChain: 'ethereum',
                        destinationChain: 'polygon',
                        recipient: '0x742d35Cc6634C0532925a3b844Bc328e8f94D5dC',
                        deadline: 1000000000,
                        amountOutMin: '490',
                    },
                    totalSteps: 4,
                },
            },
            layerzero: {
                summary: 'Create LayerZero transaction',
                value: {
                    type: 'layerzero-omnichain',
                    metadata: {
                        token: 'USDT',
                        amount: '1000',
                        sourceChainId: 101,
                        destinationChainId: 102,
                        recipient: '0x9e4c14403d7d2a8f5bD10b2c7c1e0d0e0d0e0d0e',
                    },
                    totalSteps: 3,
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Transaction created successfully',
        example: {
            id: 'txn_550e8400e29b41d4a716446655440000',
            type: 'stellar-payment',
            status: 'pending',
            currentStep: 0,
            totalSteps: 3,
            metadata: {
                sourceAccount: 'GCXMWUAUF37IWOABB3GNXFZB7TBBBHL3IJKUSJUWVEKM3CXEGTHUMDSD',
                destinationAccount: 'GBRPYHIL2CI3WHZSRJQEMQ5CPQIS2TCCQ7OXJGGUFR7XUWVEPSWR47U',
            },
            createdAt: '2026-01-29T10:00:00.000Z',
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid input - validation error on required fields',
        example: {
            success: false,
            error: 'Validation error',
            details: [
                {
                    field: 'type',
                    message: 'type must be a string',
                },
            ],
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_transaction_dto_1.CreateTransactionDto]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get transaction details',
        description: 'Retrieves the current state and details of a transaction by ID, including its current step, status, and metadata.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        type: 'string',
        description: 'Unique transaction identifier',
        example: 'txn_550e8400e29b41d4a716446655440000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Transaction details retrieved successfully',
        example: {
            id: 'txn_550e8400e29b41d4a716446655440000',
            type: 'stellar-payment',
            status: 'in-progress',
            currentStep: 1,
            totalSteps: 3,
            metadata: {
                sourceAccount: 'GCXMWUAUF37IWOABB3GNXFZB7TBBBHL3IJKUSJUWVEKM3CXEGTHUMDSD',
                txHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            },
            state: {
                validated: true,
                submitted: true,
            },
            createdAt: '2026-01-29T10:00:00.000Z',
            updatedAt: '2026-01-29T10:00:05.000Z',
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Transaction not found',
        example: {
            success: false,
            error: 'Transaction not found',
            details: 'No transaction with ID txn_invalid',
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "getTransaction", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update transaction',
        description: 'Updates the transaction status, state, or other properties. Used for manual intervention and state corrections.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        type: 'string',
        description: 'Unique transaction identifier',
        example: 'txn_550e8400e29b41d4a716446655440000',
    }),
    (0, swagger_1.ApiBody)({
        type: update_transaction_dto_1.UpdateTransactionDto,
        description: 'Fields to update',
        examples: {
            statusUpdate: {
                summary: 'Update status',
                value: {
                    status: 'completed',
                },
            },
            stateUpdate: {
                summary: 'Update internal state',
                value: {
                    state: {
                        validated: true,
                        submitted: true,
                        confirmed: true,
                    },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Transaction updated successfully',
        example: {
            id: 'txn_550e8400e29b41d4a716446655440000',
            type: 'stellar-payment',
            status: 'completed',
            currentStep: 3,
            totalSteps: 3,
            updatedAt: '2026-01-29T10:00:15.000Z',
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_transaction_dto_1.UpdateTransactionDto]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "update", null);
__decorate([
    (0, common_1.Put)(':id/advance'),
    (0, swagger_1.ApiOperation)({
        summary: 'Advance transaction to next step',
        description: 'Moves the transaction to the next step in its workflow. Each step may require different data or validations.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        type: 'string',
        description: 'Unique transaction identifier',
        example: 'txn_550e8400e29b41d4a716446655440000',
    }),
    (0, swagger_1.ApiBody)({
        type: Object,
        required: false,
        description: 'Step-specific data required for advancement',
        schema: {
            type: 'object',
            properties: {
                signature: { type: 'string', description: 'Transaction signature' },
                fee: { type: 'string', description: 'Transaction fee' },
                gasLimit: { type: 'string', description: 'Gas limit for the step' },
            },
        },
        examples: {
            stellarSign: {
                summary: 'Stellar signature step',
                value: {
                    signature: 'TAQCSRX2RIDJNHFYFZXPGXWRWQUXNZKICH57C4YKHUYATFLBMUUPAA2DWS5PDVLXP6GQ6SDFGJJWMKHW',
                },
            },
            hopFeeStep: {
                summary: 'Hop fee estimation step',
                value: {
                    fee: '1.5',
                    gasLimit: '200000',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Transaction advanced to next step',
        example: {
            id: 'txn_550e8400e29b41d4a716446655440000',
            type: 'stellar-payment',
            status: 'in-progress',
            currentStep: 2,
            totalSteps: 3,
            updatedAt: '2026-01-29T10:00:10.000Z',
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Cannot advance - step validation failed',
        example: {
            success: false,
            error: 'Step advancement failed',
            details: 'Invalid signature provided',
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "advanceStep", null);
__decorate([
    (0, common_1.Sse)(':id/events'),
    (0, swagger_1.ApiOperation)({
        summary: 'Stream transaction updates (Server-Sent Events)',
        description: 'Establishes a real-time connection to receive transaction updates via Server-Sent Events. Ideal for monitoring transaction progress in real-time.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        type: 'string',
        description: 'Unique transaction identifier',
        example: 'txn_550e8400e29b41d4a716446655440000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'SSE stream established. Events sent when transaction state changes.',
        content: {
            'text/event-stream': {
                schema: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', description: 'Transaction ID' },
                        status: { type: 'string', description: 'Transaction status' },
                        currentStep: { type: 'number', description: 'Current step number' },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Last update timestamp',
                        },
                    },
                },
                example: 'data: {"id":"txn_550e8400e29b41d4a716446655440000","status":"in-progress","currentStep":1}\n\n',
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", rxjs_1.Observable)
], TransactionsController.prototype, "streamTransactionEvents", null);
__decorate([
    (0, common_1.Get)(':id/poll'),
    (0, swagger_1.ApiOperation)({
        summary: 'Poll transaction status (fallback to SSE)',
        description: 'Alternative to Server-Sent Events for polling transaction status. Returns the current transaction state. Use this if SSE is not supported by your client.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        type: 'string',
        description: 'Unique transaction identifier',
        example: 'txn_550e8400e29b41d4a716446655440000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Transaction status retrieved',
        example: {
            id: 'txn_550e8400e29b41d4a716446655440000',
            type: 'stellar-payment',
            status: 'in-progress',
            currentStep: 1,
            totalSteps: 3,
            updatedAt: '2026-01-29T10:00:10.000Z',
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "pollTransaction", null);
__decorate([
    (0, common_1.Get)('export/:format'),
    (0, swagger_1.ApiOperation)({
        summary: 'Export transaction history',
        description: 'Export transaction history in CSV or JSON format with optional filtering. Supports filtering by account, chain, bridge, status, and date range.',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'account',
        required: false,
        description: 'Filter by account address',
        example: '0x742d35Cc6634C0532925a3b844Bc328e8f94D5dC',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'sourceChain',
        required: false,
        description: 'Filter by source chain',
        example: 'ethereum',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'destinationChain',
        required: false,
        description: 'Filter by destination chain',
        example: 'polygon',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'bridgeName',
        required: false,
        description: 'Filter by bridge name',
        example: 'hop',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'status',
        required: false,
        description: 'Filter by status',
        enum: ['pending', 'confirmed', 'failed'],
    }),
    (0, swagger_1.ApiQuery)({
        name: 'startDate',
        required: false,
        description: 'Start date (ISO 8601 format)',
        example: '2024-01-01T00:00:00.000Z',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'endDate',
        required: false,
        description: 'End date (ISO 8601 format)',
        example: '2024-12-31T23:59:59.999Z',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Transaction history exported successfully',
        content: {
            'text/csv': {
                schema: { type: 'string' },
                example: 'ID,Type,Status,Source Chain,Destination Chain,Bridge Name,Amount,Fee,TX Hash,Created At,Completed At\ntxn_123,stellar-payment,completed,ethereum,polygon,hop,100,1.5,0xabc...,2024-01-15T10:00:00.000Z,2024-01-15T10:05:00.000Z',
            },
            'application/json': {
                schema: { type: 'array', items: { type: 'object' } },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid export format or parameters',
    }),
    __param(0, (0, common_1.Param)('format')),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, export_transactions_dto_1.ExportTransactionsDto, Object]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "exportTransactions", null);
exports.TransactionsController = TransactionsController = __decorate([
    (0, swagger_1.ApiTags)('Transactions'),
    (0, common_1.Controller)('transactions'),
    __metadata("design:paramtypes", [transactions_service_1.TransactionsService,
        transactions_export_service_1.TransactionsExportService,
        event_emitter_1.EventEmitter2])
], TransactionsController);
//# sourceMappingURL=transactions.controller.js.map