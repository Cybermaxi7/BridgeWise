"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DemoBridgeAdapter = void 0;
const bridge_decorators_1 = require("./bridge.decorators");
let DemoBridgeAdapter = class DemoBridgeAdapter {
    constructor() {
        this.name = 'demo-bridge';
        this.version = '0.1.0';
        this.capabilities = [
            { name: 'demo', version: '1.0.0', description: 'Demo bridge for plugin architecture' },
        ];
        this.initialized = false;
    }
    async initialize(config) {
        this.initialized = true;
    }
    async isHealthy() {
        return this.initialized;
    }
    async shutdown() {
        this.initialized = false;
    }
    async execute(operation, payload) {
        if (!this.initialized) {
            throw new Error('DemoBridgeAdapter not initialized');
        }
        return {
            operation,
            payload,
            handledBy: this.name,
        };
    }
};
exports.DemoBridgeAdapter = DemoBridgeAdapter;
exports.DemoBridgeAdapter = DemoBridgeAdapter = __decorate([
    (0, bridge_decorators_1.BridgePlugin)({ name: 'demo-bridge', version: '0.1.0' })
], DemoBridgeAdapter);
//# sourceMappingURL=demo-bridge.adapter.js.map