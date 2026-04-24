"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var QuoteCacheService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuoteCacheService = void 0;
const common_1 = require("@nestjs/common");
// Quotes include live fees and slippage, so a short TTL keeps results fresh
// while still absorbing burst traffic (e.g. the frontend's 15-second auto-refresh).
const DEFAULT_TTL_MS = 30_000;
// Sweep expired entries every minute to keep memory bounded.
const CLEANUP_INTERVAL_MS = 60_000;
let QuoteCacheService = QuoteCacheService_1 = class QuoteCacheService {
    constructor() {
        this.logger = new common_1.Logger(QuoteCacheService_1.name);
        this.cache = new Map();
        this.cleanupTimer = null;
        this.hits = 0;
        this.misses = 0;
    }
    onModuleInit() {
        this.cleanupTimer = setInterval(() => this.clearExpired(), CLEANUP_INTERVAL_MS);
    }
    onModuleDestroy() {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
        }
    }
    /**
     * Build a deterministic cache key from quote request parameters.
     * Amount is normalised to avoid floating-point key divergence.
     */
    buildKey(params) {
        const amount = parseFloat(params.amount.toFixed(6));
        return [
            params.sourceToken.toUpperCase(),
            params.sourceChain.toLowerCase(),
            params.destinationChain.toLowerCase(),
            (params.destinationToken ?? params.sourceToken).toUpperCase(),
            amount,
            params.rankingMode,
        ].join(':');
    }
    /**
     * Return a cached response if one exists and has not expired, else null.
     */
    get(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            this.misses++;
            return null;
        }
        if (Date.now() - entry.storedAt > entry.ttl) {
            this.cache.delete(key);
            this.misses++;
            return null;
        }
        this.hits++;
        this.logger.debug(`Cache hit for key: ${key}`);
        return entry.response;
    }
    /**
     * Store a response in the cache.
     */
    set(key, response, ttlMs = DEFAULT_TTL_MS) {
        this.cache.set(key, {
            response,
            storedAt: Date.now(),
            ttl: ttlMs,
        });
        this.logger.debug(`Cached response for key: ${key} (TTL ${ttlMs}ms)`);
    }
    /**
     * Remove all entries whose TTL has elapsed.
     */
    clearExpired() {
        const now = Date.now();
        let removed = 0;
        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.storedAt > entry.ttl) {
                this.cache.delete(key);
                removed++;
            }
        }
        if (removed > 0) {
            this.logger.debug(`Cleared ${removed} expired cache entries`);
        }
    }
    /** Evict everything — useful for testing or forced refreshes. */
    clear() {
        this.cache.clear();
    }
    getStats() {
        const total = this.hits + this.misses;
        return {
            size: this.cache.size,
            hits: this.hits,
            misses: this.misses,
            hitRate: total > 0 ? this.hits / total : 0,
        };
    }
};
exports.QuoteCacheService = QuoteCacheService;
exports.QuoteCacheService = QuoteCacheService = QuoteCacheService_1 = __decorate([
    (0, common_1.Injectable)()
], QuoteCacheService);
//# sourceMappingURL=quote-cache.service.js.map