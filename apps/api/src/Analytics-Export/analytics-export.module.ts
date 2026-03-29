import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsExportController } from './analytics-export.controller';
import { AnalyticsExportRepository } from './analytics-export.repository';
import {
  AnalyticsExportService,
  ANALYTICS_EXPORT_QUEUE,
} from './analytics-export.service';
import { ExportJobEntity } from './entities/export-job.entity';
import { AnalyticsExportProcessor } from './processors/analytics-export.processor';
import { CsvBuilderUtil } from './utils/csv-builder.util';

@Module({
  imports: [
    TypeOrmModule.forFeature([ExportJobEntity]),
    BullModule.registerQueue({
      name: ANALYTICS_EXPORT_QUEUE,
      defaultJobOptions: {
        attempts: 3,
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    }),
  ],
  controllers: [AnalyticsExportController],
  providers: [
    AnalyticsExportService,
    AnalyticsExportRepository,
    AnalyticsExportProcessor,
    CsvBuilderUtil,
  ],
  exports: [AnalyticsExportService],
})
export class AnalyticsExportModule {}
