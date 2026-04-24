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
var WebhookDeliveryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookDeliveryService = void 0;
const axios_1 = require("@nestjs/axios");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const rxjs_1 = require("rxjs");
const typeorm_2 = require("typeorm");
const webhook_delivery_entity_1 = require("./entities/webhook-delivery.entity");
const delivery_status_enum_1 = require("./enums/delivery-status.enum");
const webhook_signature_service_1 = require("./webhook-signature.service");
const DELIVERY_TIMEOUT_MS = 10_000; // 10 s
const MAX_RESPONSE_BODY = 2_048; // 2 KiB stored
let WebhookDeliveryService = WebhookDeliveryService_1 = class WebhookDeliveryService {
    constructor(httpService, signatureService, deliveryRepo) {
        this.httpService = httpService;
        this.signatureService = signatureService;
        this.deliveryRepo = deliveryRepo;
        this.logger = new common_1.Logger(WebhookDeliveryService_1.name);
    }
    /**
     * Executes one HTTP delivery attempt.
     * Throws on failure so BullMQ can handle retries / backoff.
     */
    async deliver(job) {
        const { deliveryId, url, secret, payload, attempt } = job;
        const body = JSON.stringify(payload);
        const signature = this.signatureService.sign(body, secret);
        this.logger.log(`Attempting delivery ${deliveryId} → ${url} (attempt #${attempt + 1})`);
        await this.deliveryRepo.update(deliveryId, {
            status: delivery_status_enum_1.DeliveryStatus.RETRYING,
            attempt: attempt + 1,
        });
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService
                .post(url, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-BridgeWise-Signature': signature,
                    'X-BridgeWise-Event': payload.event,
                    'X-BridgeWise-Delivery': deliveryId,
                },
                validateStatus: () => true, // handle all statuses ourselves
            })
                .pipe((0, rxjs_1.timeout)(DELIVERY_TIMEOUT_MS)));
            const responseBody = typeof response.data === 'string'
                ? response.data.slice(0, MAX_RESPONSE_BODY)
                : JSON.stringify(response.data).slice(0, MAX_RESPONSE_BODY);
            const success = response.status >= 200 && response.status < 300;
            await this.deliveryRepo.update(deliveryId, {
                status: success ? delivery_status_enum_1.DeliveryStatus.SUCCESS : delivery_status_enum_1.DeliveryStatus.FAILED,
                responseStatus: response.status,
                responseBody,
                deliveredAt: success ? new Date() : null,
                errorMessage: success
                    ? null
                    : `HTTP ${response.status}: ${responseBody}`,
            });
            if (!success) {
                throw new Error(`Webhook consumer returned ${response.status} for delivery ${deliveryId}`);
            }
            this.logger.log(`Delivery ${deliveryId} succeeded (HTTP ${response.status})`);
        }
        catch (error) {
            const isAxiosError = error.isAxiosError;
            const message = isAxiosError
                ? `Network error: ${error.message}`
                : error.message;
            this.logger.warn(`Delivery ${deliveryId} failed: ${message}`);
            await this.deliveryRepo.update(deliveryId, {
                status: delivery_status_enum_1.DeliveryStatus.FAILED,
                errorMessage: message.slice(0, 1_000),
            });
            throw error; // re-throw → BullMQ retries
        }
    }
    /** Mark a delivery as permanently exhausted (called by processor on final fail) */
    async markExhausted(deliveryId, errorMessage) {
        await this.deliveryRepo.update(deliveryId, {
            status: delivery_status_enum_1.DeliveryStatus.EXHAUSTED,
            errorMessage: `Exhausted all retries. Last error: ${errorMessage}`.slice(0, 1_000),
        });
        this.logger.error(`Delivery ${deliveryId} exhausted all retry attempts`);
    }
};
exports.WebhookDeliveryService = WebhookDeliveryService;
exports.WebhookDeliveryService = WebhookDeliveryService = WebhookDeliveryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, typeorm_1.InjectRepository)(webhook_delivery_entity_1.WebhookDelivery)),
    __metadata("design:paramtypes", [axios_1.HttpService,
        webhook_signature_service_1.WebhookSignatureService,
        typeorm_2.Repository])
], WebhookDeliveryService);
//# sourceMappingURL=webhook-delivery.service.js.map