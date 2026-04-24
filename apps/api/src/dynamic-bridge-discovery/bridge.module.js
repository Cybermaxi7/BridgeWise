"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var BridgeModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BridgeModule = void 0;
const common_1 = require("@nestjs/common");
const bridge_tokens_1 = require("./bridge.tokens");
const bridge_registry_1 = require("./bridge.registry");
const bridge_loader_1 = require("./bridge.loader");
const bridge_service_1 = require("./bridge.service");
let BridgeModule = BridgeModule_1 = class BridgeModule {
    /**
     * Register the BridgeModule synchronously with a static config.
     */
    static forRoot(config = {}) {
        return {
            module: BridgeModule_1,
            global: true,
            providers: [
                {
                    provide: bridge_tokens_1.BRIDGE_MODULE_CONFIG,
                    useValue: config,
                },
                bridge_registry_1.BridgeRegistry,
                {
                    provide: bridge_loader_1.BridgeLoader,
                    useFactory: (registry) => new bridge_loader_1.BridgeLoader(registry, config),
                    inject: [bridge_registry_1.BridgeRegistry],
                },
                bridge_service_1.BridgeService,
            ],
            exports: [bridge_registry_1.BridgeRegistry, bridge_service_1.BridgeService, bridge_loader_1.BridgeLoader],
        };
    }
    /**
     * Register the BridgeModule asynchronously (e.g., reading config from ConfigService).
     */
    static forRootAsync(options) {
        const configProvider = {
            provide: bridge_tokens_1.BRIDGE_MODULE_CONFIG,
            useFactory: options.useFactory,
            inject: options.inject ?? [],
        };
        const loaderProvider = {
            provide: bridge_loader_1.BridgeLoader,
            useFactory: (registry, config) => new bridge_loader_1.BridgeLoader(registry, config),
            inject: [bridge_registry_1.BridgeRegistry, bridge_tokens_1.BRIDGE_MODULE_CONFIG],
        };
        return {
            module: BridgeModule_1,
            global: true,
            imports: options.imports ?? [],
            providers: [
                configProvider,
                bridge_registry_1.BridgeRegistry,
                loaderProvider,
                bridge_service_1.BridgeService,
                ...(options.extraProviders ?? []),
            ],
            exports: [bridge_registry_1.BridgeRegistry, bridge_service_1.BridgeService, bridge_loader_1.BridgeLoader],
        };
    }
    /**
     * Register a feature module that injects additional bridge adapters.
     * Use this inside feature modules to register bridges without modifying core.
     */
    static forFeature(adapters) {
        return {
            module: BridgeModule_1,
            providers: adapters,
            exports: adapters,
        };
    }
};
exports.BridgeModule = BridgeModule;
exports.BridgeModule = BridgeModule = BridgeModule_1 = __decorate([
    (0, common_1.Module)({})
], BridgeModule);
//# sourceMappingURL=bridge.module.js.map