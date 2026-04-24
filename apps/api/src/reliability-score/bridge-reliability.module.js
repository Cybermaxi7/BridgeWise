"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BridgeReliabilityModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const bridge_transaction_event_entity_1 = require("./bridge-transaction-event.entity");
const bridge_reliability_metric_entity_1 = require("./bridge-reliability-metric.entity");
const bridge_reliability_service_1 = require("./bridge-reliability.service");
const bridge_reliability_controller_1 = require("./bridge-reliability.controller");
const reliability_calculator_service_1 = require("./reliability-calculator.service");
let BridgeReliabilityModule = class BridgeReliabilityModule {
};
exports.BridgeReliabilityModule = BridgeReliabilityModule;
exports.BridgeReliabilityModule = BridgeReliabilityModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([bridge_transaction_event_entity_1.BridgeTransactionEvent, bridge_reliability_metric_entity_1.BridgeReliabilityMetric]),
        ],
        controllers: [bridge_reliability_controller_1.BridgeReliabilityController],
        providers: [bridge_reliability_service_1.BridgeReliabilityService, reliability_calculator_service_1.ReliabilityCalculatorService],
        exports: [bridge_reliability_service_1.BridgeReliabilityService, reliability_calculator_service_1.ReliabilityCalculatorService],
    })
], BridgeReliabilityModule);
//# sourceMappingURL=bridge-reliability.module.js.map