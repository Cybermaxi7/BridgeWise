import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { AnalyticsExportRepository } from './analytics-export.repository';
import { ExportAnalyticsDto } from './dto/export-analytics.dto';
import {
  ExportJobResponseDto,
  ExportJobStatusDto,
} from './dto/export-response.dto';
import { ExportJobEntity } from './entities/export-job.entity';
import { AnalyticsMetric } from './enums/analytics-metric.enum';
import { ExportStatus } from './enums/export-status.enum';
import { AnalyticsRecord } from './interfaces/analytics-record.interface';
import {
  CsvBuildOptions,
  CsvColumn,
  ExportJobPayload,
  ExportOptions,
} from './interfaces/export-options.interface';
import { CsvBuilderUtil } from './utils/csv-builder.util';

export const ANALYTICS_EXPORT_QUEUE = 'analytics-export';

/** Threshold: above this row count, switch to async export */
const SYNC_ROW_LIMIT = 10_000;

@Injectable()
export class AnalyticsExportService {
  private readonly logger = new Logger(AnalyticsExportService.name);

  constructor(
    private readonly repository: AnalyticsExportRepository,
    private readonly csvBuilder: CsvBuilderUtil,
    @InjectQueue(ANALYTICS_EXPORT_QUEUE)
    private readonly exportQueue: Queue<ExportJobPayload>,
  ) {}

  // ─── Public API ─────────────────────────────────────────────────────────────

  /**
   * Generate and stream a CSV directly for small datasets,
   * or enqueue an async job for large ones.
   */
  async initiateExport(
    userId: string,
    dto: ExportAnalyticsDto,
  ): Promise<{ csv: string; filename: string } | ExportJobResponseDto> {
    const options = this.mapDtoToOptions(dto);

    if (dto.async) {
      return this.enqueueExportJob(userId, options);
    }

    const count = await this.repository.countAnalyticsRecords(options);
    if (count > SYNC_ROW_LIMIT) {
      throw new BadRequestException(
        `Dataset too large for synchronous export (${count} rows). ` +
          `Use async=true to queue a background export job.`,
      );
    }

    return this.buildSyncCsv(userId, options);
  }

  /**
   * Build CSV synchronously and return the raw string + suggested filename.
   */
  async buildSyncCsv(
    userId: string,
    options: ExportOptions,
  ): Promise<{ csv: string; filename: string }> {
    const records = await this.repository.fetchAnalyticsRecords(options);
    const csv = this.buildCsvFromRecords(records, options);
    const filename = this.buildFilename(options);

    this.logger.log(
      `Sync CSV export for user=${userId}: ${records.length} rows, ${this.csvBuilder.estimateSize(csv)} bytes`,
    );

    return { csv, filename };
  }

