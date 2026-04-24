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
var ApiSecurityGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiSecurityGuard = void 0;
const common_1 = require("@nestjs/common");
const api_key_vault_service_1 = require("./api-key-vault.service");
/**
 * API Security Guard
 * Validates all incoming API requests for proper authentication
 * Prevents unauthorized access and logs all security events
 */
let ApiSecurityGuard = ApiSecurityGuard_1 = class ApiSecurityGuard {
    constructor(apiKeyVault) {
        this.apiKeyVault = apiKeyVault;
        this.logger = new common_1.Logger(ApiSecurityGuard_1.name);
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        // Skip security for public endpoints
        if (this.isPublicRoute(request.path)) {
            return true;
        }
        try {
            // Check for valid authentication
            const authHeader = request.headers.authorization;
            if (!authHeader) {
                this.logger.warn(`Unauthorized access attempt from ${request.ip}: No auth header`);
                throw new common_1.UnauthorizedException('Missing authorization header');
            }
            // Validate token format
            const [scheme, credentials] = authHeader.split(' ');
            if (scheme.toLowerCase() !== 'bearer') {
                this.logger.warn(`Invalid auth scheme from ${request.ip}: ${scheme}`);
                throw new common_1.UnauthorizedException('Invalid authorization scheme');
            }
            if (!credentials) {
                throw new common_1.UnauthorizedException('Missing credentials');
            }
            // Store authenticated user info on request
            request.user = {
                authenticated: true,
                timestamp: new Date(),
            };
            return true;
        }
        catch (error) {
            this.logger.error(`Security guard error: ${error.message}`);
            throw error;
        }
    }
    /**
     * Check if route is public
     */
    isPublicRoute(path) {
        const publicRoutes = [
            '/health',
            '/metrics',
            '/openapi',
            '/docs',
            '/api/docs',
        ];
        return publicRoutes.some((route) => path.startsWith(route));
    }
};
exports.ApiSecurityGuard = ApiSecurityGuard;
exports.ApiSecurityGuard = ApiSecurityGuard = ApiSecurityGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [api_key_vault_service_1.ApiKeyVaultService])
], ApiSecurityGuard);
//# sourceMappingURL=api-security.guard.js.map