"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var WebhookSignatureService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookSignatureService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
let WebhookSignatureService = WebhookSignatureService_1 = class WebhookSignatureService {
    /**
     * Generates an HMAC-SHA256 signature for the given payload using the secret.
     * Signature format:  sha256=<hex-digest>
     */
    sign(payload, secret) {
        const digest = (0, crypto_1.createHmac)(WebhookSignatureService_1.ALGORITHM, secret)
            .update(payload, 'utf8')
            .digest('hex');
        return `${WebhookSignatureService_1.HEADER_PREFIX}${digest}`;
    }
    /**
     * Constant-time comparison to prevent timing attacks.
     */
    verify(payload, secret, signature) {
        const expected = this.sign(payload, secret);
        try {
            return (0, crypto_1.timingSafeEqual)(Buffer.from(expected), Buffer.from(signature));
        }
        catch {
            // Buffers differ in length → not equal
            return false;
        }
    }
};
exports.WebhookSignatureService = WebhookSignatureService;
WebhookSignatureService.ALGORITHM = 'sha256';
WebhookSignatureService.HEADER_PREFIX = 'sha256=';
exports.WebhookSignatureService = WebhookSignatureService = WebhookSignatureService_1 = __decorate([
    (0, common_1.Injectable)()
], WebhookSignatureService);
//# sourceMappingURL=webhook-signature.service.js.map