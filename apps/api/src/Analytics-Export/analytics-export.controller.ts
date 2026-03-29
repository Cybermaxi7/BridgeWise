import {
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ExportAnalyticsDto } from './dto/export-analytics.dto';
import {
  ExportJobResponseDto,
  ExportJobStatusDto,
} from './dto/export-response.dto';
import { AnalyticsExportService } from './analytics-export.service';
import { ExportStatus } from './enums/export-status.enum';

/**
 * Placeholder JWT guard — swap for your actual AuthGuard.
 * e.g. @UseGuards(JwtAuthGuard)
 */
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // Replace with real JWT validation
    const req = context.switchToHttp().getRequest<Request>();
    return !!(req as Request & { user?: unknown }).user;
  }
}

@Controller('analytics/export')
@UseGuards(AuthGuard)
export class AnalyticsExportController {
  constructor(private readonly exportService: AnalyticsExportService) {}

  /**
   * POST /analytics/export
   *
   * If async=false (default): returns a CSV file download.
   * If async=true: enqueues a background job and returns a job reference.
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  async exportAnalytics(
    @Query() dto: ExportAnalyticsDto,
    @Req() req: Request & { user: { id: string } },
    @Res() res: Response,
  ): Promise<void> {
    const userId = req.user.id;
    const result = await this.exportService.initiateExport(userId, dto);

    if ('csv' in result) {
      // Synchronous: stream CSV directly
      const { csv, filename } = result;
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename}"`,
      );
      res.setHeader('Content-Length', Buffer.byteLength(csv, 'utf8'));
      res.setHeader('X-Export-Row-Count', String(csv.split('\n').length - 1));
      res.send(csv);
    } else {
      // Async: return job info as JSON
      res.setHeader('Content-Type', 'application/json');
      res.status(HttpStatus.ACCEPTED).json(result);
    }
  }

  /**
   * GET /analytics/export/jobs
   *
   * List recent export jobs for the authenticated user.
   */
  @Get('jobs')
  async listJobs(
    @Req() req: Request & { user: { id: string } },
  ): Promise<ExportJobStatusDto[]> {
    return this.exportService.listUserJobs(req.user.id);
  }

  /**
   * GET /analytics/export/jobs/:jobId
   *
   * Poll the status of an async export job.
   */
  @Get('jobs/:jobId')
  async getJobStatus(
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @Req() req: Request & { user: { id: string } },
  ): Promise<ExportJobStatusDto> {
    return this.exportService.getJobStatus(jobId, req.user.id);
  }

  /**
   * GET /analytics/export/jobs/:jobId/download
   *
   * Re-generate and download the CSV for a completed async job.
   * In production, redirect to a presigned S3/GCS URL instead.
   */
  @Get('jobs/:jobId/download')
  async downloadJobResult(
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @Req() req: Request & { user: { id: string } },
    @Res() res: Response,
  ): Promise<void> {
    const job = await this.exportService.getJobStatus(jobId, req.user.id);

    if (job.status !== ExportStatus.COMPLETED) {
      res.status(HttpStatus.CONFLICT).json({
        message: `Job is not completed yet. Current status: ${job.status}`,
        status: job.status,
      });
      return;
    }

    // Retrieve the job entity and re-run the CSV build
    const jobEntity = await this.exportService['repository'].findJobById(jobId);
    if (!jobEntity) {
      res.status(HttpStatus.NOT_FOUND).json({ message: 'Job not found' });
      return;
    }

    const { csv, filename } = await this.exportService.buildSyncCsv(
      req.user.id,
      jobEntity.options,
    );

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', Buffer.byteLength(csv, 'utf8'));
    res.send(csv);
  }
}
