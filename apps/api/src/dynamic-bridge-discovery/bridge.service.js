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
exports.BridgeService = void 0;
const common_1 = require("@nestjs/common");
const bridge_registry_1 = require("./bridge.registry");
const bridge_loader_1 = require("./bridge.loader");
let BridgeService = class BridgeService {
    constructor(registry, loader) {
        this.registry = registry;
        this.loader = loader;
    }
    /**
     * Execute an operation on a named bridge.
     */
    async execute(bridgeName, operation, payload) {
        const adapter = this.registry.get(bridgeName);
        return adapter.execute(operation, payload);
    }
    /**
     * Execute an operation on all bridges with a given capability.
     */
    async executeByCapability(capability, operation, payload) {
        const adapters = this.registry.getByCapability(capability);
        return Promise.all(adapters.map((a) => a.execute(operation, payload)));
    }
    /**
     * Register a bridge adapter at runtime (plugin injection).
     */
    async registerBridge(adapter, options) {
        await this.loader.registerAdapter(adapter, options);
    }
    /**
     * Load a bridge from a file path at runtime.
     */
    async loadBridgeFromFile(filePath) {
        return this.loader.loadAdapterFromFile(filePath);
    }
    /**
     * Check if a bridge is available.
     */
    hasBridge(name) {
        return this.registry.has(name);
    }
    /**
     * List all registered bridge names.
     */
    listBridges() {
        return this.registry.list();
    }
    /**
     * Get a bridge adapter directly.
     */
    getBridge(name) {
        return this.registry.get(name);
    }
    /**
     * Attempt to get a bridge without throwing.
     */
    tryGetBridge(name) {
        return this.registry.tryGet(name);
    }
    /**
     * Health check for all registered bridges.
     */
    async healthCheck() {
        const results = {};
        for (const name of this.registry.list()) {
            try {
                results[name] = await this.registry.get(name).isHealthy();
            }
            catch {
                results[name] = false;
            }
        }
        return results;
    }
    /**
     * Gracefully shutdown all bridge adapters.
     */
    async shutdownAll() {
        for (const name of this.registry.list()) {
            try {
                await this.registry.get(name).shutdown();
            }
            catch {
                // best-effort shutdown
            }
        }
    }
};
exports.BridgeService = BridgeService;
exports.BridgeService = BridgeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [bridge_registry_1.BridgeRegistry,
        bridge_loader_1.BridgeLoader])
], BridgeService);
//# sourceMappingURL=bridge.service.js.map