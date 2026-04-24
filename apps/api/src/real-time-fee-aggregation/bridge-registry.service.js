"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var BridgeRegistryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BridgeRegistryService = exports.BRIDGE_ADAPTERS = void 0;
const common_1 = require("@nestjs/common");
exports.BRIDGE_ADAPTERS = 'BRIDGE_ADAPTERS';
let BridgeRegistryService = BridgeRegistryService_1 = class BridgeRegistryService {
    constructor() {
        this.logger = new common_1.Logger(BridgeRegistryService_1.name);
        this.adapters = new Map();
    }
    register(adapter) {
        if (this.adapters.has(adapter.name)) {
            this.logger.warn(`Adapter "${adapter.name}" is already registered. Overwriting.`);
        }
        this.adapters.set(adapter.name, adapter);
        this.logger.log(`Registered bridge adapter: ${adapter.name}`);
    }
    listAdapters() {
        return Array.from(this.adapters.values());
    }
    getAdapter(name) {
        return this.adapters.get(name);
    }
    get count() {
        return this.adapters.size;
    }
};
exports.BridgeRegistryService = BridgeRegistryService;
exports.BridgeRegistryService = BridgeRegistryService = BridgeRegistryService_1 = __decorate([
    (0, common_1.Injectable)()
], BridgeRegistryService);
//# sourceMappingURL=bridge-registry.service.js.map