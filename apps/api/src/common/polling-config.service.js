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
exports.PollingConfigService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
/**
 * PollingConfigService
 *
 * Single source of truth for all polling intervals across the API.
 * Values are read from environment variables with sensible defaults so
 * developers can tune them per-environment without code changes.
 *
 * Environment variables (all optional):
 *   POLLING_QUOTE_REFRESH_MS          — default 10000
 *   POLLING_STATUS_POLL_MS            — default 5000
 *   POLLING_BENCHMARK_AGGREGATION_MS  — default 60000
 *   POLLING_STALE_TRANSACTION_MS      — default 30000
 *
 * Usage:
 *   constructor(private readonly pollingConfig: PollingConfigService) {}
 *   const interval = this.pollingConfig.get('quoteRefreshMs');
 */
let PollingConfigService = class PollingConfigService {
    constructor(configService) {
        this.configService = configService;
        this.intervals = {
            quoteRefreshMs: this.resolveMs('POLLING_QUOTE_REFRESH_MS', 10_000),
            statusPollMs: this.resolveMs('POLLING_STATUS_POLL_MS', 5_000),
            benchmarkAggregationMs: this.resolveMs('POLLING_BENCHMARK_AGGREGATION_MS', 60_000),
            staleTransactionCheckMs: this.resolveMs('POLLING_STALE_TRANSACTION_MS', 30_000),
        };
    }
    /**
     * Get a specific polling interval by key.
     */
    get(key) {
        return this.intervals[key];
    }
    /**
     * Get all intervals — useful for logging / diagnostics.
     */
    getAll() {
        return Object.freeze({ ...this.intervals });
    }
    // ---------------------------------------------------------------------------
    // Private helpers
    // ---------------------------------------------------------------------------
    resolveMs(envKey, defaultMs) {
        const raw = this.configService.get(envKey);
        if (!raw)
            return defaultMs;
        const parsed = parseInt(raw, 10);
        if (isNaN(parsed) || parsed <= 0) {
            return defaultMs;
        }
        return parsed;
    }
};
exports.PollingConfigService = PollingConfigService;
exports.PollingConfigService = PollingConfigService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PollingConfigService);
//# sourceMappingURL=polling-config.service.js.map