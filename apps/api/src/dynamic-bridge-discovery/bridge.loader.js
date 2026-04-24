"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var BridgeLoader_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BridgeLoader = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const bridge_registry_1 = require("./bridge.registry");
const bridge_exceptions_1 = require("./bridge.exceptions");
const bridge_decorators_1 = require("./bridge.decorators");
let BridgeLoader = BridgeLoader_1 = class BridgeLoader {
    constructor(registry, config) {
        this.registry = registry;
        this.config = config;
        this.logger = new common_1.Logger(BridgeLoader_1.name);
    }
    async onModuleInit() {
        this.registry.setOverwriteMode(this.config.allowOverwrite ?? false);
        if (this.config.autoDiscover && this.config.bridgesDirectory) {
            await this.loadFromDirectory(this.config.bridgesDirectory);
        }
        if (this.config.bridges) {
            await this.loadFromConfig(this.config.bridges);
        }
    }
    /**
     * Scan a directory for bridge adapter modules and auto-register them.
     */
    async loadFromDirectory(directory) {
        const resolvedDir = path.isAbsolute(directory)
            ? directory
            : path.join(process.cwd(), directory);
        if (!fs.existsSync(resolvedDir)) {
            this.logger.warn(`Bridge directory not found: "${resolvedDir}". Skipping auto-discovery.`);
            return;
        }
        const files = fs
            .readdirSync(resolvedDir)
            .filter((f) => (f.endsWith('.adapter.ts') || f.endsWith('.adapter.js')) &&
            !f.endsWith('.spec.ts'));
        this.logger.log(`Discovered ${files.length} bridge file(s) in "${resolvedDir}"`);
        for (const file of files) {
            const filePath = path.join(resolvedDir, file);
            await this.loadAdapterFromFile(filePath);
        }
    }
    /**
     * Load a single bridge adapter from a file path.
     */
    async loadAdapterFromFile(filePath) {
        try {
            const mod = await Promise.resolve(`${filePath}`).then(s => __importStar(require(s)));
            const AdapterClass = this.extractAdapterClass(mod);
            if (!AdapterClass) {
                this.logger.warn(`No valid BridgeAdapter export found in "${filePath}". Skipping.`);
                return null;
            }
            const instance = await this.createAndRegisterAdapter(AdapterClass, filePath);
            return instance;
        }
        catch (err) {
            throw new bridge_exceptions_1.BridgeLoadException(filePath, err);
        }
    }
    /**
     * Load bridges defined in the configuration object.
     */
    async loadFromConfig(bridgesConfig) {
        if (!bridgesConfig)
            return;
        for (const [name, adapterConfig] of Object.entries(bridgesConfig)) {
            if (adapterConfig.enabled === false) {
                this.logger.log(`Bridge "${name}" is disabled via config. Skipping.`);
                continue;
            }
            if (!adapterConfig.modulePath) {
                this.logger.warn(`Bridge "${name}" has no modulePath. Skipping.`);
                continue;
            }
            const resolvedPath = path.isAbsolute(adapterConfig.modulePath)
                ? adapterConfig.modulePath
                : path.join(process.cwd(), adapterConfig.modulePath);
            try {
                const mod = await Promise.resolve(`${resolvedPath}`).then(s => __importStar(require(s)));
                const AdapterClass = this.extractAdapterClass(mod);
                if (!AdapterClass) {
                    this.logger.warn(`No valid BridgeAdapter export found for "${name}". Skipping.`);
                    continue;
                }
                await this.createAndRegisterAdapter(AdapterClass, resolvedPath, adapterConfig.options ?? {}, name);
            }
            catch (err) {
                throw new bridge_exceptions_1.BridgeLoadException(resolvedPath, err);
            }
        }
    }
    /**
     * Programmatically register a pre-instantiated adapter at runtime.
     */
    async registerAdapter(adapter, options) {
        await this.initializeAdapter(adapter);
        this.registry.register(adapter, {
            ...options,
            source: 'runtime-injection',
        });
    }
    // ─── Private helpers ────────────────────────────────────────────────────────
    extractAdapterClass(mod) {
        // Check default export
        if (mod.default && this.isAdapterClass(mod.default)) {
            return mod.default;
        }
        // Check named exports
        for (const key of Object.keys(mod)) {
            if (this.isAdapterClass(mod[key])) {
                return mod[key];
            }
        }
        return null;
    }
    isAdapterClass(value) {
        if (typeof value !== 'function')
            return false;
        // Check for @BridgePlugin decorator metadata
        if (Reflect.hasMetadata(bridge_decorators_1.BRIDGE_ADAPTER_METADATA, value))
            return true;
        // Duck-type check: prototype must have required BridgeAdapter methods
        const proto = value.prototype;
        if (!proto)
            return false;
        return (typeof proto['initialize'] === 'function' &&
            typeof proto['execute'] === 'function' &&
            typeof proto['isHealthy'] === 'function' &&
            typeof proto['shutdown'] === 'function');
    }
    async initializeAdapter(adapter) {
        try {
            await adapter.initialize(this.config.globalConfig);
            this.logger.log(`Initialized bridge adapter: "${adapter.name}"`);
        }
        catch (err) {
            throw new bridge_exceptions_1.BridgeInitializationException(adapter.name, err);
        }
    }
};
exports.BridgeLoader = BridgeLoader;
exports.BridgeLoader = BridgeLoader = BridgeLoader_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [bridge_registry_1.BridgeRegistry, Object])
], BridgeLoader);
//# sourceMappingURL=bridge.loader.js.map