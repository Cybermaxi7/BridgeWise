"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateWebhookTables1700000000000 = void 0;
const typeorm_1 = require("typeorm");
class CreateWebhookTables1700000000000 {
    constructor() {
        this.name = 'CreateWebhookTables1700000000000';
    }
    // ──────────────────────────────────────────────────────────────────────────
    // UP
    // ──────────────────────────────────────────────────────────────────────────
    async up(queryRunner) {
        // ── webhooks ────────────────────────────────────────────────────────────
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'webhooks',
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                    generationStrategy: 'uuid',
                    default: 'gen_random_uuid()',
                },
                { name: 'name', type: 'varchar', length: '255' },
                { name: 'url', type: 'text' },
                { name: 'secret', type: 'text' },
                {
                    name: 'events',
                    type: 'text',
                    // TypeORM simple-array uses comma-separated text
                    default: "''",
                },
                { name: 'isActive', type: 'boolean', default: true },
                { name: 'maxRetries', type: 'int', default: 5 },
                { name: 'description', type: 'text', isNullable: true },
                {
                    name: 'createdAt',
                    type: 'timestamptz',
                    default: 'now()',
                },
                {
                    name: 'updatedAt',
                    type: 'timestamptz',
                    default: 'now()',
                },
            ],
        }), true);
        // ── webhook_deliveries ──────────────────────────────────────────────────
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'webhook_deliveries',
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                    generationStrategy: 'uuid',
                    default: 'gen_random_uuid()',
                },
                { name: 'webhookId', type: 'uuid' },
                { name: 'event', type: 'varchar' },
                { name: 'payload', type: 'jsonb' },
                { name: 'status', type: 'varchar', default: "'pending'" },
                { name: 'responseStatus', type: 'int', isNullable: true },
                { name: 'responseBody', type: 'text', isNullable: true },
                { name: 'errorMessage', type: 'text', isNullable: true },
                { name: 'attempt', type: 'int', default: 0 },
                { name: 'nextRetryAt', type: 'timestamptz', isNullable: true },
                { name: 'deliveredAt', type: 'timestamptz', isNullable: true },
                {
                    name: 'createdAt',
                    type: 'timestamptz',
                    default: 'now()',
                },
            ],
            foreignKeys: [
                {
                    columnNames: ['webhookId'],
                    referencedTableName: 'webhooks',
                    referencedColumnNames: ['id'],
                    onDelete: 'CASCADE',
                },
            ],
        }), true);
        // ── indexes ─────────────────────────────────────────────────────────────
        await queryRunner.createIndex('webhook_deliveries', new typeorm_1.TableIndex({
            name: 'IDX_webhook_deliveries_webhookId_createdAt',
            columnNames: ['webhookId', 'createdAt'],
        }));
        await queryRunner.createIndex('webhook_deliveries', new typeorm_1.TableIndex({
            name: 'IDX_webhook_deliveries_status',
            columnNames: ['status'],
        }));
    }
    // ──────────────────────────────────────────────────────────────────────────
    // DOWN
    // ──────────────────────────────────────────────────────────────────────────
    async down(queryRunner) {
        await queryRunner.dropTable('webhook_deliveries', true);
        await queryRunner.dropTable('webhooks', true);
    }
}
exports.CreateWebhookTables1700000000000 = CreateWebhookTables1700000000000;
//# sourceMappingURL=1700000000000-CreateWebhookTables.js.map