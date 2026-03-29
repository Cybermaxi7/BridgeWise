import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsExportController } from '../analytics-export.controller';
import { AnalyticsExportService } from '../analytics-export.service';
import { ExportAnalyticsDto } from '../dto/export-analytics.dto';
import { ExportJobStatusDto } from '../dto/export-response.dto';
import { AnalyticsMetric } from '../enums/analytics-metric.enum';
import { ExportStatus } from '../enums/export-status.enum';

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockService = () => ({
  initiateExport: jest.fn(),
  getJobStatus: jest.fn(),
  listUserJobs: jest.fn(),
  buildSyncCsv: jest.fn(),
  repository: {
    findJobById: jest.fn(),
  },
});

const makeDto = (overrides: Partial<ExportAnalyticsDto> = {}): ExportAnalyticsDto => ({
  metrics: [AnalyticsMetric.GAS_PRICE],
  startDate: '2024-01-01T00:00:00.000Z',
  endDate: '2024-01-31T23:59:59.000Z',
  includeMetadata: true,
  delimiter: ',',
  dateFormat: 'iso',
  timezone: 'UTC',
  async: false,
  ...overrides,
});

const mockRequest = (userId = 'user-123') => ({
  user: { id: userId },
});

const mockResponse = () => {
  const res: Record<string, jest.Mock> = {};
  res.setHeader = jest.fn().mockReturnValue(res);
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('AnalyticsExportController', () => {
  let controller: AnalyticsExportController;
  let service: ReturnType<typeof mockService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsExportController],
      providers: [{ provide: AnalyticsExportService, useFactory: mockService }],
    })
      .overrideGuard(Object) // bypass AuthGuard
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(AnalyticsExportController);
    service = module.get(AnalyticsExportService);
  });

  // ─── exportAnalytics (sync) ───────────────────────────────────────────────

  describe('exportAnalytics() — synchronous', () => {
    it('should set CSV headers and send the CSV body', async () => {
      const csvPayload = {
        csv: 'ID,Metric\nrec-001,gas_price',
        filename: 'analytics_gas_price_2024-01-01_to_2024-01-31.csv',
      };
      service.initiateExport.mockResolvedValue(csvPayload);

      const req = mockRequest() as never;
      const res = mockResponse() as never;

      await controller.exportAnalytics(makeDto(), req, res);

      expect((res as ReturnType<typeof mockResponse>).setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv; charset=utf-8');
      expect((res as ReturnType<typeof mockResponse>).setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        `attachment; filename="${csvPayload.filename}"`,
      );
      expect((res as ReturnType<typeof mockResponse>).send).toHaveBeenCalledWith(csvPayload.csv);
    });

    it('should set X-Export-Row-Count header', async () => {
      service.initiateExport.mockResolvedValue({
        csv: 'ID\nrec-001\nrec-002',
        filename: 'test.csv',
      });

      const res = mockResponse() as never;
      await controller.exportAnalytics(makeDto(), mockRequest() as never, res);

      expect((res as ReturnType<typeof mockResponse>).setHeader).toHaveBeenCalledWith('X-Export-Row-Count', '2');
    });
  });

  // ─── exportAnalytics (async) ──────────────────────────────────────────────

  describe('exportAnalytics() — asynchronous', () => {
    it('should return 202 ACCEPTED with job info for async export', async () => {
      const jobResponse = {
        jobId: 'job-abc',
        status: ExportStatus.PENDING,
        message: 'Export job queued successfully.',
        statusUrl: '/analytics/export/jobs/job-abc',
        createdAt: new Date().toISOString(),
      };
      service.initiateExport.mockResolvedValue(jobResponse);

      const res = mockResponse() as never;
      await controller.exportAnalytics(makeDto({ async: true }), mockRequest() as never, res);

      expect((res as ReturnType<typeof mockResponse>).status).toHaveBeenCalledWith(202);
      expect((res as ReturnType<typeof mockResponse>).json).toHaveBeenCalledWith(jobResponse);
    });
  });

  // ─── listJobs ─────────────────────────────────────────────────────────────

  describe('listJobs()', () => {
    it('should return the list of user jobs', async () => {
      const jobs: ExportJobStatusDto[] = [
        {
          jobId: 'job-1',
          status: ExportStatus.COMPLETED,
          rowCount: 200,
          fileSizeBytes: 8192,
          downloadUrl: '/download',
          errorMessage: null,
          createdAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
        },
      ];
      service.listUserJobs.mockResolvedValue(jobs);

      const result = await controller.listJobs(mockRequest() as never);

      expect(result).toEqual(jobs);
      expect(service.listUserJobs).toHaveBeenCalledWith('user-123');
    });
  });

  // ─── getJobStatus ─────────────────────────────────────────────────────────

  describe('getJobStatus()', () => {
    it('should delegate to service and return status DTO', async () => {
      const statusDto: ExportJobStatusDto = {
        jobId: 'job-xyz',
        status: ExportStatus.PROCESSING,
        rowCount: null,
        fileSizeBytes: null,
        downloadUrl: null,
        errorMessage: null,
        createdAt: new Date().toISOString(),
        completedAt: null,
      };
      service.getJobStatus.mockResolvedValue(statusDto);

      const result = await controller.getJobStatus('job-xyz', mockRequest() as never);

      expect(result).toEqual(statusDto);
      expect(service.getJobStatus).toHaveBeenCalledWith('job-xyz', 'user-123');
    });
  });

  // ─── downloadJobResult ────────────────────────────────────────────────────

  describe('downloadJobResult()', () => {
    it('should return CSV for a completed job', async () => {
      service.getJobStatus.mockResolvedValue({
        jobId: 'job-done',
        status: ExportStatus.COMPLETED,
      });
      service.repository.findJobById.mockResolvedValue({
        id: 'job-done',
        options: {},
      });
      service.buildSyncCsv.mockResolvedValue({
        csv: 'ID,Metric\nrec-001,gas_price',
        filename: 'test.csv',
      });

      const res = mockResponse() as never;
      await controller.downloadJobResult('job-done', mockRequest() as never, res);

      expect((res as ReturnType<typeof mockResponse>).setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv; charset=utf-8');
      expect((res as ReturnType<typeof mockResponse>).send).toHaveBeenCalled();
    });

    it('should return 409 Conflict when job is not completed', async () => {
      service.getJobStatus.mockResolvedValue({
        jobId: 'job-pending',
        status: ExportStatus.PROCESSING,
      });

      const res = mockResponse() as never;
      await controller.downloadJobResult('job-pending', mockRequest() as never, res);

      expect((res as ReturnType<typeof mockResponse>).status).toHaveBeenCalledWith(409);
      expect((res as ReturnType<typeof mockResponse>).json).toHaveBeenCalledWith(
        expect.objectContaining({ status: ExportStatus.PROCESSING }),
      );
    });
  });
});
