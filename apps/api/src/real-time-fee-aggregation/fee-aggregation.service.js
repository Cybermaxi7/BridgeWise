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
var FeeAggregationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeeAggregationService = exports.QUOTE_TIMEOUT_MS = void 0;
const common_1 = require("@nestjs/common");
const bridge_registry_service_1 = require("./bridge-registry.service");
const quote_scoring_service_1 = require("./quote-scoring.service");
exports.QUOTE_TIMEOUT_MS = 10_000;
let FeeAggregationService = FeeAggregationService_1 = class FeeAggregationService {
    constructor(registry, scoring) {
        this.registry = registry;
        this.scoring = scoring;
        this.logger = new common_1.Logger(FeeAggregationService_1.name);
    }
    async compareQuotes(request, rankBy = 'score') {
        const adapters = this.registry.listAdapters();
        if (adapters.length === 0) {
            this.logger.warn('No bridge adapters registered');
        }
        const quotes = await this.fetchAllQuotes(adapters, request);
        const ranked = this.scoring.scoreAndRank(quotes, rankBy);
        return {
            fromChain: request.fromChain,
            toChain: request.toChain,
            token: request.token,
            amount: request.amount,
            fetchedAt: new Date().toISOString(),
            quotes: ranked,
        };
    }
    async fetchAllQuotes(adapters, request) {
        const results = await Promise.allSettled(adapters.map((adapter) => this.fetchSingleQuote(adapter, request)));
        return results.map((result, index) => {
            if (result.status === 'fulfilled') {
                return result.value;
            }
            const adapterName = adapters[index].name;
            this.logger.error(`Failed to fetch quote from "${adapterName}": ${result.reason?.message}`);
            return {
                bridgeName: adapterName,
                totalFeeUSD: 0,
                feeToken: '',
                estimatedArrivalTime: 0,
                outputAmount: '0',
                supported: false,
                error: result.reason?.message ?? 'Unknown error',
            };
        });
    }
    async fetchSingleQuote(adapter, request) {
        // Check route support before querying
        if (!adapter.supportsRoute(request.fromChain, request.toChain, request.token)) {
            return {
                bridgeName: adapter.name,
                totalFeeUSD: 0,
                feeToken: request.token,
                estimatedArrivalTime: 0,
                outputAmount: '0',
                supported: false,
                error: `Route ${request.fromChain}→${request.toChain} not supported for ${request.token}`,
            };
        }
        return Promise.race([
            adapter.getQuote(request),
            this.timeoutReject(adapter.name),
        ]);
    }
    timeoutReject(adapterName) {
        return new Promise((_, reject) => setTimeout(() => reject(new Error(`Timeout fetching quote from "${adapterName}" after ${exports.QUOTE_TIMEOUT_MS}ms`)), exports.QUOTE_TIMEOUT_MS));
    }
};
exports.FeeAggregationService = FeeAggregationService;
exports.FeeAggregationService = FeeAggregationService = FeeAggregationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [bridge_registry_service_1.BridgeRegistryService,
        quote_scoring_service_1.QuoteScoringService])
], FeeAggregationService);
//# sourceMappingURL=fee-aggregation.service.js.map