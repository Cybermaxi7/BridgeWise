"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var BridgeRegistry_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BridgeRegistry = void 0;
const common_1 = require("@nestjs/common");
const bridge_exceptions_1 = require("./bridge.exceptions");
let BridgeRegistry = BridgeRegistry_1 = class BridgeRegistry {
    constructor() {
        this.logger = new common_1.Logger(BridgeRegistry_1.name);
        this.adapters = new Map();
        this.allowOverwrite = false;
    }
    setOverwriteMode(allow) {
        this.allowOverwrite = allow;
    }
    /**
     * Register a bridge adapter.
     * Throws BridgeDuplicateException if already registered and allowOverwrite=false.
     */
    register(adapter, metadata) {
        if (this.adapters.has(adapter.name) && !this.allowOverwrite) {
            throw new bridge_exceptions_1.BridgeDuplicateException(adapter.name);
        }
        if (this.adapters.has(adapter.name)) {
            this.logger.warn(`Overwriting bridge adapter: "${adapter.name}"`);
        }
        this.adapters.set(adapter.name, {
            adapter,
            registeredAt: new Date(),
            metadata,
        });
        this.logger.log(`Registered bridge adapter: "${adapter.name}" v${adapter.version}`);
    }
    /**
     * Resolve a bridge by name.
     * Throws BridgeNotFoundException if not found.
     */
    get(name) {
        const entry = this.adapters.get(name);
        if (!entry) {
            throw new bridge_exceptions_1.BridgeNotFoundException(name);
        }
        return entry.adapter;
    }
    /**
     * Try to resolve a bridge by name without throwing.
     */
    tryGet(name) {
        return this.adapters.get(name)?.adapter;
    }
    /**
     * Resolve all bridges that have a given capability.
     */
    getByCapability(capabilityName) {
        const matches = Array.from(this.adapters.values())
            .map((entry) => entry.adapter)
            .filter((adapter) => adapter.capabilities.some((cap) => cap.name === capabilityName));
        if (matches.length === 0) {
            throw new bridge_exceptions_1.BridgeCapabilityNotFoundException(capabilityName);
        }
        return matches;
    }
    /**
     * List all registered bridge names.
     */
    list() {
        return Array.from(this.adapters.keys());
    }
    /**
     * List full registry entries with metadata.
     */
    listEntries() {
        return Array.from(this.adapters.values());
    }
    /**
     * Check whether a bridge is registered.
     */
    has(name) {
        return this.adapters.has(name);
    }
    /**
     * Unregister a bridge by name.
     */
    unregister(name) {
        const removed = this.adapters.delete(name);
        if (removed) {
            this.logger.log(`Unregistered bridge adapter: "${name}"`);
        }
        return removed;
    }
    /**
     * Clear all registered adapters.
     */
    clear() {
        this.adapters.clear();
        this.logger.log('Cleared all bridge adapters from registry');
    }
    /**
     * Return count of registered bridges.
     */
    get size() {
        return this.adapters.size;
    }
};
exports.BridgeRegistry = BridgeRegistry;
exports.BridgeRegistry = BridgeRegistry = BridgeRegistry_1 = __decorate([
    (0, common_1.Injectable)()
], BridgeRegistry);
//# sourceMappingURL=bridge.registry.js.map