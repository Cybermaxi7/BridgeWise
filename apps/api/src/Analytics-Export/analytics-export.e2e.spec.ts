import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getQueueToken } from '@nestjs/bull';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { AnalyticsExportController } from '../analytics-export.controller';
import { AnalyticsExportRepository } from '../analytics-export.repository';
import {
  AnalyticsExportService,
  ANALYTICS_EXPORT_QUEUE,
} from '../analytics-export.service';
import { ExportJobEntity } from '../entities/export-job.entity';
import { AnalyticsMetric } from '../enums/analytics-metric.enum';
import { ExportStatus } from '../enums/export-status.enum';
import { AnalyticsRecord } from '../interfaces/analytics-record.interface';
import { ExportOptions } from '../interfaces/export-options.interface';
import { CsvBuilderUtil } from '../utils/csv-builder.util';

// ─── Shared fixtures ──────────────────────────────────────────────────────────

const USER_ID = 'e2e-user-001';

const makeRecord = (overrides: Partial<AnalyticsRecord> = {}): AnalyticsRecord => ({
  id: 'rec-e2e-001',
  metric: AnalyticsMetric.GAS_PRICE,
  value: 55.0,
  unit: 'Gwei',
  metadata: {
    baseFee: 50,
    priorityFee: 5,
    blockNumber: 20_000_000,
    networkName: 'mainnet',
    gasLimit: 21_000,
  },
  networkId: 'net-e2e',
  userId: USER_ID,
  timestamp: new Date('2024-06-15T08:00:00.000Z'),
  createdAt: new Date('2024-06-15T08:00:01.000Z'),
  ...overrides,
});

const makeJobEntity = (overrides: Partial<ExportJobEntity> = {}): ExportJobEntity =>
  ({
    id: 'e2e-job-001',
    userId: USER_ID,
    status: ExportStatus.PENDING,
    options: {} as ExportOptions,
    rowCount: null,
    fileSizeBytes: null,
    downloadUrl: null,
    errorMessage: null,
    bullJobId: null,
    createdAt: new Date('2024-06-15T08:00:00.000Z'),
    updatedAt: new Date('2024-06-15T08:00:00.000Z'),
    completedAt: null,
    ...overrides,
  } as ExportJobEntity);

// ─── App bootstrap ────────────────────────────────────────────────────────────

async function createTestApp(): Promise<{
  app: INestApplication;
  analyticsRepo: jest.Mocked<AnalyticsExportRepository>;
}> {
  const analyticsRepo = {
    createJob: jest.fn(),
    findJobById: jest.fn(),
    findJobsByUser: jest.fn(),
    updateJobStatus: jest.fn(),
    markJobCompleted: jest.fn(),
    markJobFailed: jest.fn(),
    fetchAnalyticsRecords: jest.fn(),
    countAnalyticsRecords: jest.fn(),
  } as unknown as jest.Mocked<AnalyticsExportRepository>;

  const mockQueue = { add: jest.fn().mockResolvedValue({ id: 'bull-001' }) };

  const moduleRef: TestingModule = await Test.createTestingModule({
    controllers: [AnalyticsExportController],
    providers: [
      AnalyticsExportService,
      CsvBuilderUtil,
      { provide: AnalyticsExportRepository, useValue: analyticsRepo },
      { provide: getRepositoryToken(ExportJobEntity), useValue: {} },
      { provide: getQueueToken(ANALYTICS_EXPORT_QUEUE), useValue: mockQueue },
    ],
  })
    .overrideGuard(Object)
    .useValue({
      canActivate: (ctx: import('@nestjs/common').ExecutionContext) => {
        const req = ctx.switchToHttp().getRequest();
        req.user = { id: USER_ID };
        return true;
      },
    })
    .compile();

  const app = moduleRef.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  await app.init();

  return { app, analyticsRepo };
}

// ─── Test suite ───────────────────────────────────────────────────────────────

