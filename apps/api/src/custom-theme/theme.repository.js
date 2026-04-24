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
exports.ThemeRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const theme_entity_1 = require("../entities/theme.entity");
let ThemeRepository = class ThemeRepository extends typeorm_1.Repository {
    constructor(dataSource) {
        super(theme_entity_1.Theme, dataSource.createEntityManager());
        this.dataSource = dataSource;
    }
    async findByScope(scope, scopeOwnerId) {
        const qb = this.createQueryBuilder('theme')
            .where('theme.scope = :scope', { scope })
            .andWhere('theme.isActive = true')
            .andWhere('theme.deletedAt IS NULL')
            .orderBy('theme.isDefault', 'DESC')
            .addOrderBy('theme.createdAt', 'ASC');
        if (scopeOwnerId) {
            qb.andWhere('theme.scopeOwnerId = :scopeOwnerId', { scopeOwnerId });
        }
        return qb.getMany();
    }
    async findDefaultForScope(scope, scopeOwnerId) {
        const qb = this.createQueryBuilder('theme')
            .where('theme.scope = :scope', { scope })
            .andWhere('theme.isDefault = true')
            .andWhere('theme.isActive = true')
            .andWhere('theme.deletedAt IS NULL');
        if (scopeOwnerId) {
            qb.andWhere('theme.scopeOwnerId = :scopeOwnerId', { scopeOwnerId });
        }
        return qb.getOne();
    }
    async findActiveById(id) {
        return this.findOne({
            where: { id, isActive: true, deletedAt: null },
        });
    }
    async unsetDefaultForScope(scope, scopeOwnerId) {
        const qb = this.createQueryBuilder()
            .update(theme_entity_1.Theme)
            .set({ isDefault: false })
            .where('scope = :scope', { scope })
            .andWhere('isDefault = true');
        if (scopeOwnerId) {
            qb.andWhere('scopeOwnerId = :scopeOwnerId', { scopeOwnerId });
        }
        await qb.execute();
    }
    async findWithParent(id) {
        return this.createQueryBuilder('theme')
            .leftJoinAndMapOne('theme.parent', theme_entity_1.Theme, 'parent', 'parent.id = theme.parentThemeId')
            .where('theme.id = :id', { id })
            .andWhere('theme.deletedAt IS NULL')
            .getOne();
    }
    async softDelete(id, deletedBy) {
        await this.update(id, {
            deletedAt: new Date(),
            isActive: false,
            updatedBy: deletedBy,
        });
    }
    async countByScope(scope) {
        return this.count({ where: { scope, isActive: true, deletedAt: null } });
    }
};
exports.ThemeRepository = ThemeRepository;
exports.ThemeRepository = ThemeRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], ThemeRepository);
//# sourceMappingURL=theme.repository.js.map