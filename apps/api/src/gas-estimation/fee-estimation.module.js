"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeeEstimationModule = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const fee_estimation_controller_1 = require("./fee-estimation.controller");
const fee_estimation_service_1 = require("./fee-estimation.service");
const token_service_1 = require("./token.service");
const stellar_adapter_1 = require("./adapters/stellar.adapter");
const layerzero_adapter_1 = require("./adapters/layerzero.adapter");
const hop_adapter_1 = require("./adapters/hop.adapter");
const audit_logger_service_1 = require("../common/logger/audit-logger.service");
let FeeEstimationModule = class FeeEstimationModule {
};
exports.FeeEstimationModule = FeeEstimationModule;
exports.FeeEstimationModule = FeeEstimationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            axios_1.HttpModule.register({
                timeout: 5000,
                maxRedirects: 5,
            }),
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
        ],
        controllers: [fee_estimation_controller_1.FeeEstimationController],
        providers: [
            fee_estimation_service_1.FeeEstimationService,
            token_service_1.TokenService,
            stellar_adapter_1.StellarAdapter,
            layerzero_adapter_1.LayerZeroAdapter,
            hop_adapter_1.HopAdapter,
            audit_logger_service_1.AuditLoggerService,
        ],
        exports: [fee_estimation_service_1.FeeEstimationService],
    })
], FeeEstimationModule);
//# sourceMappingURL=fee-estimation.module.js.map