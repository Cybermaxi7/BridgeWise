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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeeAggregationModule = void 0;
const common_1 = require("@nestjs/common");
const bridge_registry_service_1 = require("./bridge-registry.service");
const fee_aggregation_service_1 = require("./fee-aggregation.service");
const quote_scoring_service_1 = require("./quote-scoring.service");
const quotes_controller_1 = require("./quotes.controller");
const bridge_adapters_1 = require("./adapters/bridge.adapters");
let FeeAggregationModule = class FeeAggregationModule {
    constructor(registry, across, hop, stargate) {
        this.registry = registry;
        this.across = across;
        this.hop = hop;
        this.stargate = stargate;
    }
    onModuleInit() {
        this.registry.register(this.across);
        this.registry.register(this.hop);
        this.registry.register(this.stargate);
    }
};
exports.FeeAggregationModule = FeeAggregationModule;
exports.FeeAggregationModule = FeeAggregationModule = __decorate([
    (0, common_1.Module)({
        controllers: [quotes_controller_1.QuotesController],
        providers: [
            bridge_registry_service_1.BridgeRegistryService,
            fee_aggregation_service_1.FeeAggregationService,
            quote_scoring_service_1.QuoteScoringService,
            // Bridge adapters
            bridge_adapters_1.AcrossAdapter,
            bridge_adapters_1.HopAdapter,
            bridge_adapters_1.StargateAdapter,
        ],
        exports: [fee_aggregation_service_1.FeeAggregationService, bridge_registry_service_1.BridgeRegistryService],
    }),
    __metadata("design:paramtypes", [bridge_registry_service_1.BridgeRegistryService, typeof (_a = typeof bridge_adapters_1.AcrossAdapter !== "undefined" && bridge_adapters_1.AcrossAdapter) === "function" ? _a : Object, typeof (_b = typeof bridge_adapters_1.HopAdapter !== "undefined" && bridge_adapters_1.HopAdapter) === "function" ? _b : Object, typeof (_c = typeof bridge_adapters_1.StargateAdapter !== "undefined" && bridge_adapters_1.StargateAdapter) === "function" ? _c : Object])
], FeeAggregationModule);
//# sourceMappingURL=fee-aggregation.module.js.map