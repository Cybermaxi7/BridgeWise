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
var SecureRequestMiddleware_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecureRequestMiddleware = void 0;
const common_1 = require("@nestjs/common");
const api_key_vault_service_1 = require("./api-key-vault.service");
/**
 * Secure Request Middleware
 * Intercepts outbound API requests and injects secrets from vault
 * Ensures keys are never exposed to client-side code
 */
let SecureRequestMiddleware = SecureRequestMiddleware_1 = class SecureRequestMiddleware {
    constructor(apiKeyVault) {
        this.apiKeyVault = apiKeyVault;
        this.logger = new common_1.Logger(SecureRequestMiddleware_1.name);
    }
    use(req, res, next) {
        // Sanitize request to prevent key leaks
        this.sanitizeRequest(req);
        // Log request (but not sensitive data)
        this.logSecureRequest(req);
        next();
    }
    /**
     * Sanitize request to remove any potentially sensitive headers
     */
    sanitizeRequest(req) {
        const forbiddenHeaders = [
            'x-api-key',
            'authorization',
            'x-secret-key',
            'api-secret',
        ];
        forbiddenHeaders.forEach((header) => {
            if (req.headers[header.toLowerCase()]) {
                this.logger.warn(`Sensitive header detected in client request: ${header}. Removing.`);
                delete req.headers[header.toLowerCase()];
            }
        });
    }
    /**
     * Log request safely without exposing secrets
     */
    logSecureRequest(req) {
        const logData = {
            method: req.method,
            path: req.path,
            ip: req.ip,
            timestamp: new Date().toISOString(),
        };
        this.logger.debug(`API Request: ${JSON.stringify(logData)}`);
    }
};
exports.SecureRequestMiddleware = SecureRequestMiddleware;
exports.SecureRequestMiddleware = SecureRequestMiddleware = SecureRequestMiddleware_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [api_key_vault_service_1.ApiKeyVaultService])
], SecureRequestMiddleware);
//# sourceMappingURL=secure-request.middleware.js.map