  /**
   * Enqueue an async export job and return the job reference.
   */
  async enqueueExportJob(
    userId: string,
    options: ExportOptions,
  ): Promise<ExportJobResponseDto> {
    const jobEntity = await this.repository.createJob(userId, options);

    const payload: ExportJobPayload = {
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

    await this.repository.updateJobStatus(jobEntity.id, ExportStatus.PENDING, {
      bullJobId: String(bullJob.id),
    });

    return {
      jobId: jobEntity.id,
      status: ExportStatus.PENDING,
      message: 'Export job queued successfully. Poll the status URL for updates.',
      statusUrl: `/analytics/export/jobs/${jobEntity.id}`,
      createdAt: jobEntity.createdAt.toISOString(),
    };
  }

  /**
   * Process an async export job (called from BullMQ processor).
   */
  async processExportJob(payload: ExportJobPayload): Promise<void> {
    const { jobId, userId, options } = payload;

    await this.repository.updateJobStatus(jobId, ExportStatus.PROCESSING);

    try {
      const { csv, filename } = await this.buildSyncCsv(userId, options);
      const sizeBytes = this.csvBuilder.estimateSize(csv);
      const rowCount = csv.split('\n').length - 1; // subtract header

      // In a real system, upload to S3/GCS and store the URL.
      // Here we store the filename as a placeholder for the download URL.
      await this.repository.markJobCompleted(
        jobId,
        rowCount,
        sizeBytes,
        `/analytics/export/jobs/${jobId}/download`,
      );

      this.logger.log(
        `Async export completed: jobId=${jobId}, rows=${rowCount}, size=${sizeBytes}B`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await this.repository.markJobFailed(jobId, message);
      this.logger.error(`Async export failed: jobId=${jobId}`, error);
      throw error;
    }
  }

  /**
   * Fetch job status for the polling endpoint.
   */
  async getJobStatus(jobId: string, requestingUserId: string): Promise<ExportJobStatusDto> {
    const job = await this.repository.findJobById(jobId);
    if (!job) throw new NotFoundException(`Export job ${jobId} not found`);

    if (job.userId !== requestingUserId) {
      throw new NotFoundException(`Export job ${jobId} not found`);
    }

    return this.mapEntityToStatusDto(job);
  }

  /**
   * List recent export jobs for a user.
   */
  async listUserJobs(userId: string): Promise<ExportJobStatusDto[]> {
    const jobs = await this.repository.findJobsByUser(userId);
    return jobs.map((j) => this.mapEntityToStatusDto(j));
  }

  // ─── CSV Construction ────────────────────────────────────────────────────────

  buildCsvFromRecords(records: AnalyticsRecord[], options: ExportOptions): string {
    const columns = this.buildColumns(options);
    const buildOptions: CsvBuildOptions = {
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
  buildColumns(options: ExportOptions): CsvColumn[] {
    const { dateFormat, timezone, includeMetadata } = options;
    const fmt = (d: unknown) =>
      this.csvBuilder.formatDate(d as Date | string, dateFormat, timezone);

    const base: CsvColumn[] = [
      { key: 'id', header: 'ID' },
      { key: 'metric', header: 'Metric' },
      { key: 'value', header: 'Value', formatter: (v) => String(v) },
      { key: 'unit', header: 'Unit' },
      { key: 'networkId', header: 'Network ID' },
      { key: 'userId', header: 'User ID' },
      { key: 'timestamp', header: 'Timestamp', formatter: fmt },
      { key: 'createdAt', header: 'Created At', formatter: fmt },
    ];

    if (!includeMetadata) return base;

    const metricMetaCols = this.buildMetricMetadataColumns(options.metrics);
    return [...base, ...metricMetaCols];
  }

  /**
   * Add flattened metadata columns for each requested metric type.
   */
  private buildMetricMetadataColumns(metrics: AnalyticsMetric[]): CsvColumn[] {
    const allMetrics = metrics.includes(AnalyticsMetric.ALL);
    const cols: CsvColumn[] = [];

    // Gas price columns
    if (allMetrics || metrics.includes(AnalyticsMetric.GAS_PRICE)) {
      cols.push(
        { key: 'metadata.baseFee', header: 'Base Fee (Gwei)', formatter: (v) => String(v ?? '') },
        { key: 'metadata.priorityFee', header: 'Priority Fee (Gwei)', formatter: (v) => String(v ?? '') },
        { key: 'metadata.gasLimit', header: 'Gas Limit', formatter: (v) => String(v ?? '') },
        { key: 'metadata.blockNumber', header: 'Block Number', formatter: (v) => String(v ?? '') },
        { key: 'metadata.networkName', header: 'Network Name', formatter: (v) => String(v ?? '') },
      );
    }

    // Alert columns
    if (allMetrics || metrics.includes(AnalyticsMetric.ALERT_TRIGGERED)) {
      cols.push(
        { key: 'metadata.alertId', header: 'Alert ID', formatter: (v) => String(v ?? '') },
        { key: 'metadata.alertName', header: 'Alert Name', formatter: (v) => String(v ?? '') },
        { key: 'metadata.thresholdValue', header: 'Threshold Value', formatter: (v) => String(v ?? '') },
        { key: 'metadata.actualValue', header: 'Actual Value', formatter: (v) => String(v ?? '') },
        { key: 'metadata.severity', header: 'Severity', formatter: (v) => String(v ?? '') },
      );
    }

    // Fee recommendation columns
    if (allMetrics || metrics.includes(AnalyticsMetric.FEE_RECOMMENDATION)) {
      cols.push(
        { key: 'metadata.recommendedFee', header: 'Recommended Fee', formatter: (v) => String(v ?? '') },
        { key: 'metadata.confidence', header: 'Confidence Score', formatter: (v) => String(v ?? '') },
        { key: 'metadata.strategy', header: 'Fee Strategy', formatter: (v) => String(v ?? '') },
        { key: 'metadata.estimatedConfirmationTime', header: 'Est. Confirmation (s)', formatter: (v) => String(v ?? '') },
      );
    }

    // Volatility columns
    if (allMetrics || metrics.includes(AnalyticsMetric.VOLATILITY_INDEX)) {
      cols.push(
        { key: 'metadata.stdDev', header: 'Std Deviation', formatter: (v) => String(v ?? '') },
        { key: 'metadata.percentileRank', header: 'Percentile Rank', formatter: (v) => String(v ?? '') },
        { key: 'metadata.windowMinutes', header: 'Window (minutes)', formatter: (v) => String(v ?? '') },
        { key: 'metadata.trend', header: 'Trend', formatter: (v) => String(v ?? '') },
      );
    }

    return cols;
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  private mapDtoToOptions(dto: ExportAnalyticsDto): ExportOptions {
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

  private buildFilename(options: ExportOptions): string {
    const metrics = options.metrics.join('-');
    const from = options.startDate.toISOString().slice(0, 10);
    const to = options.endDate.toISOString().slice(0, 10);
    return `analytics_${metrics}_${from}_to_${to}.csv`;
  }

  private mapEntityToStatusDto(entity: ExportJobEntity): ExportJobStatusDto {
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
}
