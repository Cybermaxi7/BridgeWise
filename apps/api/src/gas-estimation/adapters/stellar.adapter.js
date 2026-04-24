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
var StellarAdapter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StellarAdapter = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
let StellarAdapter = StellarAdapter_1 = class StellarAdapter {
    constructor(httpService, configService) {
        this.httpService = httpService;
        this.configService = configService;
        this.logger = new common_1.Logger(StellarAdapter_1.name);
        this.baseUrl = this.configService.get('STELLAR_API_URL', 'https://horizon.stellar.org');
        this.timeoutMs = this.configService.get('ADAPTER_TIMEOUT', 5000);
        this.retryAttempts = this.configService.get('ADAPTER_RETRY', 3);
    }
    async getFees() {
        for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
            try {
                const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/fee_stats`).pipe((0, rxjs_1.timeout)(this.timeoutMs), (0, rxjs_1.catchError)((error) => {
                    this.logger.error(`Stellar API error (attempt ${attempt}/${this.retryAttempts}):`, error.message);
                    throw error;
                })));
                return this.transformResponse(response.data);
            }
            catch (error) {
                if (attempt === this.retryAttempts) {
                    throw new Error(`Stellar provider unavailable after ${this.retryAttempts} attempts: ${error.message}`);
                }
                // Exponential backoff
                await this.delay(Math.pow(2, attempt) * 100);
            }
        }
        throw new Error('Stellar provider unavailable');
    }
    transformResponse(data) {
        // Stellar returns fees in stroops (1 XLM = 10,000,000 stroops)
        return {
            min: data.min_accepted_fee || '100',
            mode: data.mode_accepted_fee || '100',
            p10: data.p10_accepted_fee || '100',
            p20: data.p20_accepted_fee || '100',
            p30: data.p30_accepted_fee || '100',
            p40: data.p40_accepted_fee || '100',
            p50: data.p50_accepted_fee || '100',
            p60: data.p60_accepted_fee || '100',
            p70: data.p70_accepted_fee || '100',
            p80: data.p80_accepted_fee || '100',
            p90: data.p90_accepted_fee || '100',
            p95: data.p95_accepted_fee || '100',
            p99: data.p99_accepted_fee || '100',
            decimals: 7, // Stellar uses 7 decimal places (stroops)
            symbol: 'XLM',
        };
    }
    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
};
exports.StellarAdapter = StellarAdapter;
exports.StellarAdapter = StellarAdapter = StellarAdapter_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService])
], StellarAdapter);
//# sourceMappingURL=stellar.adapter.js.map