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
var AnalyticsExportService_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsExportService = exports.ANALYTICS_EXPORT_QUEUE = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const bull_2 = require("bull");
const analytics_export_repository_1 = require("./analytics-export.repository");
const analytics_metric_enum_1 = require("./enums/analytics-metric.enum");
const export_status_enum_1 = require("./enums/export-status.enum");
const csv_builder_util_1 = require("./utils/csv-builder.util");
exports.ANALYTICS_EXPORT_QUEUE = 'analytics-export';
/** Threshold: above this row count, switch to async export */
const SYNC_ROW_LIMIT = 10_000;
let AnalyticsExportService = AnalyticsExportService_1 = class AnalyticsExportService {
    constructor(repository, csvBuilder, exportQueue) {
        this.repository = repository;
        this.csvBuilder = csvBuilder;
        this.exportQueue = exportQueue;
        this.logger = new common_1.Logger(AnalyticsExportService_1.name);
    }
    // ─── Public API ─────────────────────────────────────────────────────────────
    /**
     * Generate and stream a CSV directly for small datasets,
     * or enqueue an async job for large ones.
     */
    async initiateExport(userId, dto) {
        const options = this.mapDtoToOptions(dto);
        if (dto.async) {
            return this.enqueueExportJob(userId, options);
        }
        const count = await this.repository.countAnalyticsRecords(options);
        if (count > SYNC_ROW_LIMIT) {
            throw new common_1.BadRequestException(`Dataset too large for synchronous export (${count} rows). ` +
                `Use async=true to queue a background export job.`);
        }
        return this.buildSyncCsv(userId, options);
    }
    /**
     * Build CSV synchronously and return the raw string + suggested filename.
     */
    async buildSyncCsv(userId, options) {
        const records = await this.repository.fetchAnalyticsRecords(options);
        const csv = this.buildCsvFromRecords(records, options);
        const filename = this.buildFilename(options);
        this.logger.log(`Sync CSV export for user=${userId}: ${records.length} rows, ${this.csvBuilder.estimateSize(csv)} bytes`);
        return { csv, filename };
    }
    /**
     * Enqueue an async export job and return the job reference.
     */
    async enqueueExportJob(userId, options) {
        const jobEntity = await this.repository.createJob(userId, options);
        const payload = {
            jobId: jobEntity.id,
            userId,
            options,
            requestedAt: new Date().toISOString(),
        };
        const bullJob = await this.exportQueue.add('export', payload, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 5000 },
            removeOnComplete: 100,
            removeOnFail: 50,
        });
        await this.repository.updateJobStatus(jobEntity.id, export_status_enum_1.ExportStatus.PENDING, {
            bullJobId: String(bullJob.id),
        });
        return {
            jobId: jobEntity.id,
            status: export_status_enum_1.ExportStatus.PENDING,
            message: 'Export job queued successfully. Poll the status URL for updates.',
            statusUrl: `/analytics/export/jobs/${jobEntity.id}`,
            createdAt: jobEntity.createdAt.toISOString(),
        };
    }
    /**
     * Process an async export job (called from BullMQ processor).
     */
    async processExportJob(payload) {
        const { jobId, userId, options } = payload;
        await this.repository.updateJobStatus(jobId, export_status_enum_1.ExportStatus.PROCESSING);
        try {
            const { csv, filename } = await this.buildSyncCsv(userId, options);
            const sizeBytes = this.csvBuilder.estimateSize(csv);
            const rowCount = csv.split('\n').length - 1; // subtract header
            // In a real system, upload to S3/GCS and store the URL.
            // Here we store the filename as a placeholder for the download URL.
            await this.repository.markJobCompleted(jobId, rowCount, sizeBytes, `/analytics/export/jobs/${jobId}/download`);
            this.logger.log(`Async export completed: jobId=${jobId}, rows=${rowCount}, size=${sizeBytes}B`);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            await this.repository.markJobFailed(jobId, message);
            this.logger.error(`Async export failed: jobId=${jobId}`, error);
            throw error;
        }
    }
    /**
     * Fetch job status for the polling endpoint.
     */
    async getJobStatus(jobId, requestingUserId) {
        const job = await this.repository.findJobById(jobId);
        if (!job)
            throw new common_1.NotFoundException(`Export job ${jobId} not found`);
        if (job.userId !== requestingUserId) {
            throw new common_1.NotFoundException(`Export job ${jobId} not found`);
        }
        return this.mapEntityToStatusDto(job);
    }
    /**
     * List recent export jobs for a user.
     */
    async listUserJobs(userId) {
        const jobs = await this.repository.findJobsByUser(userId);
        return jobs.map((j) => this.mapEntityToStatusDto(j));
    }
    // ─── CSV Construction ────────────────────────────────────────────────────────
    buildCsvFromRecords(records, options) {
        const columns = this.buildColumns(options);
        const buildOptions = {
            columns,
            delimiter: options.delimiter,
            includeHeader: true,
            nullPlaceholder: '',
        };
        return this.csvBuilder.build(records, buildOptions);
    }
    /**
     * Build the column schema dynamically based on requested metrics and options.
     */
    buildColumns(options) {
        const { dateFormat, timezone, includeMetadata } = options;
        const fmt = (d) => this.csvBuilder.formatDate(d, dateFormat, timezone);
        const base = [
            { key: 'id', header: 'ID' },
            { key: 'metric', header: 'Metric' },
            { key: 'value', header: 'Value', formatter: (v) => String(v) },
            { key: 'unit', header: 'Unit' },
            { key: 'networkId', header: 'Network ID' },
            { key: 'userId', header: 'User ID' },
            { key: 'timestamp', header: 'Timestamp', formatter: fmt },
            { key: 'createdAt', header: 'Created At', formatter: fmt },
        ];
        if (!includeMetadata)
            return base;
        const metricMetaCols = this.buildMetricMetadataColumns(options.metrics);
        return [...base, ...metricMetaCols];
    }
    /**
     * Add flattened metadata columns for each requested metric type.
     */
    buildMetricMetadataColumns(metrics) {
        const allMetrics = metrics.includes(analytics_metric_enum_1.AnalyticsMetric.ALL);
        const cols = [];
        // Gas price columns
        if (allMetrics || metrics.includes(analytics_metric_enum_1.AnalyticsMetric.GAS_PRICE)) {
            cols.push({ key: 'metadata.baseFee', header: 'Base Fee (Gwei)', formatter: (v) => String(v ?? '') }, { key: 'metadata.priorityFee', header: 'Priority Fee (Gwei)', formatter: (v) => String(v ?? '') }, { key: 'metadata.gasLimit', header: 'Gas Limit', formatter: (v) => String(v ?? '') }, { key: 'metadata.blockNumber', header: 'Block Number', formatter: (v) => String(v ?? '') }, { key: 'metadata.networkName', header: 'Network Name', formatter: (v) => String(v ?? '') });
        }
        // Alert columns
        if (allMetrics || metrics.includes(analytics_metric_enum_1.AnalyticsMetric.ALERT_TRIGGERED)) {
            cols.push({ key: 'metadata.alertId', header: 'Alert ID', formatter: (v) => String(v ?? '') }, { key: 'metadata.alertName', header: 'Alert Name', formatter: (v) => String(v ?? '') }, { key: 'metadata.thresholdValue', header: 'Threshold Value', formatter: (v) => String(v ?? '') }, { key: 'metadata.actualValue', header: 'Actual Value', formatter: (v) => String(v ?? '') }, { key: 'metadata.severity', header: 'Severity', formatter: (v) => String(v ?? '') });
        }
        // Fee recommendation columns
        if (allMetrics || metrics.includes(analytics_metric_enum_1.AnalyticsMetric.FEE_RECOMMENDATION)) {
            cols.push({ key: 'metadata.recommendedFee', header: 'Recommended Fee', formatter: (v) => String(v ?? '') }, { key: 'metadata.confidence', header: 'Confidence Score', formatter: (v) => String(v ?? '') }, { key: 'metadata.strategy', header: 'Fee Strategy', formatter: (v) => String(v ?? '') }, { key: 'metadata.estimatedConfirmationTime', header: 'Est. Confirmation (s)', formatter: (v) => String(v ?? '') });
        }
        // Volatility columns
        if (allMetrics || metrics.includes(analytics_metric_enum_1.AnalyticsMetric.VOLATILITY_INDEX)) {
            cols.push({ key: 'metadata.stdDev', header: 'Std Deviation', formatter: (v) => String(v ?? '') }, { key: 'metadata.percentileRank', header: 'Percentile Rank', formatter: (v) => String(v ?? '') }, { key: 'metadata.windowMinutes', header: 'Window (minutes)', formatter: (v) => String(v ?? '') }, { key: 'metadata.trend', header: 'Trend', formatter: (v) => String(v ?? '') });
        }
        return cols;
    }
    // ─── Helpers ─────────────────────────────────────────────────────────────────
    mapDtoToOptions(dto) {
        return {
            metrics: dto.metrics,
            startDate: new Date(dto.startDate),
            endDate: new Date(dto.endDate),
            networkId: dto.networkId,
            userId: dto.userId,
            includeMetadata: dto.includeMetadata ?? true,
            delimiter: dto.delimiter ?? ',',
            dateFormat: dto.dateFormat ?? 'iso',
            timezone: dto.timezone ?? 'UTC',
            limit: dto.limit,
        };
    }
    buildFilename(options) {
        const metrics = options.metrics.join('-');
        const from = options.startDate.toISOString().slice(0, 10);
        const to = options.endDate.toISOString().slice(0, 10);
        return `analytics_${metrics}_${from}_to_${to}.csv`;
    }
    mapEntityToStatusDto(entity) {
        return {
            jobId: entity.id,
            status: entity.status,
            rowCount: entity.rowCount,
            fileSizeBytes: entity.fileSizeBytes,
            downloadUrl: entity.downloadUrl,
            errorMessage: entity.errorMessage,
            createdAt: entity.createdAt.toISOString(),
            completedAt: entity.completedAt?.toISOString() ?? null,
        };
    }
};
exports.AnalyticsExportService = AnalyticsExportService;
exports.AnalyticsExportService = AnalyticsExportService = AnalyticsExportService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, bull_1.InjectQueue)(exports.ANALYTICS_EXPORT_QUEUE)),
    __metadata("design:paramtypes", [analytics_export_repository_1.AnalyticsExportRepository, typeof (_a = typeof csv_builder_util_1.CsvBuilderUtil !== "undefined" && csv_builder_util_1.CsvBuilderUtil) === "function" ? _a : Object, typeof (_b = typeof bull_2.Queue !== "undefined" && bull_2.Queue) === "function" ? _b : Object])
], AnalyticsExportService);
//# sourceMappingURL=analytics-export.service.js.map