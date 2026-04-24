"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeatureFlagsModule = void 0;
const common_1 = require("@nestjs/common");
const config_module_1 = require("../config/config.module");
const feature_flags_controller_1 = require("./feature-flags.controller");
const feature_flags_service_1 = require("./feature-flags.service");
const feature_flag_guard_1 = require("./feature-flag.guard");
/**
 * Feature Flags Module
 *
 * Provides:
 *  - FeatureFlagsService  — check flag state from any service/guard/controller
 *  - FeatureFlagGuard     — route-level guard triggered by @RequireFeature()
 *  - GET /feature-flags   — list all flags
 *  - GET /feature-flags/:flag — get a single flag state
 *
 * Import this module wherever feature-flag checks are needed, or add it to
 * AppModule for global availability.
 */
let FeatureFlagsModule = class FeatureFlagsModule {
};
exports.FeatureFlagsModule = FeatureFlagsModule;
exports.FeatureFlagsModule = FeatureFlagsModule = __decorate([
    (0, common_1.Module)({
        imports: [config_module_1.ConfigModule],
        controllers: [feature_flags_controller_1.FeatureFlagsController],
        providers: [feature_flags_service_1.FeatureFlagsService, feature_flag_guard_1.FeatureFlagGuard],
        exports: [feature_flags_service_1.FeatureFlagsService, feature_flag_guard_1.FeatureFlagGuard],
    })
], FeatureFlagsModule);
//# sourceMappingURL=feature-flags.module.js.map