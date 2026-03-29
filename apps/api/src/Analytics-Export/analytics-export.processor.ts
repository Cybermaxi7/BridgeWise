import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import {
  AnalyticsExportService,
  ANALYTICS_EXPORT_QUEUE,
} from '../analytics-export.service';
import { ExportJobPayload } from '../interfaces/export-options.interface';

@Processor(ANALYTICS_EXPORT_QUEUE)
export class AnalyticsExportProcessor {
  private readonly logger = new Logger(AnalyticsExportProcessor.name);

  constructor(private readonly exportService: AnalyticsExportService) {}

  @Process('export')
  async handleExport(job: Job<ExportJobPayload>): Promise<void> {
    const { jobId, userId } = job.data;

    this.logger.log(
      `Processing export job: jobId=${jobId}, userId=${userId}, attempt=${job.attemptsMade + 1}`,
    );

    await job.progress(5);

    try {
      await this.exportService.processExportJob(job.data);
      await job.progress(100);
      this.logger.log(`Export job completed: jobId=${jobId}`);
    } catch (error) {
      this.logger.error(
        `Export job failed: jobId=${jobId}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error; // Re-throw so Bull handles retries
    }
  }
}
