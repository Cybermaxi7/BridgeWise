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
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookController = void 0;
const common_1 = require("@nestjs/common");
const webhook_admin_guard_1 = require("./guards/webhook-admin.guard");
const webhook_dto_1 = require("./dto/webhook.dto");
const webhook_service_1 = require("./webhook.service");
/**
 * @tag Webhooks
 *
 * Endpoints
 * ─────────────────────────────────────────────────────────────────────────────
 * POST   /webhooks                          Register a new webhook
 * GET    /webhooks                          List all registered webhooks
 * GET    /webhooks/:id                      Get a single webhook
 * PATCH  /webhooks/:id                      Update a webhook
 * DELETE /webhooks/:id                      Remove a webhook
 * POST   /webhooks/:id/ping                 Send a PING test event
 * GET    /webhooks/:id/deliveries           List delivery attempts
 * GET    /webhooks/:id/deliveries/:dId      Get one delivery record
 * POST   /webhooks/:id/deliveries/:dId/retry  Re-queue a failed delivery
 * POST   /webhooks/dispatch                 Dispatch an event (admin / internal)
 */
let WebhookController = class WebhookController {
    constructor(webhookService) {
        this.webhookService = webhookService;
    }
    // ──────────────────────────────────────────────────────────────────────────
    // Webhook CRUD
    // ──────────────────────────────────────────────────────────────────────────
    create(dto) {
        return this.webhookService.create(dto);
    }
    findAll() {
        return this.webhookService.findAll();
    }
    findOne(id) {
        return this.webhookService.findOne(id);
    }
    update(id, dto) {
        return this.webhookService.update(id, dto);
    }
    remove(id) {
        return this.webhookService.remove(id);
    }
    // ──────────────────────────────────────────────────────────────────────────
    // Ping / test connectivity
    // ──────────────────────────────────────────────────────────────────────────
    ping(id) {
        return this.webhookService.ping(id);
    }
    // ──────────────────────────────────────────────────────────────────────────
    // Delivery logs
    // ──────────────────────────────────────────────────────────────────────────
    listDeliveries(id, query) {
        return this.webhookService.listDeliveries(id, query);
    }
    getDelivery(id, dId) {
        return this.webhookService.getDelivery(id, dId);
    }
    retryDelivery(id, dId) {
        return this.webhookService.retryDelivery(id, dId);
    }
    // ──────────────────────────────────────────────────────────────────────────
    // Internal / Admin dispatch
    // ──────────────────────────────────────────────────────────────────────────
    /**
     * Triggers an event broadcast to all active, subscribed webhooks.
     * Protected by WebhookAdminGuard — requires `Authorization: Bearer <WEBHOOK_ADMIN_SECRET>`.
     */
    dispatch(dto) {
        return this.webhookService.dispatch(dto);
    }
};
exports.WebhookController = WebhookController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_a = typeof webhook_dto_1.CreateWebhookDto !== "undefined" && webhook_dto_1.CreateWebhookDto) === "function" ? _a : Object]),
    __metadata("design:returntype", Promise)
], WebhookController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WebhookController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WebhookController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_b = typeof webhook_dto_1.UpdateWebhookDto !== "undefined" && webhook_dto_1.UpdateWebhookDto) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], WebhookController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WebhookController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/ping'),
    (0, common_1.HttpCode)(common_1.HttpStatus.ACCEPTED),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WebhookController.prototype, "ping", null);
__decorate([
    (0, common_1.Get)(':id/deliveries'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_c = typeof webhook_dto_1.ListDeliveriesQueryDto !== "undefined" && webhook_dto_1.ListDeliveriesQueryDto) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], WebhookController.prototype, "listDeliveries", null);
__decorate([
    (0, common_1.Get)(':id/deliveries/:dId'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('dId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WebhookController.prototype, "getDelivery", null);
__decorate([
    (0, common_1.Post)(':id/deliveries/:dId/retry'),
    (0, common_1.HttpCode)(common_1.HttpStatus.ACCEPTED),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('dId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WebhookController.prototype, "retryDelivery", null);
__decorate([
    (0, common_1.UseGuards)(webhook_admin_guard_1.WebhookAdminGuard),
    (0, common_1.Post)('dispatch'),
    (0, common_1.HttpCode)(common_1.HttpStatus.ACCEPTED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof webhook_dto_1.DispatchEventDto !== "undefined" && webhook_dto_1.DispatchEventDto) === "function" ? _d : Object]),
    __metadata("design:returntype", Promise)
], WebhookController.prototype, "dispatch", null);
exports.WebhookController = WebhookController = __decorate([
    (0, common_1.Controller)('webhooks'),
    __metadata("design:paramtypes", [webhook_service_1.WebhookService])
], WebhookController);
//# sourceMappingURL=webhook.controller.js.map