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
exports.FeatureFlagsService = void 0;
const common_1 = require("@nestjs/common");
const environment_config_service_1 = require("../config/environment-config.service");
/**
 * Feature Flags Service
 *
 * Central service for reading feature-flag state at runtime.
 * Flags are sourced from environment variables and are therefore
 * configurable per deployment without a code change or redeploy
 * (a process restart is required to pick up env-var changes).
 */
let FeatureFlagsService = class FeatureFlagsService {
    constructor(environmentConfigService) {
        this.environmentConfigService = environmentConfigService;
    }
    /**
     * Returns all feature flags and their current enabled/disabled state.
     */
    getAll() {
        return this.environmentConfigService.getFeatures();
    }
    /**
     * Returns true when the given flag is enabled, false otherwise.
     */
    isEnabled(flag) {
        return this.environmentConfigService.isFeatureEnabled(flag);
    }
    /**
     * Returns true when the given flag is disabled.
     */
    isDisabled(flag) {
        return !this.isEnabled(flag);
    }
};
exports.FeatureFlagsService = FeatureFlagsService;
exports.FeatureFlagsService = FeatureFlagsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [environment_config_service_1.EnvironmentConfigService])
], FeatureFlagsService);
//# sourceMappingURL=feature-flags.service.js.map