"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookModule = void 0;
const axios_1 = require("@nestjs/axios");
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const webhook_delivery_entity_1 = require("./entities/webhook-delivery.entity");
const webhook_entity_1 = require("./entities/webhook.entity");
const webhook_controller_1 = require("./webhook.controller");
const webhook_constants_1 = require("./webhook.constants");
const webhook_delivery_service_1 = require("./webhook-delivery.service");
const webhook_processor_1 = require("./webhook.processor");
const webhook_service_1 = require("./webhook.service");
const webhook_signature_service_1 = require("./webhook-signature.service");
let WebhookModule = class WebhookModule {
};
exports.WebhookModule = WebhookModule;
exports.WebhookModule = WebhookModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([webhook_entity_1.Webhook, webhook_delivery_entity_1.WebhookDelivery]),
            bullmq_1.BullModule.registerQueue({
                name: webhook_constants_1.WEBHOOK_QUEUE,
                defaultJobOptions: {
                    attempts: 5,
                    backoff: { type: 'exponential', delay: 5_000 },
                    removeOnComplete: { age: 86_400 },
                    removeOnFail: false,
                },
            }),
            axios_1.HttpModule.register({
                timeout: 10_000,
                maxRedirects: 3,
            }),
        ],
        controllers: [webhook_controller_1.WebhookController],
        providers: [
            webhook_service_1.WebhookService,
            webhook_delivery_service_1.WebhookDeliveryService,
            webhook_signature_service_1.WebhookSignatureService,
            webhook_processor_1.WebhookProcessor,
        ],
        exports: [
            webhook_service_1.WebhookService, // expose dispatch() to other modules
            webhook_signature_service_1.WebhookSignatureService,
        ],
    })
], WebhookModule);
//# sourceMappingURL=webhook.module.js.map