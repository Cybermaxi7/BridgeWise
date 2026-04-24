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
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemePreviewResponseDto = exports.ThemeCssVariablesResponseDto = exports.ThemeResponseDto = exports.ThemeQueryDto = exports.ApplyThemeDto = exports.ThemeOverrideDto = exports.UpdateThemeDto = exports.CreateThemeDto = exports.ThemeConfigDto = exports.ThemeBorderRadiusDto = exports.ThemeSpacingDto = exports.ThemeTypographyDto = exports.ThemeColorsDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const theme_entity_1 = require("../entities/theme.entity");
const theme_config_types_1 = require("../types/theme-config.types");
// ─── Nested config DTOs ──────────────────────────────────────────────────────
class ThemeColorsDto {
}
exports.ThemeColorsDto = ThemeColorsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '#6366F1' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsHexColor)(),
    __metadata("design:type", String)
], ThemeColorsDto.prototype, "primary", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '#4F46E5' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsHexColor)(),
    __metadata("design:type", String)
], ThemeColorsDto.prototype, "primaryHover", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '#4338CA' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsHexColor)(),
    __metadata("design:type", String)
], ThemeColorsDto.prototype, "primaryActive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '#8B5CF6' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsHexColor)(),
    __metadata("design:type", String)
], ThemeColorsDto.prototype, "secondary", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '#7C3AED' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsHexColor)(),
    __metadata("design:type", String)
], ThemeColorsDto.prototype, "secondaryHover", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '#6D28D9' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsHexColor)(),
    __metadata("design:type", String)
], ThemeColorsDto.prototype, "secondaryActive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '#F59E0B' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsHexColor)(),
    __metadata("design:type", String)
], ThemeColorsDto.prototype, "accent", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '#F9FAFB' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsHexColor)(),
    __metadata("design:type", String)
], ThemeColorsDto.prototype, "background", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '#FFFFFF' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsHexColor)(),
    __metadata("design:type", String)
], ThemeColorsDto.prototype, "surface", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '#F3F4F6' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsHexColor)(),
    __metadata("design:type", String)
], ThemeColorsDto.prototype, "surfaceRaised", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '#FFFFFF' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsHexColor)(),
    __metadata("design:type", String)
], ThemeColorsDto.prototype, "onPrimary", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '#FFFFFF' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsHexColor)(),
    __metadata("design:type", String)
], ThemeColorsDto.prototype, "onSecondary", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '#EF4444' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsHexColor)(),
    __metadata("design:type", String)
], ThemeColorsDto.prototype, "error", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '#FEE2E2' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsHexColor)(),
    __metadata("design:type", String)
], ThemeColorsDto.prototype, "errorLight", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '#F59E0B' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsHexColor)(),
    __metadata("design:type", String)
], ThemeColorsDto.prototype, "warning", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '#FEF3C7' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsHexColor)(),
    __metadata("design:type", String)
], ThemeColorsDto.prototype, "warningLight", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '#10B981' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsHexColor)(),
    __metadata("design:type", String)
], ThemeColorsDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '#D1FAE5' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsHexColor)(),
    __metadata("design:type", String)
], ThemeColorsDto.prototype, "successLight", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '#3B82F6' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsHexColor)(),
    __metadata("design:type", String)
], ThemeColorsDto.prototype, "info", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '#DBEAFE' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsHexColor)(),
    __metadata("design:type", String)
], ThemeColorsDto.prototype, "infoLight", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '#111827' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsHexColor)(),
    __metadata("design:type", String)
], ThemeColorsDto.prototype, "textPrimary", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '#6B7280' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsHexColor)(),
    __metadata("design:type", String)
], ThemeColorsDto.prototype, "textSecondary", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '#9CA3AF' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsHexColor)(),
    __metadata("design:type", String)
], ThemeColorsDto.prototype, "textDisabled", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '#FFFFFF' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsHexColor)(),
    __metadata("design:type", String)
], ThemeColorsDto.prototype, "textInverse", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '#E5E7EB' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsHexColor)(),
    __metadata("design:type", String)
], ThemeColorsDto.prototype, "border", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '#6366F1' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsHexColor)(),
    __metadata("design:type", String)
], ThemeColorsDto.prototype, "borderFocus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '#F3F4F6' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsHexColor)(),
    __metadata("design:type", String)
], ThemeColorsDto.prototype, "divider", void 0);
class ThemeTypographyDto {
}
exports.ThemeTypographyDto = ThemeTypographyDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: "'Inter', sans-serif" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ThemeTypographyDto.prototype, "fontFamilyHeading", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: "'Inter', sans-serif" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ThemeTypographyDto.prototype, "fontFamilyBody", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: "'JetBrains Mono', monospace" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ThemeTypographyDto.prototype, "fontFamilyMono", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '0.75rem' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ThemeTypographyDto.prototype, "fontSizeXs", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '0.875rem' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ThemeTypographyDto.prototype, "fontSizeSm", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '1rem' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ThemeTypographyDto.prototype, "fontSizeBase", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '1.125rem' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ThemeTypographyDto.prototype, "fontSizeLg", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '1.25rem' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ThemeTypographyDto.prototype, "fontSizeXl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '1.5rem' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ThemeTypographyDto.prototype, "fontSize2xl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '1.875rem' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ThemeTypographyDto.prototype, "fontSize3xl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2.25rem' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ThemeTypographyDto.prototype, "fontSize4xl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 300 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ThemeTypographyDto.prototype, "fontWeightLight", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 400 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ThemeTypographyDto.prototype, "fontWeightRegular", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 500 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ThemeTypographyDto.prototype, "fontWeightMedium", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 600 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ThemeTypographyDto.prototype, "fontWeightSemibold", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 700 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ThemeTypographyDto.prototype, "fontWeightBold", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1.25 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ThemeTypographyDto.prototype, "lineHeightTight", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1.5 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ThemeTypographyDto.prototype, "lineHeightNormal", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1.75 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ThemeTypographyDto.prototype, "lineHeightRelaxed", void 0);
class ThemeSpacingDto {
}
exports.ThemeSpacingDto = ThemeSpacingDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 4 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ThemeSpacingDto.prototype, "unit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 4 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ThemeSpacingDto.prototype, "xs", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 8 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ThemeSpacingDto.prototype, "sm", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 16 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ThemeSpacingDto.prototype, "md", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 24 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ThemeSpacingDto.prototype, "lg", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 32 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ThemeSpacingDto.prototype, "xl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 48 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ThemeSpacingDto.prototype, "xxl", void 0);
class ThemeBorderRadiusDto {
}
exports.ThemeBorderRadiusDto = ThemeBorderRadiusDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '0px' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ThemeBorderRadiusDto.prototype, "none", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2px' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ThemeBorderRadiusDto.prototype, "sm", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '4px' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ThemeBorderRadiusDto.prototype, "base", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '8px' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ThemeBorderRadiusDto.prototype, "lg", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '12px' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ThemeBorderRadiusDto.prototype, "xl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '9999px' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ThemeBorderRadiusDto.prototype, "full", void 0);
class ThemeConfigDto {
}
exports.ThemeConfigDto = ThemeConfigDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: ThemeColorsDto }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ThemeColorsDto),
    __metadata("design:type", ThemeColorsDto)
], ThemeConfigDto.prototype, "colors", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: ThemeColorsDto, description: 'Dark mode color overrides' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ThemeColorsDto),
    __metadata("design:type", ThemeColorsDto)
], ThemeConfigDto.prototype, "darkModeColors", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: ThemeTypographyDto }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ThemeTypographyDto),
    __metadata("design:type", ThemeTypographyDto)
], ThemeConfigDto.prototype, "typography", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: ThemeSpacingDto }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ThemeSpacingDto),
    __metadata("design:type", ThemeSpacingDto)
], ThemeConfigDto.prototype, "spacing", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: ThemeBorderRadiusDto }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ThemeBorderRadiusDto),
    __metadata("design:type", ThemeBorderRadiusDto)
], ThemeConfigDto.prototype, "borderRadius", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Enable dark mode support', example: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ThemeConfigDto.prototype, "darkModeEnabled", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Custom CSS variables map',
        example: { '--custom-ribbon': '#FF0000' },
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], ThemeConfigDto.prototype, "customCssVariables", void 0);
// ─── Primary DTOs ────────────────────────────────────────────────────────────
class CreateThemeDto {
}
exports.CreateThemeDto = CreateThemeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'BridgeWise Dark', maxLength: 100 }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateThemeDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Dark theme for BridgeWise dashboard', maxLength: 500 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CreateThemeDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: theme_entity_1.ThemeScope, default: theme_entity_1.ThemeScope.GLOBAL }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(theme_entity_1.ThemeScope),
    __metadata("design:type", typeof (_a = typeof theme_entity_1.ThemeScope !== "undefined" && theme_entity_1.ThemeScope) === "function" ? _a : Object)
], CreateThemeDto.prototype, "scope", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Owner ID for organization/user-scoped themes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateThemeDto.prototype, "scopeOwnerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Inherit from this theme ID and override' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateThemeDto.prototype, "parentThemeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: ThemeConfigDto }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ThemeConfigDto),
    __metadata("design:type", ThemeConfigDto)
], CreateThemeDto.prototype, "config", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateThemeDto.prototype, "isDefault", void 0);
class UpdateThemeDto extends (0, swagger_1.PartialType)(CreateThemeDto) {
}
exports.UpdateThemeDto = UpdateThemeDto;
class ThemeOverrideDto {
}
exports.ThemeOverrideDto = ThemeOverrideDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: ThemeConfigDto, description: 'Partial config overrides to apply' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ThemeConfigDto),
    __metadata("design:type", ThemeConfigDto)
], ThemeOverrideDto.prototype, "overrides", void 0);
class ApplyThemeDto {
}
exports.ApplyThemeDto = ApplyThemeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Theme ID to apply' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ApplyThemeDto.prototype, "themeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: theme_entity_1.ThemeScope }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(theme_entity_1.ThemeScope),
    __metadata("design:type", typeof (_b = typeof theme_entity_1.ThemeScope !== "undefined" && theme_entity_1.ThemeScope) === "function" ? _b : Object)
], ApplyThemeDto.prototype, "scope", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Scope owner ID (org or user)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ApplyThemeDto.prototype, "scopeOwnerId", void 0);
class ThemeQueryDto {
}
exports.ThemeQueryDto = ThemeQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: theme_entity_1.ThemeScope }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(theme_entity_1.ThemeScope),
    __metadata("design:type", typeof (_c = typeof theme_entity_1.ThemeScope !== "undefined" && theme_entity_1.ThemeScope) === "function" ? _c : Object)
], ThemeQueryDto.prototype, "scope", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ThemeQueryDto.prototype, "scopeOwnerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ThemeQueryDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by default theme only' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ThemeQueryDto.prototype, "isDefault", void 0);
// ─── Response DTOs ───────────────────────────────────────────────────────────
class ThemeResponseDto {
}
exports.ThemeResponseDto = ThemeResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ThemeResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ThemeResponseDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], ThemeResponseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: theme_entity_1.ThemeScope }),
    __metadata("design:type", typeof (_d = typeof theme_entity_1.ThemeScope !== "undefined" && theme_entity_1.ThemeScope) === "function" ? _d : Object)
], ThemeResponseDto.prototype, "scope", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], ThemeResponseDto.prototype, "scopeOwnerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", typeof (_e = typeof theme_config_types_1.ThemeConfig !== "undefined" && theme_config_types_1.ThemeConfig) === "function" ? _e : Object)
], ThemeResponseDto.prototype, "config", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], ThemeResponseDto.prototype, "isDefault", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], ThemeResponseDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], ThemeResponseDto.prototype, "isReadOnly", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], ThemeResponseDto.prototype, "parentThemeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], ThemeResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], ThemeResponseDto.prototype, "updatedAt", void 0);
class ThemeCssVariablesResponseDto {
}
exports.ThemeCssVariablesResponseDto = ThemeCssVariablesResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Generated CSS variables string' }),
    __metadata("design:type", String)
], ThemeCssVariablesResponseDto.prototype, "cssVariables", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'CSS variables as key-value map' }),
    __metadata("design:type", Object)
], ThemeCssVariablesResponseDto.prototype, "variables", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Dark mode CSS variables map (if enabled)' }),
    __metadata("design:type", Object)
], ThemeCssVariablesResponseDto.prototype, "darkVariables", void 0);
class ThemePreviewResponseDto {
}
exports.ThemePreviewResponseDto = ThemePreviewResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: ThemeResponseDto }),
    __metadata("design:type", ThemeResponseDto)
], ThemePreviewResponseDto.prototype, "theme", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: ThemeCssVariablesResponseDto }),
    __metadata("design:type", ThemeCssVariablesResponseDto)
], ThemePreviewResponseDto.prototype, "css", void 0);
//# sourceMappingURL=theme.dto.js.map