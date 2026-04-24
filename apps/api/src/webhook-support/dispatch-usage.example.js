"use strict";
/**
 * Usage Example — Dispatching webhook events from other BridgeWise services
 *
 * Drop this pattern into any service that wants to emit webhook events.
 * No circular dependency: WebhookModule exports WebhookService so any
 * feature module can import it freely.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GasAlertService = void 0;
const common_1 = require("@nestjs/common");
const index_1 = require("../index"); // adjust path
// ── Example: Gas alert service emitting webhook events ────────────────────────
let GasAlertService = class GasAlertService {
    constructor(
    // ... your other deps
    webhooks) {
        this.webhooks = webhooks;
    }
    async handleSpikeDetected(chainId, gweiValue) {
        // ... your existing logic
        // Fire & forget — webhook delivery is async via BullMQ
        await this.webhooks.dispatch({
            event: index_1.WebhookEvent.GAS_SPIKE_DETECTED,
            data: {
                chainId,
                gweiValue,
                detectedAt: new Date().toISOString(),
            },
        });
    }
    async handleGasNormalized(chainId, gweiValue) {
        // ... your existing logic
        await this.webhooks.dispatch({
            event: index_1.WebhookEvent.GAS_NORMALIZED,
            data: { chainId, gweiValue },
        });
    }
};
exports.GasAlertService = GasAlertService;
exports.GasAlertService = GasAlertService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof index_1.WebhookService !== "undefined" && index_1.WebhookService) === "function" ? _a : Object])
], GasAlertService);
// ── AppModule wiring ──────────────────────────────────────────────────────────
//
// In your AppModule (or the feature module):
//
// @Module({
//   imports: [
//     WebhookModule,         // <-- add this
//     GasAlertModule,
//     BullModule.forRootAsync({
//       useFactory: (config: ConfigService) => ({
//         connection: {
//           host: config.get('REDIS_HOST', 'localhost'),
//           port: config.get<number>('REDIS_PORT', 6379),
//         },
//       }),
//       inject: [ConfigService],
//     }),
//   ],
// })
// export class AppModule {}
// ── Required environment variables ───────────────────────────────────────────
//
// REDIS_HOST=localhost
// REDIS_PORT=6379
// WEBHOOK_ADMIN_SECRET=<min 32 random chars>   # guards POST /webhooks/dispatch
//# sourceMappingURL=dispatch-usage.example.js.map