describe('AnalyticsExport — E2E', () => {
  let app: INestApplication;
  let analyticsRepo: jest.Mocked<AnalyticsExportRepository>;

  beforeAll(async () => {
    ({ app, analyticsRepo } = await createTestApp());
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => jest.clearAllMocks());

  // ─── POST /analytics/export (synchronous) ──────────────────────────────────

  describe('POST /analytics/export (sync)', () => {
    const baseQuery = {
      metrics: AnalyticsMetric.GAS_PRICE,
      startDate: '2024-01-01T00:00:00.000Z',
      endDate: '2024-01-31T23:59:59.000Z',
    };

    it('should return 200 with CSV content-type for a small dataset', async () => {
      analyticsRepo.countAnalyticsRecords.mockResolvedValue(2);
      analyticsRepo.fetchAnalyticsRecords.mockResolvedValue([makeRecord(), makeRecord({ id: 'rec-002' })]);

      const res = await request(app.getHttpServer())
        .post('/analytics/export')
        .query(baseQuery)
        .expect(200);

      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.headers['content-disposition']).toContain('.csv');
      expect(res.text).toContain('ID,Metric');
      expect(res.text).toContain('rec-e2e-001');
    });

    it('should include metadata columns in the CSV', async () => {
      analyticsRepo.countAnalyticsRecords.mockResolvedValue(1);
      analyticsRepo.fetchAnalyticsRecords.mockResolvedValue([makeRecord()]);

      const res = await request(app.getHttpServer())
        .post('/analytics/export')
        .query({ ...baseQuery, includeMetadata: 'true' })
        .expect(200);

      expect(res.text).toContain('Base Fee (Gwei)');
      expect(res.text).toContain('Block Number');
    });

    it('should use semicolon delimiter when requested', async () => {
      analyticsRepo.countAnalyticsRecords.mockResolvedValue(1);
      analyticsRepo.fetchAnalyticsRecords.mockResolvedValue([makeRecord()]);

      const res = await request(app.getHttpServer())
        .post('/analytics/export')
        .query({ ...baseQuery, delimiter: ';', includeMetadata: 'false' })
        .expect(200);

      const header = res.text.split('\n')[0];
      expect(header).toContain(';');
    });

    it('should include unix timestamps when dateFormat=unix', async () => {
      analyticsRepo.countAnalyticsRecords.mockResolvedValue(1);
      analyticsRepo.fetchAnalyticsRecords.mockResolvedValue([makeRecord()]);

      const res = await request(app.getHttpServer())
        .post('/analytics/export')
        .query({ ...baseQuery, dateFormat: 'unix', includeMetadata: 'false' })
        .expect(200);

      // Unix timestamp for 2024-06-15T08:00:00Z
      expect(res.text).toContain('1718438400');
    });

    it('should return 400 when dataset exceeds sync limit', async () => {
      analyticsRepo.countAnalyticsRecords.mockResolvedValue(50_000);

      await request(app.getHttpServer())
        .post('/analytics/export')
        .query(baseQuery)
        .expect(400);
    });

    it('should set X-Export-Row-Count response header', async () => {
      analyticsRepo.countAnalyticsRecords.mockResolvedValue(1);
      analyticsRepo.fetchAnalyticsRecords.mockResolvedValue([makeRecord()]);

      const res = await request(app.getHttpServer())
        .post('/analytics/export')
        .query({ ...baseQuery, includeMetadata: 'false' })
        .expect(200);

      expect(res.headers['x-export-row-count']).toBeDefined();
    });

    it('should return 400 for invalid metric value', async () => {
      await request(app.getHttpServer())
        .post('/analytics/export')
        .query({ ...baseQuery, metrics: 'invalid_metric' })
        .expect(400);
    });

    it('should return 400 when endDate is before startDate', async () => {
      await request(app.getHttpServer())
        .post('/analytics/export')
        .query({
          ...baseQuery,
          startDate: '2024-12-31T00:00:00.000Z',
          endDate: '2024-01-01T00:00:00.000Z',
        })
        .expect(400);
    });

    it('should export multiple metric types in a single CSV', async () => {
      analyticsRepo.countAnalyticsRecords.mockResolvedValue(2);
      analyticsRepo.fetchAnalyticsRecords.mockResolvedValue([
        makeRecord({ metric: AnalyticsMetric.GAS_PRICE }),
        makeRecord({ id: 'rec-002', metric: AnalyticsMetric.ALERT_TRIGGERED }),
      ]);

      const res = await request(app.getHttpServer())
        .post('/analytics/export')
        .query({
          metrics: [AnalyticsMetric.GAS_PRICE, AnalyticsMetric.ALERT_TRIGGERED],
          startDate: '2024-01-01T00:00:00.000Z',
          endDate: '2024-01-31T23:59:59.000Z',
          includeMetadata: 'true',
        })
        .expect(200);

      expect(res.text).toContain('Base Fee (Gwei)');
      expect(res.text).toContain('Alert Name');
    });
  });

  // ─── POST /analytics/export (async) ───────────────────────────────────────

  describe('POST /analytics/export (async)', () => {
    it('should return 202 with job reference for async export', async () => {
      analyticsRepo.createJob.mockResolvedValue(makeJobEntity());
      analyticsRepo.updateJobStatus.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .post('/analytics/export')
        .query({
          metrics: AnalyticsMetric.GAS_PRICE,
          startDate: '2024-01-01T00:00:00.000Z',
          endDate: '2024-01-31T23:59:59.000Z',
          async: 'true',
        })
        .expect(202);

      expect(res.body.jobId).toBe('e2e-job-001');
      expect(res.body.status).toBe(ExportStatus.PENDING);
      expect(res.body.statusUrl).toContain('/analytics/export/jobs/');
    });
  });

  // ─── GET /analytics/export/jobs ───────────────────────────────────────────

  describe('GET /analytics/export/jobs', () => {
    it('should list user export jobs', async () => {
      analyticsRepo.findJobsByUser.mockResolvedValue([
        makeJobEntity({ status: ExportStatus.COMPLETED, rowCount: 100 }),
      ]);

      const res = await request(app.getHttpServer())
        .get('/analytics/export/jobs')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0].jobId).toBe('e2e-job-001');
      expect(res.body[0].status).toBe(ExportStatus.COMPLETED);
    });

    it('should return empty array when no jobs exist', async () => {
      analyticsRepo.findJobsByUser.mockResolvedValue([]);

      const res = await request(app.getHttpServer())
        .get('/analytics/export/jobs')
        .expect(200);

      expect(res.body).toEqual([]);
    });
  });

  // ─── GET /analytics/export/jobs/:jobId ────────────────────────────────────

  describe('GET /analytics/export/jobs/:jobId', () => {
    it('should return job status for a valid job ID', async () => {
      analyticsRepo.findJobById.mockResolvedValue(makeJobEntity());

      const res = await request(app.getHttpServer())
        .get('/analytics/export/jobs/e2e-job-001')
        .expect(200);

      expect(res.body.jobId).toBe('e2e-job-001');
      expect(res.body.status).toBe(ExportStatus.PENDING);
    });

    it('should return 404 for an unknown job ID', async () => {
      analyticsRepo.findJobById.mockResolvedValue(null);

      await request(app.getHttpServer())
        .get('/analytics/export/jobs/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });

    it('should return 400 for a non-UUID job ID', async () => {
      await request(app.getHttpServer())
        .get('/analytics/export/jobs/not-a-uuid')
        .expect(400);
    });
  });

  // ─── GET /analytics/export/jobs/:jobId/download ───────────────────────────

  describe('GET /analytics/export/jobs/:jobId/download', () => {
    it('should return CSV for a completed job', async () => {
      analyticsRepo.findJobById.mockResolvedValue(
        makeJobEntity({
          status: ExportStatus.COMPLETED,
          rowCount: 1,
          options: {
            metrics: [AnalyticsMetric.GAS_PRICE],
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-01-31'),
            includeMetadata: false,
            delimiter: ',',
            dateFormat: 'iso',
            timezone: 'UTC',
          } as ExportOptions,
        }),
      );
      analyticsRepo.fetchAnalyticsRecords.mockResolvedValue([makeRecord()]);

      const res = await request(app.getHttpServer())
        .get('/analytics/export/jobs/e2e-job-001/download')
        .expect(200);

      expect(res.headers['content-type']).toContain('text/csv');
    });

    it('should return 409 when job is still processing', async () => {
      analyticsRepo.findJobById.mockResolvedValue(makeJobEntity({ status: ExportStatus.PROCESSING }));

      const res = await request(app.getHttpServer())
        .get('/analytics/export/jobs/e2e-job-001/download')
        .expect(409);

      expect(res.body.status).toBe(ExportStatus.PROCESSING);
    });
  });
});
