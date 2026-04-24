"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateThemesTable1710000000000 = void 0;
const typeorm_1 = require("typeorm");
class CreateThemesTable1710000000000 {
    constructor() {
        this.name = 'CreateThemesTable1710000000000';
    }
    async up(queryRunner) {
        await queryRunner.query(`CREATE TYPE "theme_scope_enum" AS ENUM ('global', 'organization', 'user')`);
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'themes',
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                    generationStrategy: 'uuid',
                    default: 'uuid_generate_v4()',
                },
                { name: 'name', type: 'varchar', length: '100', isNullable: false },
                { name: 'description', type: 'varchar', length: '500', isNullable: true },
                {
                    name: 'scope',
                    type: 'enum',
                    enumName: 'theme_scope_enum',
                    default: "'global'",
                },
                { name: 'scope_owner_id', type: 'uuid', isNullable: true },
                { name: 'config', type: 'jsonb', isNullable: false },
                { name: 'is_default', type: 'boolean', default: false },
                { name: 'is_active', type: 'boolean', default: true },
                { name: 'is_read_only', type: 'boolean', default: false },
                { name: 'parent_theme_id', type: 'uuid', isNullable: true },
                { name: 'created_by', type: 'uuid', isNullable: true },
                { name: 'updated_by', type: 'uuid', isNullable: true },
                {
                    name: 'created_at',
                    type: 'timestamp with time zone',
                    default: 'CURRENT_TIMESTAMP',
                },
                {
                    name: 'updated_at',
                    type: 'timestamp with time zone',
                    default: 'CURRENT_TIMESTAMP',
                },
                { name: 'deleted_at', type: 'timestamp with time zone', isNullable: true },
            ],
        }), true);
        await queryRunner.createIndex('themes', new typeorm_1.TableIndex({
            name: 'IDX_themes_scope_is_default',
            columnNames: ['scope', 'is_default'],
        }));
        await queryRunner.createIndex('themes', new typeorm_1.TableIndex({
            name: 'UQ_themes_name_scope',
            columnNames: ['name', 'scope'],
            isUnique: true,
            where: 'deleted_at IS NULL',
        }));
        await queryRunner.createIndex('themes', new typeorm_1.TableIndex({
            name: 'IDX_themes_is_active_deleted',
            columnNames: ['is_active', 'deleted_at'],
        }));
    }
    async down(queryRunner) {
        await queryRunner.dropTable('themes', true, true, true);
        await queryRunner.query(`DROP TYPE IF EXISTS "theme_scope_enum"`);
    }
}
exports.CreateThemesTable1710000000000 = CreateThemesTable1710000000000;
//# sourceMappingURL=1710000000000-CreateThemesTable.js.map