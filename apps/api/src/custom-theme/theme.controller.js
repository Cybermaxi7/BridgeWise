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
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const theme_dto_1 = require("./dto/theme.dto");
const theme_entity_1 = require("./entities/theme.entity");
const theme_service_1 = require("./theme.service");
let ThemeController = class ThemeController {
    constructor(themeService) {
        this.themeService = themeService;
    }
    // ─── CRUD ─────────────────────────────────────────────────────────────────
    async create(dto, req) {
        const actorId = req.user?.id;
        return this.themeService.create(dto, actorId);
    }
    async findAll(query) {
        return this.themeService.findAll(query);
    }
    async getDefault(scope, scopeOwnerId) {
        return this.themeService.getDefaultTheme(scope ?? theme_entity_1.ThemeScope.GLOBAL, scopeOwnerId);
    }
    async findOne(id) {
        return this.themeService.findOne(id);
    }
    async update(id, dto, req) {
        const actorId = req.user?.id;
        return this.themeService.update(id, dto, actorId);
    }
    async remove(id, req) {
        const actorId = req.user?.id;
        return this.themeService.remove(id, actorId);
    }
    // ─── Overrides ────────────────────────────────────────────────────────────
    async applyOverride(id, dto, req) {
        const actorId = req.user?.id;
        return this.themeService.applyOverride(id, dto, actorId);
    }
    async resetToDefault(id, req) {
        const actorId = req.user?.id;
        return this.themeService.resetToDefault(id, actorId);
    }
    // ─── Clone ────────────────────────────────────────────────────────────────
    async clone(id, name, req) {
        const actorId = req.user?.id;
        return this.themeService.clone(id, name, actorId);
    }
    // ─── CSS ──────────────────────────────────────────────────────────────────
    async getCssVariables(id) {
        return this.themeService.getCssVariables(id);
    }
    async getPreview(id) {
        return this.themeService.getPreview(id);
    }
};
exports.ThemeController = ThemeController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new theme' }),
    (0, swagger_1.ApiCreatedResponse)({ type: theme_dto_1.ThemeResponseDto }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_a = typeof theme_dto_1.CreateThemeDto !== "undefined" && theme_dto_1.CreateThemeDto) === "function" ? _a : Object, Object]),
    __metadata("design:returntype", Promise)
], ThemeController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List themes with optional scope filter' }),
    (0, swagger_1.ApiOkResponse)({ type: [theme_dto_1.ThemeResponseDto] }),
    (0, swagger_1.ApiQuery)({ name: 'scope', enum: theme_entity_1.ThemeScope, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'scopeOwnerId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'isActive', required: false, type: Boolean }),
    (0, swagger_1.ApiQuery)({ name: 'isDefault', required: false, type: Boolean }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof theme_dto_1.ThemeQueryDto !== "undefined" && theme_dto_1.ThemeQueryDto) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], ThemeController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('default'),
    (0, swagger_1.ApiOperation)({ summary: 'Get the default theme for a scope' }),
    (0, swagger_1.ApiOkResponse)({ type: theme_dto_1.ThemeResponseDto }),
    (0, swagger_1.ApiQuery)({ name: 'scope', enum: theme_entity_1.ThemeScope, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'scopeOwnerId', required: false }),
    __param(0, (0, common_1.Query)('scope')),
    __param(1, (0, common_1.Query)('scopeOwnerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof theme_entity_1.ThemeScope !== "undefined" && theme_entity_1.ThemeScope) === "function" ? _c : Object, String]),
    __metadata("design:returntype", Promise)
], ThemeController.prototype, "getDefault", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a theme by ID' }),
    (0, swagger_1.ApiOkResponse)({ type: theme_dto_1.ThemeResponseDto }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', format: 'uuid' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ThemeController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a theme' }),
    (0, swagger_1.ApiOkResponse)({ type: theme_dto_1.ThemeResponseDto }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', format: 'uuid' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_d = typeof theme_dto_1.UpdateThemeDto !== "undefined" && theme_dto_1.UpdateThemeDto) === "function" ? _d : Object, Object]),
    __metadata("design:returntype", Promise)
], ThemeController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Soft-delete a theme' }),
    (0, swagger_1.ApiNoContentResponse)(),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', format: 'uuid' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ThemeController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/override'),
    (0, swagger_1.ApiOperation)({ summary: 'Apply partial config overrides to a theme' }),
    (0, swagger_1.ApiOkResponse)({ type: theme_dto_1.ThemeResponseDto }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', format: 'uuid' }),
    (0, swagger_1.ApiBody)({ type: theme_dto_1.ThemeOverrideDto }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_e = typeof theme_dto_1.ThemeOverrideDto !== "undefined" && theme_dto_1.ThemeOverrideDto) === "function" ? _e : Object, Object]),
    __metadata("design:returntype", Promise)
], ThemeController.prototype, "applyOverride", null);
__decorate([
    (0, common_1.Post)(':id/reset'),
    (0, swagger_1.ApiOperation)({ summary: 'Reset theme to its default/parent config' }),
    (0, swagger_1.ApiOkResponse)({ type: theme_dto_1.ThemeResponseDto }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', format: 'uuid' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ThemeController.prototype, "resetToDefault", null);
__decorate([
    (0, common_1.Post)(':id/clone'),
    (0, swagger_1.ApiOperation)({ summary: 'Clone a theme under a new name' }),
    (0, swagger_1.ApiCreatedResponse)({ type: theme_dto_1.ThemeResponseDto }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', format: 'uuid' }),
    (0, swagger_1.ApiBody)({ schema: { properties: { name: { type: 'string' } }, required: ['name'] } }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)('name')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ThemeController.prototype, "clone", null);
__decorate([
    (0, common_1.Get)(':id/css'),
    (0, swagger_1.ApiOperation)({ summary: 'Get CSS custom property variables for a theme' }),
    (0, swagger_1.ApiOkResponse)({ type: theme_dto_1.ThemeCssVariablesResponseDto }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', format: 'uuid' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ThemeController.prototype, "getCssVariables", null);
__decorate([
    (0, common_1.Get)(':id/preview'),
    (0, swagger_1.ApiOperation)({ summary: 'Preview a theme — returns theme data + CSS variables bundle' }),
    (0, swagger_1.ApiOkResponse)({ type: theme_dto_1.ThemePreviewResponseDto }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', format: 'uuid' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ThemeController.prototype, "getPreview", null);
exports.ThemeController = ThemeController = __decorate([
    (0, swagger_1.ApiTags)('Themes'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('themes'),
    __metadata("design:paramtypes", [theme_service_1.ThemeService])
], ThemeController);
//# sourceMappingURL=theme.controller.js.map