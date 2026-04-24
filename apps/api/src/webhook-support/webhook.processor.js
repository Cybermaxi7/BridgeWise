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
var WebhookProcessor_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const bullmq_2 = require("bullmq");
const webhook_delivery_service_1 = require("./webhook-delivery.service");
const webhook_constants_1 = require("./webhook.constants");
let WebhookProcessor = WebhookProcessor_1 = class WebhookProcessor extends bullmq_1.WorkerHost {
    constructor(deliveryService) {
        super();
        this.deliveryService = deliveryService;
        this.logger = new common_1.Logger(WebhookProcessor_1.name);
    }
    async process(job) {
        this.logger.debug(`Processing job ${job.id} (attempt ${job.attemptsMade + 1})`);
        await this.deliveryService.deliver({ ...job.data, attempt: job.attemptsMade });
    }
    async onFailed(job, error) {
        const isLastAttempt = job.attemptsMade >= (job.opts.attempts ?? 1);
        if (isLastAttempt) {
            this.logger.error(`Job ${job.id} permanently failed after ${job.attemptsMade} attempts: ${error.message}`);
            await this.deliveryService.markExhausted(job.data.deliveryId, error.message);
        }
        else {
            this.logger.warn(`Job ${job.id} failed (attempt ${job.attemptsMade}), will retry: ${error.message}`);
        }
    }
    onCompleted(job) {
        this.logger.debug(`Job ${job.id} completed successfully`);
    }
};
exports.WebhookProcessor = WebhookProcessor;
__decorate([
    (0, bullmq_1.OnWorkerEvent)('failed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_a = typeof bullmq_2.Job !== "undefined" && bullmq_2.Job) === "function" ? _a : Object, Error]),
    __metadata("design:returntype", Promise)
], WebhookProcessor.prototype, "onFailed", null);
__decorate([
    (0, bullmq_1.OnWorkerEvent)('completed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof bullmq_2.Job !== "undefined" && bullmq_2.Job) === "function" ? _b : Object]),
    __metadata("design:returntype", void 0)
], WebhookProcessor.prototype, "onCompleted", null);
exports.WebhookProcessor = WebhookProcessor = WebhookProcessor_1 = __decorate([
    (0, bullmq_1.Processor)(webhook_constants_1.WEBHOOK_QUEUE),
    __metadata("design:paramtypes", [webhook_delivery_service_1.WebhookDeliveryService])
], WebhookProcessor);
//# sourceMappingURL=webhook.processor.js.map