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
exports.HttpBridgeAdapter = void 0;
const bridge_decorators_1 = require("./bridge.decorators");
let HttpBridgeAdapter = class HttpBridgeAdapter {
    constructor(config = {}) {
        this.config = config;
        this.name = 'http-bridge';
        this.version = '1.0.0';
        this.capabilities = [
            { name: 'http', version: '1.0.0', description: 'HTTP request execution' },
            { name: 'rest', version: '1.0.0', description: 'REST API calls' },
        ];
        this.baseUrl = '';
        this.initialized = false;
    }
    async initialize(config) {
        const merged = { ...this.config, ...(config ?? {}) };
        this.baseUrl = merged['baseUrl'] ?? 'http://localhost';
        this.initialized = true;
    }
    async isHealthy() {
        return this.initialized;
    }
    async shutdown() {
        this.initialized = false;
    }
    async execute(operation, payload) {
        if (!this.initialized)
            throw new Error('HttpBridgeAdapter not initialized');
        // Simulated execution — replace with actual HTTP client logic
        return {
            operation,
            payload,
            baseUrl: this.baseUrl,
            bridge: this.name,
        };
    }
};
exports.HttpBridgeAdapter = HttpBridgeAdapter;
exports.HttpBridgeAdapter = HttpBridgeAdapter = __decorate([
    (0, bridge_decorators_1.BridgePlugin)({ name: 'http-bridge', version: '1.0.0' }),
    __metadata("design:paramtypes", [Object])
], HttpBridgeAdapter);
//# sourceMappingURL=http-bridge.adapter.js.map