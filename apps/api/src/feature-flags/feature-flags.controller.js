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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeatureFlagsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const feature_flags_service_1 = require("./feature-flags.service");
let FeatureFlagsController = class FeatureFlagsController {
    constructor(featureFlagsService) {
        this.featureFlagsService = featureFlagsService;
    }
    /**
     * Returns all feature flags and their current state.
     * Useful for frontend consumers that need to adapt their UI based on
     * which features are active in the current deployment.
     */
    getAll() {
        return this.featureFlagsService.getAll();
    }
    /**
     * Returns the enabled/disabled state of a single feature flag.
     */
    getOne(flag) {
        const all = this.featureFlagsService.getAll();
        if (!(flag in all)) {
            throw new common_1.NotFoundException(`Feature flag '${flag}' does not exist.`);
        }
        return {
            flag,
            enabled: this.featureFlagsService.isEnabled(flag),
        };
    }
};
exports.FeatureFlagsController = FeatureFlagsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all feature flags and their current state' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Map of feature flag names to their boolean enabled state',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FeatureFlagsController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)(':flag'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a single feature flag by name' }),
    (0, swagger_1.ApiParam)({
        name: 'flag',
        description: 'Feature flag name (camelCase)',
        example: 'enableBridgeCompare',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Flag state' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Flag not found' }),
    __param(0, (0, common_1.Param)('flag')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FeatureFlagsController.prototype, "getOne", null);
exports.FeatureFlagsController = FeatureFlagsController = __decorate([
    (0, swagger_1.ApiTags)('Feature Flags'),
    (0, common_1.Controller)('feature-flags'),
    __metadata("design:paramtypes", [feature_flags_service_1.FeatureFlagsService])
], FeatureFlagsController);
//# sourceMappingURL=feature-flags.controller.js.map