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
var AnalyticsExportRepository_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsExportRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const export_job_entity_1 = require("../entities/export-job.entity");
const analytics_metric_enum_1 = require("../enums/analytics-metric.enum");
const export_status_enum_1 = require("../enums/export-status.enum");
/**
 * Represents a raw analytics row as stored in the database.
 * Adjust the table name and columns to match your actual schema.
 */
let AnalyticsExportRepository = AnalyticsExportRepository_1 = class AnalyticsExportRepository {
    constructor(exportJobRepo) {
        this.exportJobRepo = exportJobRepo;
        this.logger = new common_1.Logger(AnalyticsExportRepository_1.name);
    }
    // ─── Export Job CRUD ────────────────────────────────────────────────────────
    async createJob(userId, options) {
        const job = this.exportJobRepo.create({
            userId,
            options,
            status: export_status_enum_1.ExportStatus.PENDING,
        });
        return this.exportJobRepo.save(job);
    }
    async findJobById(id) {
        return this.exportJobRepo.findOne({ where: { id } });
    }
    async findJobsByUser(userId) {
        return this.exportJobRepo.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: 50,
        });
    }
    async updateJobStatus(id, status, extras) {
        await this.exportJobRepo.update(id, { status, ...extras });
    }
    async markJobCompleted(id, rowCount, fileSizeBytes, downloadUrl) {
        await this.exportJobRepo.update(id, {
            status: export_status_enum_1.ExportStatus.COMPLETED,
            rowCount,
            fileSizeBytes,
            downloadUrl: downloadUrl ?? null,
            completedAt: new Date(),
        });
    }
    async markJobFailed(id, errorMessage) {
        await this.exportJobRepo.update(id, {
            status: export_status_enum_1.ExportStatus.FAILED,
            errorMessage,
            completedAt: new Date(),
        });
    }
    // ─── Analytics Data Queries ─────────────────────────────────────────────────
    /**
     * Fetch analytics records from the analytics_events table.
     * This uses a raw query for maximum flexibility and performance.
     */
    async fetchAnalyticsRecords(options) {
        const { metrics, startDate, endDate, networkId, userId, limit, } = options;
        const hasAllMetrics = metrics.includes(analytics_metric_enum_1.AnalyticsMetric.ALL);
        const qb = this.exportJobRepo.manager
            .createQueryBuilder()
            .select([
            'ae.id                AS id',
            'ae.metric            AS metric',
            'ae.value             AS value',
            'ae.unit              AS unit',
            'ae.metadata          AS metadata',
            'ae.network_id        AS "networkId"',
            'ae.user_id           AS "userId"',
            'ae.timestamp         AS timestamp',
            'ae.created_at        AS "createdAt"',
        ])
            .from('analytics_events', 'ae')
            .where('ae.timestamp BETWEEN :startDate AND :endDate', {
            startDate,
            endDate,
        })
            .orderBy('ae.timestamp', 'ASC');
        if (!hasAllMetrics) {
            qb.andWhere('ae.metric IN (:...metrics)', { metrics });
        }
        if (networkId) {
            qb.andWhere('ae.network_id = :networkId', { networkId });
        }
        if (userId) {
            qb.andWhere('ae.user_id = :userId', { userId });
        }
        if (limit) {
            qb.limit(limit);
        }
        const rows = await qb.getRawMany();
        this.logger.debug(`Fetched ${rows.length} analytics records`);
        return rows;
    }
    /**
     * Count how many analytics records match the given options (for progress tracking).
     */
    async countAnalyticsRecords(options) {
        const { metrics, startDate, endDate, networkId, userId } = options;
        const hasAllMetrics = metrics.includes(analytics_metric_enum_1.AnalyticsMetric.ALL);
        const qb = this.exportJobRepo.manager
            .createQueryBuilder()
            .select('COUNT(*)', 'count')
            .from('analytics_events', 'ae')
            .where('ae.timestamp BETWEEN :startDate AND :endDate', {
            startDate,
            endDate,
        });
        if (!hasAllMetrics) {
            qb.andWhere('ae.metric IN (:...metrics)', { metrics });
        }
        if (networkId)
            qb.andWhere('ae.network_id = :networkId', { networkId });
        if (userId)
            qb.andWhere('ae.user_id = :userId', { userId });
        const result = await qb.getRawOne();
        return parseInt(result?.count ?? '0', 10);
    }
};
exports.AnalyticsExportRepository = AnalyticsExportRepository;
exports.AnalyticsExportRepository = AnalyticsExportRepository = AnalyticsExportRepository_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(export_job_entity_1.ExportJobEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AnalyticsExportRepository);
//# sourceMappingURL=analytics-export.repository.js.map