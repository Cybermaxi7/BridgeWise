import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SelectQueryBuilder } from 'typeorm';
import { AnalyticsExportRepository } from '../analytics-export.repository';
import { ExportJobEntity } from '../entities/export-job.entity';
import { AnalyticsMetric } from '../enums/analytics-metric.enum';
import { ExportStatus } from '../enums/export-status.enum';
import { ExportOptions } from '../interfaces/export-options.interface';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const USER_ID = 'user-aaa';

const makeOptions = (overrides: Partial<ExportOptions> = {}): ExportOptions => ({
  metrics: [AnalyticsMetric.GAS_PRICE],
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-31'),
  includeMetadata: true,
  delimiter: ',',
  dateFormat: 'iso',
  timezone: 'UTC',
  ...overrides,
});

const makeJobEntity = (overrides: Partial<ExportJobEntity> = {}): ExportJobEntity =>
  ({
    id: 'job-1',
    userId: USER_ID,
    status: ExportStatus.PENDING,
    options: makeOptions(),
    rowCount: null,
    fileSizeBytes: null,
    downloadUrl: null,
    errorMessage: null,
    bullJobId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    completedAt: null,
    ...overrides,
  } as ExportJobEntity);

// ─── QueryBuilder mock ────────────────────────────────────────────────────────

