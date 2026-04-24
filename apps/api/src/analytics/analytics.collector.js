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
var AnalyticsCollector_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsCollector = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const analytics_service_1 = require("./analytics.service");
/**
 * Analytics Collector
 *
 * Listens to transaction and benchmark events to update analytics in real-time.
 * Integrates with the existing EventEmitter2 system.
 */
let AnalyticsCollector = AnalyticsCollector_1 = class AnalyticsCollector {
    constructor(analyticsService, eventEmitter) {
        this.analyticsService = analyticsService;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(AnalyticsCollector_1.name);
        this.batchQueue = [];
        this.batchTimeout = null;
        this.BATCH_SIZE = 100;
        this.BATCH_INTERVAL_MS = 5000; // 5 seconds
    }
    onModuleInit() {
        this.logger.log('AnalyticsCollector initialized');
    }
    /**
     * Listen for transaction updates
     */
    async handleTransactionUpdate(event) {
        this.logger.debug(`Received transaction update: ${event.id} - ${event.status}`);
        // Only process completed or failed transactions
        if (event.status !== 'completed' && event.status !== 'failed') {
            return;
        }
        const payload = this.buildPayloadFromTransaction(event);
        if (payload) {
            await this.processUpdate(payload);
        }
    }
    /**
     * Listen for benchmark completion events
     */
    async handleBenchmarkCompleted(event) {
        this.logger.debug(`Received benchmark completion: ${event.id}`);
        const payload = {
            route: {
                bridgeName: event.bridgeName,
                sourceChain: event.sourceChain,
                destinationChain: event.destinationChain,
                token: event.token,
            },
            settlementTimeMs: event.durationMs,
            fee: event.fee,
            slippagePercent: event.slippagePercent,
            volume: event.amount,
            status: event.status === 'confirmed' ? 'success' : 'failed',
            timestamp: event.completedAt,
        };
        await this.processUpdate(payload);
    }
    /**
     * Listen for slippage alert events
     */
    async handleSlippageAlert(event) {
        this.logger.debug(`Received slippage alert: ${event.bridge} - ${event.slippage}%`);
        // Could track high slippage events separately for alerting
    }
    /**
     * Process a single analytics update
     */
    async processUpdate(payload) {
        // Add to batch queue
        this.batchQueue.push(payload);
        // Process immediately if batch size reached
        if (this.batchQueue.length >= this.BATCH_SIZE) {
            await this.flushBatch();
        }
        else {
            // Schedule batch flush
            this.scheduleBatchFlush();
        }
    }
    /**
     * Schedule a batch flush
     */
    scheduleBatchFlush() {
        if (this.batchTimeout) {
            return; // Already scheduled
        }
        this.batchTimeout = setTimeout(() => {
            this.flushBatch();
        }, this.BATCH_INTERVAL_MS);
    }
    /**
     * Flush the batch queue
     */
    async flushBatch() {
        if (this.batchQueue.length === 0) {
            return;
        }
        // Clear timeout if exists
        if (this.batchTimeout) {
            clearTimeout(this.batchTimeout);
            this.batchTimeout = null;
        }
        // Get current batch and clear queue
        const batch = [...this.batchQueue];
        this.batchQueue = [];
        this.logger.debug(`Flushing analytics batch: ${batch.length} updates`);
        // Process each update
        for (const payload of batch) {
            try {
                await this.analyticsService.updateAnalytics(payload);
            }
            catch (error) {
                this.logger.error(`Failed to update analytics for ${payload.route.bridgeName}: ${error.message}`, error.stack);
            }
        }
        this.logger.debug(`Batch flush complete: ${batch.length} updates processed`);
    }
    /**
     * Build analytics payload from transaction event
     */
    buildPayloadFromTransaction(event) {
        // Extract route information from metadata
        const metadata = event.metadata || {};
        const state = event.state || {};
        const bridgeName = metadata.bridge ||
            metadata.bridgeName ||
            state.bridge;
        const sourceChain = metadata.sourceChain ||
            metadata.fromChain ||
            state.sourceChain;
        const destinationChain = metadata.destinationChain ||
            metadata.toChain ||
            state.destinationChain;
        const token = metadata.token || state.token;
        if (!bridgeName || !sourceChain || !destinationChain) {
            this.logger.warn(`Cannot build analytics payload: missing route info for transaction ${event.id}`);
            return null;
        }
        // Calculate settlement time if available
        let settlementTimeMs;
        if (event.completedAt && event.createdAt) {
            settlementTimeMs =
                new Date(event.completedAt).getTime() -
                    new Date(event.createdAt).getTime();
        }
        return {
            route: {
                bridgeName,
                sourceChain,
                destinationChain,
                token,
            },
            settlementTimeMs,
            fee: state.fee,
            slippagePercent: state.slippage,
            volume: metadata.amount,
            status: event.status === 'completed' ? 'success' : 'failed',
            timestamp: event.completedAt || new Date(),
        };
    }
    /**
     * Force immediate batch flush
     * Useful for graceful shutdown
     */
    async forceFlush() {
        this.logger.log('Forcing analytics batch flush...');
        await this.flushBatch();
    }
    /**
     * Get current batch queue size
     */
    getQueueSize() {
        return this.batchQueue.length;
    }
};
exports.AnalyticsCollector = AnalyticsCollector;
__decorate([
    (0, event_emitter_1.OnEvent)('transaction.updated'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnalyticsCollector.prototype, "handleTransactionUpdate", null);
__decorate([
    (0, event_emitter_1.OnEvent)('benchmark.completed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnalyticsCollector.prototype, "handleBenchmarkCompleted", null);
__decorate([
    (0, event_emitter_1.OnEvent)('slippage.alert'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnalyticsCollector.prototype, "handleSlippageAlert", null);
exports.AnalyticsCollector = AnalyticsCollector = AnalyticsCollector_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [analytics_service_1.AnalyticsService,
        event_emitter_1.EventEmitter2])
], AnalyticsCollector);
//# sourceMappingURL=analytics.collector.js.map