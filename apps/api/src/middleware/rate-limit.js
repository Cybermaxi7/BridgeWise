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
var RateLimitMiddleware_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitMiddleware = void 0;
const common_1 = require("@nestjs/common");
let RateLimitMiddleware = RateLimitMiddleware_1 = class RateLimitMiddleware {
    constructor(options) {
        this.logger = new common_1.Logger(RateLimitMiddleware_1.name);
        this.store = new Map();
        this.windowMs = options?.windowMs ?? 15 * 60 * 1000;
        this.maxRequests = options?.maxRequests ?? 100;
    }
    getClientKey(req) {
        const userId = req.header?.('x-user-id') ||
            req.header?.('x-api-key') ||
            req.headers.authorization;
        if (userId) {
            return `user:${userId}`;
        }
        return `ip:${req.ip || req.connection?.remoteAddress || 'unknown'}`;
    }
    getEntry(key) {
        const entry = this.store.get(key);
        if (!entry) {
            return undefined;
        }
        if (Date.now() >= entry.expiresAt) {
            this.store.delete(key);
            return undefined;
        }
        return entry;
    }
    createEntry(key) {
        const entry = {
            count: 0,
            expiresAt: Date.now() + this.windowMs,
        };
        this.store.set(key, entry);
        return entry;
    }
    use(req, res, next) {
        const key = this.getClientKey(req);
        const now = Date.now();
        const entry = this.getEntry(key) ?? this.createEntry(key);
        entry.count += 1;
        const remaining = Math.max(this.maxRequests - entry.count, 0);
        const resetSeconds = Math.ceil((entry.expiresAt - now) / 1000);
        res.setHeader('X-RateLimit-Limit', this.maxRequests.toString());
        res.setHeader('X-RateLimit-Remaining', remaining.toString());
        res.setHeader('X-RateLimit-Reset', resetSeconds.toString());
        if (entry.count > this.maxRequests) {
            this.logger.warn(`Rate limit exceeded for ${key}: ${entry.count}/${this.maxRequests}`);
            res.status(common_1.HttpStatus.TOO_MANY_REQUESTS).json({
                statusCode: common_1.HttpStatus.TOO_MANY_REQUESTS,
                message: 'Too many requests, please try again later.',
            });
            return;
        }
        next();
    }
};
exports.RateLimitMiddleware = RateLimitMiddleware;
exports.RateLimitMiddleware = RateLimitMiddleware = RateLimitMiddleware_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Object])
], RateLimitMiddleware);
//# sourceMappingURL=rate-limit.js.map