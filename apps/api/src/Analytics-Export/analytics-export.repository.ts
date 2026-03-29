import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, In, Repository } from 'typeorm';
import { ExportJobEntity } from '../entities/export-job.entity';
import { AnalyticsMetric } from '../enums/analytics-metric.enum';
import { ExportStatus } from '../enums/export-status.enum';
import { AnalyticsRecord } from '../interfaces/analytics-record.interface';
import { ExportOptions } from '../interfaces/export-options.interface';

/**
 * Represents a raw analytics row as stored in the database.
 * Adjust the table name and columns to match your actual schema.
 */
@Injectable()
export class AnalyticsExportRepository {
  private readonly logger = new Logger(AnalyticsExportRepository.name);

  constructor(
    @InjectRepository(ExportJobEntity)
    private readonly exportJobRepo: Repository<ExportJobEntity>,
  ) {}

  // ─── Export Job CRUD ────────────────────────────────────────────────────────

  async createJob(
    userId: string,
    options: ExportOptions,
  ): Promise<ExportJobEntity> {
    const job = this.exportJobRepo.create({
      userId,
      options,
      status: ExportStatus.PENDING,
    });
    return this.exportJobRepo.save(job);
  }

  async findJobById(id: string): Promise<ExportJobEntity | null> {
    return this.exportJobRepo.findOne({ where: { id } });
  }

  async findJobsByUser(userId: string): Promise<ExportJobEntity[]> {
    return this.exportJobRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async updateJobStatus(
    id: string,
    status: ExportStatus,
    extras?: Partial<
      Pick<
        ExportJobEntity,
        'rowCount' | 'fileSizeBytes' | 'downloadUrl' | 'errorMessage' | 'completedAt' | 'bullJobId'
      >
    >,
  ): Promise<void> {
    await this.exportJobRepo.update(id, { status, ...extras });
  }

  async markJobCompleted(
    id: string,
    rowCount: number,
    fileSizeBytes: number,
    downloadUrl?: string,
  ): Promise<void> {
    await this.exportJobRepo.update(id, {
      status: ExportStatus.COMPLETED,
      rowCount,
      fileSizeBytes,
      downloadUrl: downloadUrl ?? null,
      completedAt: new Date(),
    });
  }

  async markJobFailed(id: string, errorMessage: string): Promise<void> {
    await this.exportJobRepo.update(id, {
      status: ExportStatus.FAILED,
      errorMessage,
      completedAt: new Date(),
    });
  }

  // ─── Analytics Data Queries ─────────────────────────────────────────────────

  /**
   * Fetch analytics records from the analytics_events table.
   * This uses a raw query for maximum flexibility and performance.
   */
  async fetchAnalyticsRecords(options: ExportOptions): Promise<AnalyticsRecord[]> {
    const {
      metrics,
      startDate,
      endDate,
      networkId,
      userId,
      limit,
    } = options;

    const hasAllMetrics = metrics.includes(AnalyticsMetric.ALL);

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

    const rows = await qb.getRawMany<AnalyticsRecord>();
    this.logger.debug(`Fetched ${rows.length} analytics records`);
    return rows;
  }

  /**
   * Count how many analytics records match the given options (for progress tracking).
   */
  async countAnalyticsRecords(options: ExportOptions): Promise<number> {
    const { metrics, startDate, endDate, networkId, userId } = options;
    const hasAllMetrics = metrics.includes(AnalyticsMetric.ALL);

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
    if (networkId) qb.andWhere('ae.network_id = :networkId', { networkId });
    if (userId) qb.andWhere('ae.user_id = :userId', { userId });

    const result = await qb.getRawOne<{ count: string }>();
    return parseInt(result?.count ?? '0', 10);
  }
}