const makeQb = (rawResult: unknown[] = [], countResult: { count: string } = { count: '0' }) => {
  const qb: Partial<SelectQueryBuilder<ExportJobEntity>> = {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    getRawMany: jest.fn().mockResolvedValue(rawResult),
    getRawOne: jest.fn().mockResolvedValue(countResult),
  };
  return qb as SelectQueryBuilder<ExportJobEntity>;
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('AnalyticsExportRepository', () => {
  let repo: AnalyticsExportRepository;
  let typeormRepo: {
    create: jest.Mock;
    save: jest.Mock;
    findOne: jest.Mock;
    find: jest.Mock;
    update: jest.Mock;
    manager: { createQueryBuilder: jest.Mock };
  };

  beforeEach(async () => {
    const qb = makeQb();

    typeormRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      update: jest.fn(),
      manager: { createQueryBuilder: jest.fn().mockReturnValue(qb) },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsExportRepository,
        {
          provide: getRepositoryToken(ExportJobEntity),
          useValue: typeormRepo,
        },
      ],
    }).compile();

    repo = module.get(AnalyticsExportRepository);
  });

  // ─── createJob ──────────────────────────────────────────────────────────────

  describe('createJob()', () => {
    it('should create and save a new export job entity', async () => {
      const entity = makeJobEntity();
      typeormRepo.create.mockReturnValue(entity);
      typeormRepo.save.mockResolvedValue(entity);

      const result = await repo.createJob(USER_ID, makeOptions());

      expect(typeormRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: USER_ID, status: ExportStatus.PENDING }),
      );
      expect(typeormRepo.save).toHaveBeenCalledWith(entity);
      expect(result).toEqual(entity);
    });
  });

  // ─── findJobById ────────────────────────────────────────────────────────────

  describe('findJobById()', () => {
    it('should return entity when found', async () => {
      typeormRepo.findOne.mockResolvedValue(makeJobEntity());
      const result = await repo.findJobById('job-1');
      expect(result).not.toBeNull();
      expect(result?.id).toBe('job-1');
    });

    it('should return null when not found', async () => {
      typeormRepo.findOne.mockResolvedValue(null);
      const result = await repo.findJobById('missing');
      expect(result).toBeNull();
    });
  });

  // ─── findJobsByUser ─────────────────────────────────────────────────────────

  describe('findJobsByUser()', () => {
    it('should return a list of jobs for the given user', async () => {
      typeormRepo.find.mockResolvedValue([makeJobEntity(), makeJobEntity({ id: 'job-2' })]);
      const results = await repo.findJobsByUser(USER_ID);
      expect(results).toHaveLength(2);
    });

    it('should return empty array when user has no jobs', async () => {
      typeormRepo.find.mockResolvedValue([]);
      const results = await repo.findJobsByUser(USER_ID);
      expect(results).toEqual([]);
    });
  });

  // ─── updateJobStatus ────────────────────────────────────────────────────────

  describe('updateJobStatus()', () => {
    it('should call update with the given status', async () => {
      typeormRepo.update.mockResolvedValue({ affected: 1 });
      await repo.updateJobStatus('job-1', ExportStatus.PROCESSING);
      expect(typeormRepo.update).toHaveBeenCalledWith('job-1', { status: ExportStatus.PROCESSING });
    });

    it('should merge extra fields when provided', async () => {
      typeormRepo.update.mockResolvedValue({ affected: 1 });
      await repo.updateJobStatus('job-1', ExportStatus.PENDING, { bullJobId: 'bull-99' });
      expect(typeormRepo.update).toHaveBeenCalledWith('job-1', {
        status: ExportStatus.PENDING,
        bullJobId: 'bull-99',
      });
    });
  });

  // ─── markJobCompleted ───────────────────────────────────────────────────────

  describe('markJobCompleted()', () => {
    it('should update status to COMPLETED with row count, size, and URL', async () => {
      typeormRepo.update.mockResolvedValue({ affected: 1 });

      await repo.markJobCompleted('job-1', 500, 20480, '/download/job-1');

      expect(typeormRepo.update).toHaveBeenCalledWith(
        'job-1',
        expect.objectContaining({
          status: ExportStatus.COMPLETED,
          rowCount: 500,
          fileSizeBytes: 20480,
          downloadUrl: '/download/job-1',
          completedAt: expect.any(Date),
        }),
      );
    });

    it('should set downloadUrl to null when not provided', async () => {
      typeormRepo.update.mockResolvedValue({ affected: 1 });
      await repo.markJobCompleted('job-1', 0, 0);
      expect(typeormRepo.update).toHaveBeenCalledWith(
        'job-1',
        expect.objectContaining({ downloadUrl: null }),
      );
    });
  });

  // ─── markJobFailed ──────────────────────────────────────────────────────────

  describe('markJobFailed()', () => {
    it('should update status to FAILED with error message', async () => {
      typeormRepo.update.mockResolvedValue({ affected: 1 });
      await repo.markJobFailed('job-1', 'Connection timeout');
      expect(typeormRepo.update).toHaveBeenCalledWith(
        'job-1',
        expect.objectContaining({
          status: ExportStatus.FAILED,
          errorMessage: 'Connection timeout',
          completedAt: expect.any(Date),
        }),
      );
    });
  });

  // ─── fetchAnalyticsRecords ──────────────────────────────────────────────────

  describe('fetchAnalyticsRecords()', () => {
    it('should call createQueryBuilder and return raw results', async () => {
      const rawRecords = [{ id: 'rec-001', metric: 'gas_price' }];
      const qb = makeQb(rawRecords);
      typeormRepo.manager.createQueryBuilder.mockReturnValue(qb);

      const results = await repo.fetchAnalyticsRecords(makeOptions());

      expect(qb.from).toHaveBeenCalledWith('analytics_events', 'ae');
      expect(results).toEqual(rawRecords);
    });

    it('should skip metric filter when metrics includes ALL', async () => {
      const qb = makeQb([]);
      typeormRepo.manager.createQueryBuilder.mockReturnValue(qb);

      await repo.fetchAnalyticsRecords(makeOptions({ metrics: [AnalyticsMetric.ALL] }));

      expect(qb.andWhere).not.toHaveBeenCalledWith(
        expect.stringContaining('metric IN'),
        expect.anything(),
      );
    });

    it('should apply networkId filter when provided', async () => {
      const qb = makeQb([]);
      typeormRepo.manager.createQueryBuilder.mockReturnValue(qb);

      await repo.fetchAnalyticsRecords(makeOptions({ networkId: 'net-42' }));

      expect(qb.andWhere).toHaveBeenCalledWith('ae.network_id = :networkId', { networkId: 'net-42' });
    });

    it('should apply limit when provided', async () => {
      const qb = makeQb([]);
      typeormRepo.manager.createQueryBuilder.mockReturnValue(qb);

      await repo.fetchAnalyticsRecords(makeOptions({ limit: 100 }));

      expect(qb.limit).toHaveBeenCalledWith(100);
    });
  });

  // ─── countAnalyticsRecords ──────────────────────────────────────────────────

  describe('countAnalyticsRecords()', () => {
    it('should return parsed integer count', async () => {
      const qb = makeQb([], { count: '750' });
      typeormRepo.manager.createQueryBuilder.mockReturnValue(qb);

      const count = await repo.countAnalyticsRecords(makeOptions());

      expect(count).toBe(750);
    });

    it('should return 0 when count result is undefined', async () => {
      const qb = makeQb([], undefined as never);
      typeormRepo.manager.createQueryBuilder.mockReturnValue(qb);

      const count = await repo.countAnalyticsRecords(makeOptions());

      expect(count).toBe(0);
    });
  });
});
