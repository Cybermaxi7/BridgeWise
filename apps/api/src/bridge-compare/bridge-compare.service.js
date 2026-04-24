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
var BridgeCompareService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BridgeCompareService = void 0;
const common_1 = require("@nestjs/common");
const aggregation_service_1 = require("./aggregation.service");
const slippage_service_1 = require("./slippage.service");
const reliability_service_1 = require("./reliability.service");
const ranking_service_1 = require("./ranking.service");
const failure_risk_service_1 = require("./failure-risk.service");
const quote_cache_service_1 = require("./quote-cache.service");
const bridge_status_service_1 = require("./bridge-status.service");
const enums_1 = require("./enums");
let BridgeCompareService = BridgeCompareService_1 = class BridgeCompareService {
    constructor(aggregationService, slippageService, reliabilityService, rankingService, failureRiskService, quoteCacheService, bridgeStatusService) {
        this.aggregationService = aggregationService;
        this.slippageService = slippageService;
        this.reliabilityService = reliabilityService;
        this.rankingService = rankingService;
        this.failureRiskService = failureRiskService;
        this.quoteCacheService = quoteCacheService;
        this.bridgeStatusService = bridgeStatusService;
        this.logger = new common_1.Logger(BridgeCompareService_1.name);
    }
    /**
     * Get all normalized, ranked quotes for a bridge request.
     */
    async getQuotes(dto) {
        const startTime = Date.now();
        const params = {
            sourceChain: dto.sourceChain,
            destinationChain: dto.destinationChain,
            sourceToken: dto.sourceToken,
            destinationToken: dto.destinationToken ?? dto.sourceToken,
            amount: dto.amount,
            rankingMode: dto.rankingMode ?? enums_1.RankingMode.BALANCED,
            slippageTolerance: dto.slippageTolerance,
        };
        this.logger.log(`Getting quotes: ${dto.sourceToken} ${dto.sourceChain}→${dto.destinationChain} ` +
            `amount=${dto.amount} mode=${params.rankingMode}`);
        const cacheKey = this.quoteCacheService.buildKey(params);
        const cached = this.quoteCacheService.get(cacheKey);
        if (cached) {
            this.logger.log(`Returning cached quotes for key: ${cacheKey}`);
            return cached;
        }
        const { quotes: rawQuotes, failedProviders } = await this.aggregationService.fetchRawQuotes(params);
        // Filter out quotes from offline bridges
        const availableQuotes = rawQuotes.filter((quote) => !this.bridgeStatusService.isOffline(quote.bridgeId));
        if (availableQuotes.length === 0 && rawQuotes.length > 0) {
            this.logger.warn(`All bridge quotes are offline. Total providers: ${rawQuotes.length}`);
        }
        const slippageMap = this.slippageService.batchEstimateSlippage(availableQuotes, dto.sourceToken, dto.sourceChain, dto.amount);
        const bridgeIds = availableQuotes.map((q) => q.bridgeId);
        const reliabilityMap = this.reliabilityService.batchCalculateScores(bridgeIds);
        const metricsMap = this.reliabilityService.batchGetMetrics(bridgeIds);
        const normalizedQuotes = availableQuotes.map((raw) => this.normalizeQuote(raw, params, slippageMap, reliabilityMap, metricsMap));
        const rankedQuotes = this.rankingService.rankQuotes(normalizedQuotes, params.rankingMode);
        const bestRoute = rankedQuotes[0];
        if (!bestRoute) {
            throw new common_1.NotFoundException('No valid routes found for the requested pair. Available bridges may be offline.');
        }
        const offlineBridgesCount = rawQuotes.length - availableQuotes.length;
        const response = {
            quotes: rankedQuotes,
            bestRoute,
            rankingMode: params.rankingMode,
            requestParams: params,
            totalProviders: rawQuotes.length + failedProviders,
            successfulProviders: availableQuotes.length,
            fetchDurationMs: Date.now() - startTime,
            cacheHit: false,
            offlineBridgesCount,
        };
        this.quoteCacheService.set(cacheKey, { ...response, cacheHit: true, cachedAt: new Date() });
        this.logger.log(`Returned ${rankedQuotes.length} quotes in ${response.fetchDurationMs}ms. ` +
            `Best: ${bestRoute.bridgeName} score=${bestRoute.compositeScore}`);
        return response;
    }
    /**
     * Get a specific route's full details by bridgeId.
     */
    async getRouteDetails(dto, bridgeId) {
        const response = await this.getQuotes(dto);
        const route = response.quotes.find((q) => q.bridgeId === bridgeId);
        if (!route) {
            throw new common_1.NotFoundException(`Route not found for bridge: ${bridgeId}`);
        }
        return route;
    }
    /**
     * Get list of all supported bridges.
     */
    getSupportedBridges() {
        return this.aggregationService.getAllProviders();
    }
    // ---------------------------------------------------------------------------
    // Private helpers
    // ---------------------------------------------------------------------------
    normalizeQuote(raw, params, slippageMap, reliabilityMap, metricsMap) {
        const totalFeeUsd = raw.feesUsd + raw.gasCostUsd;
        const slippage = slippageMap.get(raw.bridgeId);
        const slippagePercent = slippage?.expectedSlippage ?? 0;
        const reliabilityScore = reliabilityMap.get(raw.bridgeId) ?? 70;
        const bridgeStatus = this.aggregationService.getBridgeStatus(raw.bridgeId);
        const metrics = metricsMap.get(raw.bridgeId);
        const { failureRisk, riskFactors } = this.failureRiskService.assessRisk(reliabilityScore, metrics, slippagePercent, bridgeStatus);
        return {
            bridgeId: raw.bridgeId,
            bridgeName: raw.bridgeName,
            sourceChain: params.sourceChain,
            destinationChain: params.destinationChain,
            sourceToken: params.sourceToken,
            destinationToken: params.destinationToken ?? params.sourceToken,
            inputAmount: params.amount,
            outputAmount: parseFloat(raw.outputAmount.toFixed(6)),
            totalFeeUsd: parseFloat(totalFeeUsd.toFixed(4)),
            estimatedTimeSeconds: raw.estimatedTimeSeconds,
            slippagePercent,
            reliabilityScore,
            compositeScore: 0, // assigned by RankingService
            confidenceScore: 0, // assigned by RankingService
            confidenceLevel: 'low', // assigned by RankingService
            failureRisk,
            riskFactors,
            rankingPosition: 0, // assigned by RankingService
            bridgeStatus,
            metadata: {
                feesBreakdown: { protocolFee: raw.feesUsd, gasFee: raw.gasCostUsd },
                steps: raw.steps,
            },
            fetchedAt: new Date(),
        };
    }
};
exports.BridgeCompareService = BridgeCompareService;
exports.BridgeCompareService = BridgeCompareService = BridgeCompareService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [aggregation_service_1.AggregationService,
        slippage_service_1.SlippageService,
        reliability_service_1.ReliabilityService,
        ranking_service_1.RankingService,
        failure_risk_service_1.FailureRiskService,
        quote_cache_service_1.QuoteCacheService,
        bridge_status_service_1.BridgeStatusService])
], BridgeCompareService);
//# sourceMappingURL=bridge-compare.service.js.map