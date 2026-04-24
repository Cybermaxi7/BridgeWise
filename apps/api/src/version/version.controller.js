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
exports.VersionController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
let VersionController = class VersionController {
    getVersion() {
        return {
            version: process.env.npm_package_version || '0.0.1',
            build: process.env.BUILD_NUMBER || new Date().toISOString(),
            apiVersion: 'v1',
            environment: process.env.NODE_ENV || 'development',
            timestamp: new Date().toISOString(),
        };
    }
};
exports.VersionController = VersionController;
__decorate([
    (0, common_1.Get)('version'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get SDK and API version information',
        description: 'Returns the current SDK version, API version, and environment details. Useful for debugging and compatibility checks.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Version information retrieved successfully',
        example: {
            version: '0.0.1',
            build: '2024.01.15.120000',
            apiVersion: 'v1',
            environment: 'development',
            timestamp: '2024-01-15T12:00:00.000Z',
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], VersionController.prototype, "getVersion", null);
exports.VersionController = VersionController = __decorate([
    (0, swagger_1.ApiTags)('System'),
    (0, common_1.Controller)()
], VersionController);
//# sourceMappingURL=version.controller.js.map