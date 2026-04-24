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
exports.WebhookAdminGuard = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto_1 = require("crypto");
/**
 * WebhookAdminGuard
 * ─────────────────
 * Protects the internal /webhooks/dispatch endpoint (and any other admin
 * webhook routes) behind a pre-shared API key.
 *
 * The key is read from the environment variable WEBHOOK_ADMIN_SECRET.
 * Consumers must supply it as:
 *
 *   Authorization: Bearer <WEBHOOK_ADMIN_SECRET>
 *
 * Usage — apply per route:
 *   @UseGuards(WebhookAdminGuard)
 *   @Post('dispatch')
 *   dispatch(@Body() dto: DispatchEventDto) { ... }
 *
 * Or globally in AppModule / a dedicated admin module guard.
 */
let WebhookAdminGuard = class WebhookAdminGuard {
    constructor(config) {
        this.config = config;
    }
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['authorization'] ?? '';
        if (!authHeader.startsWith('Bearer ')) {
            throw new common_1.UnauthorizedException('Missing admin Bearer token');
        }
        const token = authHeader.slice(7);
        const expected = this.config.get('WEBHOOK_ADMIN_SECRET', '');
        if (!expected) {
            throw new common_1.UnauthorizedException('WEBHOOK_ADMIN_SECRET is not configured');
        }
        let match = false;
        try {
            match = (0, crypto_1.timingSafeEqual)(Buffer.from(token), Buffer.from(expected));
        }
        catch {
            // Buffers differ in length
            match = false;
        }
        if (!match)
            throw new common_1.UnauthorizedException('Invalid admin token');
        return true;
    }
};
exports.WebhookAdminGuard = WebhookAdminGuard;
exports.WebhookAdminGuard = WebhookAdminGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], WebhookAdminGuard);
//# sourceMappingURL=webhook-admin.guard.js.map