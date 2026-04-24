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
exports.EnvironmentConfigService = void 0;
const common_1 = require("@nestjs/common");
const config_factory_1 = require("./config-factory");
/**
 * Application Configuration Service
 * Provides access to application configuration loaded from environment variables
 * Supports environment-based configuration (development, staging, production)
 */
let EnvironmentConfigService = class EnvironmentConfigService {
    constructor() {
        this.appConfig = config_factory_1.ConfigFactory.create();
    }
    /**
     * Get entire application configuration
     */
    getConfig() {
        return this.appConfig;
    }
    /**
     * Get configuration for a specific section
     */
    getSection(key) {
        return this.appConfig[key];
    }
    /**
     * Get database configuration
     */
    getDatabaseConfig() {
        return this.appConfig.database;
    }
    /**
     * Get RPC configuration
     */
    getRpcConfig() {
        return this.appConfig.rpc;
    }
    /**
     * Get server configuration
     */
    getServerConfig() {
        return this.appConfig.server;
    }
    /**
     * Get API configuration
     */
    getApiConfig() {
        return this.appConfig.api;
    }
    /**
     * Get logging configuration
     */
    getLoggingConfig() {
        return this.appConfig.logging;
    }
    /**
     * Get feature flags configuration
     */
    getFeatures() {
        return this.appConfig.features;
    }
    /**
     * Check if specific feature is enabled
     */
    isFeatureEnabled(featureName) {
        return this.appConfig.features[featureName];
    }
    /**
     * Get RPC URL for a specific network
     */
    getRpcUrl(network) {
        return this.appConfig.rpc[network];
    }
    /**
     * Check if running in production
     */
    isProduction() {
        return this.appConfig.nodeEnv === 'production';
    }
    /**
     * Check if running in staging
     */
    isStaging() {
        return this.appConfig.nodeEnv === 'staging';
    }
    /**
     * Check if running in development
     */
    isDevelopment() {
        return this.appConfig.nodeEnv === 'development';
    }
    /**
     * Get current environment
     */
    getEnvironment() {
        return this.appConfig.nodeEnv;
    }
};
exports.EnvironmentConfigService = EnvironmentConfigService;
exports.EnvironmentConfigService = EnvironmentConfigService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], EnvironmentConfigService);
//# sourceMappingURL=environment-config.service.js.map