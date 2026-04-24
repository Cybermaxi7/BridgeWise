"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BridgeCompareModule = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const bridge_compare_controller_1 = require("./bridge-compare.controller");
const bridge_compare_service_1 = require("./bridge-compare.service");
const bridge_status_service_1 = require("./bridge-status.service");
const aggregation_service_1 = require("./aggregation.service");
const slippage_service_1 = require("./slippage.service");
const reliability_service_1 = require("./reliability.service");
const ranking_service_1 = require("./ranking.service");
const failure_risk_service_1 = require("./failure-risk.service");
const quote_cache_service_1 = require("./quote-cache.service");
let BridgeCompareModule = class BridgeCompareModule {
};
exports.BridgeCompareModule = BridgeCompareModule;
exports.BridgeCompareModule = BridgeCompareModule = __decorate([
    (0, common_1.Module)({
        imports: [axios_1.HttpModule],
        controllers: [bridge_compare_controller_1.BridgeCompareController],
        providers: [
            bridge_compare_service_1.BridgeCompareService,
            bridge_status_service_1.BridgeStatusService,
            aggregation_service_1.AggregationService,
            slippage_service_1.SlippageService,
            reliability_service_1.ReliabilityService,
            ranking_service_1.RankingService,
            failure_risk_service_1.FailureRiskService,
            quote_cache_service_1.QuoteCacheService,
        ],
        exports: [bridge_compare_service_1.BridgeCompareService, bridge_status_service_1.BridgeStatusService],
    })
], BridgeCompareModule);
//# sourceMappingURL=bridge-compare.module.js.map