import { ExportStatus } from '../enums/export-status.enum';

export class ExportJobResponseDto {
  jobId: string;
  status: ExportStatus;
  message: string;
  statusUrl: string;
  createdAt: string;
}

export class ExportJobStatusDto {
  jobId: string;
  status: ExportStatus;
  rowCount: number | null;
  fileSizeBytes: number | null;
  downloadUrl: string | null;
  errorMessage: string | null;
  createdAt: string;
  completedAt: string | null;
}
