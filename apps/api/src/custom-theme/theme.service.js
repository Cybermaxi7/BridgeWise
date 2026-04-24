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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ThemeService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const deepmerge = __importStar(require("deepmerge"));
const theme_entity_1 = require("../entities/theme.entity");
const theme_repository_1 = require("../repositories/theme.repository");
const theme_config_types_1 = require("../types/theme-config.types");
const css_generator_util_1 = require("../utils/css-generator.util");
let ThemeService = ThemeService_1 = class ThemeService {
    constructor(themeRepository) {
        this.themeRepository = themeRepository;
        this.logger = new common_1.Logger(ThemeService_1.name);
    }
    // ─── CRUD ────────────────────────────────────────────────────────────────
    async create(dto, actorId) {
        const scope = dto.scope ?? theme_entity_1.ThemeScope.GLOBAL;
        // Validate owner required for non-global scopes
        if (scope !== theme_entity_1.ThemeScope.GLOBAL && !dto.scopeOwnerId) {
            throw new common_1.BadRequestException(`scopeOwnerId is required for scope "${scope}"`);
        }
        // Resolve parent config if inheritance is requested
        let resolvedConfig = theme_config_types_1.DEFAULT_THEME_CONFIG;
        if (dto.parentThemeId) {
            const parent = await this.themeRepository.findActiveById(dto.parentThemeId);
            if (!parent) {
                throw new common_1.NotFoundException(`Parent theme "${dto.parentThemeId}" not found`);
            }
            resolvedConfig = parent.config;
        }
        // Deep-merge supplied config overrides onto the resolved base
        const finalConfig = dto.config
            ? deepmerge(resolvedConfig, dto.config, {
                arrayMerge: (_, src) => src,
            })
            : resolvedConfig;
        // If this theme is being set as default, clear existing defaults first
        if (dto.isDefault) {
            await this.themeRepository.unsetDefaultForScope(scope, dto.scopeOwnerId);
        }
        const theme = this.themeRepository.create({
            name: dto.name,
            description: dto.description ?? null,
            scope,
            scopeOwnerId: dto.scopeOwnerId ?? null,
            parentThemeId: dto.parentThemeId ?? null,
            config: finalConfig,
            isDefault: dto.isDefault ?? false,
            isActive: true,
            isReadOnly: false,
            createdBy: actorId ?? null,
            updatedBy: actorId ?? null,
        });
        try {
            const saved = await this.themeRepository.save(theme);
            this.logger.log(`Theme created: ${saved.id} (${saved.name})`);
            return this.toResponseDto(saved);
        }
        catch (err) {
            if (err?.code === '23505') {
                throw new common_1.ConflictException(`A theme named "${dto.name}" already exists for scope "${scope}"`);
            }
            throw err;
        }
    }
    async findAll(query) {
        const themes = await this.themeRepository.findByScope(query.scope ?? theme_entity_1.ThemeScope.GLOBAL, query.scopeOwnerId);
        return themes
            .filter((t) => {
            if (query.isActive !== undefined && t.isActive !== query.isActive)
                return false;
            if (query.isDefault !== undefined && t.isDefault !== query.isDefault)
                return false;
            return true;
        })
            .map(this.toResponseDto);
    }
    async findOne(id) {
        const theme = await this.themeRepository.findActiveById(id);
        if (!theme)
            throw new common_1.NotFoundException(`Theme "${id}" not found`);
        return this.toResponseDto(theme);
    }
    async update(id, dto, actorId) {
        const theme = await this.themeRepository.findActiveById(id);
        if (!theme)
            throw new common_1.NotFoundException(`Theme "${id}" not found`);
        if (theme.isReadOnly) {
            throw new common_1.BadRequestException(`Theme "${id}" is read-only and cannot be modified`);
        }
        if (dto.isDefault && !theme.isDefault) {
            await this.themeRepository.unsetDefaultForScope(theme.scope, theme.scopeOwnerId ?? undefined);
        }
        if (dto.config) {
            theme.config = deepmerge(theme.config, dto.config, {
                arrayMerge: (_, src) => src,
            });
        }
        if (dto.name !== undefined)
            theme.name = dto.name;
        if (dto.description !== undefined)
            theme.description = dto.description ?? null;
        if (dto.isDefault !== undefined)
            theme.isDefault = dto.isDefault;
        theme.updatedBy = actorId ?? null;
        const saved = await this.themeRepository.save(theme);
        this.logger.log(`Theme updated: ${saved.id}`);
        return this.toResponseDto(saved);
    }
    async remove(id, actorId) {
        const theme = await this.themeRepository.findActiveById(id);
        if (!theme)
            throw new common_1.NotFoundException(`Theme "${id}" not found`);
        if (theme.isReadOnly) {
            throw new common_1.BadRequestException(`Theme "${id}" is read-only and cannot be deleted`);
        }
        if (theme.isDefault) {
            throw new common_1.BadRequestException('Cannot delete the default theme. Set another theme as default first.');
        }
        await this.themeRepository.softDelete(id, actorId);
        this.logger.log(`Theme soft-deleted: ${id}`);
    }
    // ─── Override / Merge ─────────────────────────────────────────────────────
    async applyOverride(id, dto, actorId) {
        const theme = await this.themeRepository.findActiveById(id);
        if (!theme)
            throw new common_1.NotFoundException(`Theme "${id}" not found`);
        if (theme.isReadOnly) {
            throw new common_1.BadRequestException(`Theme "${id}" is read-only`);
        }
        theme.config = deepmerge(theme.config, dto.overrides, { arrayMerge: (_, src) => src });
        theme.updatedBy = actorId ?? null;
        const saved = await this.themeRepository.save(theme);
        this.logger.log(`Theme override applied: ${id}`);
        return this.toResponseDto(saved);
    }
    async resetToDefault(id, actorId) {
        const theme = await this.themeRepository.findActiveById(id);
        if (!theme)
            throw new common_1.NotFoundException(`Theme "${id}" not found`);
        if (theme.isReadOnly) {
            throw new common_1.BadRequestException(`Theme "${id}" is read-only`);
        }
        let baseConfig = theme_config_types_1.DEFAULT_THEME_CONFIG;
        if (theme.parentThemeId) {
            const parent = await this.themeRepository.findActiveById(theme.parentThemeId);
            if (parent)
                baseConfig = parent.config;
        }
        theme.config = baseConfig;
        theme.updatedBy = actorId ?? null;
        const saved = await this.themeRepository.save(theme);
        return this.toResponseDto(saved);
    }
    // ─── CSS Generation ───────────────────────────────────────────────────────
    async getCssVariables(id) {
        const theme = await this.themeRepository.findActiveById(id);
        if (!theme)
            throw new common_1.NotFoundException(`Theme "${id}" not found`);
        const variables = (0, css_generator_util_1.generateCssVariables)(theme.config);
        const darkVariables = (0, css_generator_util_1.generateDarkModeVariables)(theme.config);
        const cssVariables = (0, css_generator_util_1.generateFullCssBundle)(theme.config);
        return { cssVariables, variables, darkVariables };
    }
    async getPreview(id) {
        const themeDto = await this.findOne(id);
        const theme = await this.themeRepository.findActiveById(id);
        const variables = (0, css_generator_util_1.generateCssVariables)(theme.config);
        const darkVariables = (0, css_generator_util_1.generateDarkModeVariables)(theme.config);
        const cssVariables = (0, css_generator_util_1.generateFullCssBundle)(theme.config);
        return {
            theme: themeDto,
            css: { cssVariables, variables, darkVariables },
        };
    }
    async getDefaultTheme(scope, scopeOwnerId) {
        const theme = await this.themeRepository.findDefaultForScope(scope, scopeOwnerId);
        // Fallback: return any active theme for the scope
        if (!theme) {
            const [fallback] = await this.themeRepository.findByScope(scope, scopeOwnerId);
            if (!fallback) {
                // Last resort: synthesise a virtual default
                return {
                    id: 'default',
                    name: 'Default Theme',
                    description: 'System default theme',
                    scope,
                    scopeOwnerId: scopeOwnerId ?? null,
                    config: theme_config_types_1.DEFAULT_THEME_CONFIG,
                    isDefault: true,
                    isActive: true,
                    isReadOnly: true,
                    parentThemeId: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
            }
            return this.toResponseDto(fallback);
        }
        return this.toResponseDto(theme);
    }
    // ─── Clone ────────────────────────────────────────────────────────────────
    async clone(id, newName, actorId) {
        const source = await this.themeRepository.findActiveById(id);
        if (!source)
            throw new common_1.NotFoundException(`Theme "${id}" not found`);
        return this.create({
            name: newName,
            description: `Cloned from: ${source.name}`,
            scope: source.scope,
            scopeOwnerId: source.scopeOwnerId ?? undefined,
            config: source.config,
            isDefault: false,
        }, actorId);
    }
    // ─── Helpers ──────────────────────────────────────────────────────────────
    toResponseDto(theme) {
        return {
            id: theme.id,
            name: theme.name,
            description: theme.description,
            scope: theme.scope,
            scopeOwnerId: theme.scopeOwnerId,
            config: theme.config,
            isDefault: theme.isDefault,
            isActive: theme.isActive,
            isReadOnly: theme.isReadOnly,
            parentThemeId: theme.parentThemeId,
            createdAt: theme.createdAt,
            updatedAt: theme.updatedAt,
        };
    }
};
exports.ThemeService = ThemeService;
exports.ThemeService = ThemeService = ThemeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(theme_repository_1.ThemeRepository)),
    __metadata("design:paramtypes", [typeof (_a = typeof theme_repository_1.ThemeRepository !== "undefined" && theme_repository_1.ThemeRepository) === "function" ? _a : Object])
], ThemeService);
//# sourceMappingURL=theme.service.js.map