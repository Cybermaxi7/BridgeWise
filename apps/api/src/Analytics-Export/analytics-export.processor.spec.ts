import { Test, TestingModule } from '@nestjs/testing';
import { Job } from 'bull';
import {
  AnalyticsExportService,
  ANALYTICS_EXPORT_QUEUE,
} from '../analytics-export.service';
import { AnalyticsMetric } from '../enums/analytics-metric.enum';
import { ExportJobPayload } from '../interfaces/export-options.interface';
import { AnalyticsExportProcessor } from '../processors/analytics-export.processor';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const makePayload = (): ExportJobPayload => ({
  jobId: 'proc-job-001',
  userId: 'user-proc',
  options: {
    metrics: [AnalyticsMetric.GAS_PRICE],
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-31'),
    includeMetadata: true,
    delimiter: ',',
    dateFormat: 'iso',
    timezone: 'UTC',
  },
  requestedAt: new Date().toISOString(),
});

const makeJob = (data: ExportJobPayload): Partial<Job<ExportJobPayload>> => ({
  data,
  attemptsMade: 0,
  progress: jest.fn(),
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('AnalyticsExportProcessor', () => {
  let processor: AnalyticsExportProcessor;
  let service: { processExportJob: jest.Mock };

  beforeEach(async () => {
    service = { processExportJob: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsExportProcessor,
        { provide: AnalyticsExportService, useValue: service },
      ],
    }).compile();

    processor = module.get(AnalyticsExportProcessor);
  });

  it('should call processExportJob with the job payload', async () => {
    service.processExportJob.mockResolvedValue(undefined);
    const job = makeJob(makePayload()) as Job<ExportJobPayload>;

    await processor.handleExport(job);

    expect(service.processExportJob).toHaveBeenCalledWith(job.data);
  });

  it('should set job progress to 5 before processing', async () => {
    service.processExportJob.mockResolvedValue(undefined);
    const job = makeJob(makePayload()) as Job<ExportJobPayload>;

    await processor.handleExport(job);

    expect(job.progress).toHaveBeenCalledWith(5);
  });

  it('should set job progress to 100 on success', async () => {
    service.processExportJob.mockResolvedValue(undefined);
    const job = makeJob(makePayload()) as Job<ExportJobPayload>;

    await processor.handleExport(job);

    expect(job.progress).toHaveBeenCalledWith(100);
  });

  it('should rethrow errors so Bull can handle retries', async () => {
    service.processExportJob.mockRejectedValue(new Error('Disk full'));
    const job = makeJob(makePayload()) as Job<ExportJobPayload>;

    await expect(processor.handleExport(job)).rejects.toThrow('Disk full');
  });

  it('should not set progress to 100 when an error occurs', async () => {
    service.processExportJob.mockRejectedValue(new Error('fail'));
    const job = makeJob(makePayload()) as Job<ExportJobPayload>;

    try {
      await processor.handleExport(job);
    } catch {
      // expected
    }

    expect(job.progress).not.toHaveBeenCalledWith(100);
  });
});
