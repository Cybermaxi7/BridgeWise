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
var WebhookService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookService = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const bullmq_2 = require("bullmq");
const crypto_1 = require("crypto");
const typeorm_2 = require("typeorm");
const webhook_delivery_entity_1 = require("./entities/webhook-delivery.entity");
const webhook_entity_1 = require("./entities/webhook.entity");
const delivery_status_enum_1 = require("./enums/delivery-status.enum");
const webhook_event_enum_1 = require("./enums/webhook-event.enum");
const webhook_constants_1 = require("./webhook.constants");
let WebhookService = WebhookService_1 = class WebhookService {
    constructor(webhookRepo, deliveryRepo, webhookQueue) {
        this.webhookRepo = webhookRepo;
        this.deliveryRepo = deliveryRepo;
        this.webhookQueue = webhookQueue;
        this.logger = new common_1.Logger(WebhookService_1.name);
    }
    // ──────────────────────────────────────────────────────────────────────────
    // CRUD
    // ──────────────────────────────────────────────────────────────────────────
    async create(dto) {
        const webhook = this.webhookRepo.create({
            ...dto,
            events: dto.events ?? [],
            isActive: dto.isActive ?? true,
            maxRetries: dto.maxRetries ?? 5,
        });
        return this.webhookRepo.save(webhook);
    }
    async findAll() {
        return this.webhookRepo.find({ order: { createdAt: 'DESC' } });
    }
    async findOne(id) {
        const webhook = await this.webhookRepo.findOne({ where: { id } });
        if (!webhook)
            throw new common_1.NotFoundException(`Webhook ${id} not found`);
        return webhook;
    }
    async update(id, dto) {
        const webhook = await this.findOne(id);
        Object.assign(webhook, dto);
        return this.webhookRepo.save(webhook);
    }
    async remove(id) {
        const webhook = await this.findOne(id);
        await this.webhookRepo.remove(webhook);
    }
    // ──────────────────────────────────────────────────────────────────────────
    // Deliveries
    // ──────────────────────────────────────────────────────────────────────────
    async listDeliveries(webhookId, query) {
        await this.findOne(webhookId); // 404 guard
        const [items, total] = await this.deliveryRepo.findAndCount({
            where: { webhookId },
            order: { createdAt: 'DESC' },
            skip: ((query.page ?? 1) - 1) * (query.limit ?? 20),
            take: query.limit ?? 20,
        });
        return { items, total };
    }
    async getDelivery(webhookId, deliveryId) {
        await this.findOne(webhookId);
        const delivery = await this.deliveryRepo.findOne({
            where: { id: deliveryId, webhookId },
        });
        if (!delivery)
            throw new common_1.NotFoundException(`Delivery ${deliveryId} not found`);
        return delivery;
    }
    /** Manually re-queue a failed delivery */
    async retryDelivery(webhookId, deliveryId) {
        const webhook = await this.findOne(webhookId);
        const delivery = await this.getDelivery(webhookId, deliveryId);
        await this.deliveryRepo.update(delivery.id, {
            status: delivery_status_enum_1.DeliveryStatus.RETRYING,
            attempt: 0,
        });
        await this.enqueueDelivery(webhook, delivery, delivery.payload, 0);
    }
    // ──────────────────────────────────────────────────────────────────────────
    // Event dispatch
    // ──────────────────────────────────────────────────────────────────────────
    /**
     * Dispatches an event to all active, subscribed webhooks.
     * Call this from any service that emits domain events.
     */
    async dispatch(dto) {
        const subscribers = await this.findSubscribers(dto.event);
        if (!subscribers.length) {
            this.logger.debug(`No subscribers for event "${dto.event}"`);
            return;
        }
        const payload = {
            id: (0, crypto_1.randomUUID)(),
            event: dto.event,
            createdAt: new Date().toISOString(),
            data: dto.data ?? {},
        };
        await Promise.all(subscribers.map((webhook) => this.scheduleDelivery(webhook, payload)));
    }
    /**
     * Sends a PING event to a single webhook (used to test connectivity).
     */
    async ping(id) {
        const webhook = await this.findOne(id);
        await this.scheduleDelivery(webhook, {
            id: (0, crypto_1.randomUUID)(),
            event: webhook_event_enum_1.WebhookEvent.PING,
            createdAt: new Date().toISOString(),
            data: { message: 'Webhook ping test' },
        });
    }
    // ──────────────────────────────────────────────────────────────────────────
    // Internal helpers
    // ──────────────────────────────────────────────────────────────────────────
    async findSubscribers(event) {
        const all = await this.webhookRepo.find({ where: { isActive: true } });
        return all.filter((w) => !w.events.length || w.events.includes(event));
    }
    async scheduleDelivery(webhook, payload) {
        const delivery = this.deliveryRepo.create({
            webhookId: webhook.id,
            event: payload.event,
            payload: payload,
            status: delivery_status_enum_1.DeliveryStatus.PENDING,
            attempt: 0,
        });
        const saved = await this.deliveryRepo.save(delivery);
        await this.enqueueDelivery(webhook, saved, payload, 0);
    }
    async enqueueDelivery(webhook, delivery, payload, attempt) {
        const jobData = {
            webhookId: webhook.id,
            deliveryId: delivery.id,
            url: webhook.url,
            secret: webhook.secret,
            payload,
            attempt,
        };
        await this.webhookQueue.add('deliver', jobData, {
            attempts: webhook.maxRetries,
            backoff: {
                type: 'exponential',
                delay: 5_000, // 5 s → 10 s → 20 s …
            },
            removeOnComplete: { age: 86_400 }, // keep 24 h
            removeOnFail: false,
        });
        this.logger.log(`Queued delivery ${delivery.id} for webhook ${webhook.id} (event: ${payload.event})`);
    }
};
exports.WebhookService = WebhookService;
exports.WebhookService = WebhookService = WebhookService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(webhook_entity_1.Webhook)),
    __param(1, (0, typeorm_1.InjectRepository)(webhook_delivery_entity_1.WebhookDelivery)),
    __param(2, (0, bullmq_1.InjectQueue)(webhook_constants_1.WEBHOOK_QUEUE)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository, typeof (_a = typeof bullmq_2.Queue !== "undefined" && bullmq_2.Queue) === "function" ? _a : Object])
], WebhookService);
//# sourceMappingURL=webhook.service.js.map