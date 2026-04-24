"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsExportController = void 0;
const common_1 = require("@nestjs/common");
const export_analytics_dto_1 = require("./dto/export-analytics.dto");
const analytics_export_service_1 = require("./analytics-export.service");
const export_status_enum_1 = require("./enums/export-status.enum");
/**
 * Placeholder JWT guard — swap for your actual AuthGuard.
 * e.g. @UseGuards(JwtAuthGuard)
 */
const common_2 = require("@nestjs/common");
let AuthGuard = class AuthGuard {
    canActivate(context) {
        // Replace with real JWT validation
        const req = context.switchToHttp().getRequest();
        return !!req.user;
    }
};
AuthGuard = __decorate([
    (0, common_2.Injectable)()
], AuthGuard);
let AnalyticsExportController = class AnalyticsExportController {
    constructor(exportService) {
        this.exportService = exportService;
    }
    /**
     * POST /analytics/export
     *
     * If async=false (default): returns a CSV file download.
     * If async=true: enqueues a background job and returns a job reference.
     */
    async exportAnalytics(dto, req, res) {
        const userId = req.user.id;
        const result = await this.exportService.initiateExport(userId, dto);
        if ('csv' in result) {
            // Synchronous: stream CSV directly
            const { csv, filename } = result;
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-Length', Buffer.byteLength(csv, 'utf8'));
            res.setHeader('X-Export-Row-Count', String(csv.split('\n').length - 1));
            res.send(csv);
        }
        else {
            // Async: return job info as JSON
            res.setHeader('Content-Type', 'application/json');
            res.status(common_1.HttpStatus.ACCEPTED).json(result);
        }
    }
    /**
     * GET /analytics/export/jobs
     *
     * List recent export jobs for the authenticated user.
     */
    async listJobs(req) {
        return this.exportService.listUserJobs(req.user.id);
    }
    /**
     * GET /analytics/export/jobs/:jobId
     *
     * Poll the status of an async export job.
     */
    async getJobStatus(jobId, req) {
        return this.exportService.getJobStatus(jobId, req.user.id);
    }
    /**
     * GET /analytics/export/jobs/:jobId/download
     *
     * Re-generate and download the CSV for a completed async job.
     * In production, redirect to a presigned S3/GCS URL instead.
     */
    async downloadJobResult(jobId, req, res) {
        const job = await this.exportService.getJobStatus(jobId, req.user.id);
        if (job.status !== export_status_enum_1.ExportStatus.COMPLETED) {
            res.status(common_1.HttpStatus.CONFLICT).json({
                message: `Job is not completed yet. Current status: ${job.status}`,
                status: job.status,
            });
            return;
        }
        // Retrieve the job entity and re-run the CSV build
        const jobEntity = await this.exportService['repository'].findJobById(jobId);
        if (!jobEntity) {
            res.status(common_1.HttpStatus.NOT_FOUND).json({ message: 'Job not found' });
            return;
        }
        const { csv, filename } = await this.exportService.buildSyncCsv(req.user.id, jobEntity.options);
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', Buffer.byteLength(csv, 'utf8'));
        res.send(csv);
    }
};
exports.AnalyticsExportController = AnalyticsExportController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_a = typeof export_analytics_dto_1.ExportAnalyticsDto !== "undefined" && export_analytics_dto_1.ExportAnalyticsDto) === "function" ? _a : Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AnalyticsExportController.prototype, "exportAnalytics", null);
__decorate([
    (0, common_1.Get)('jobs'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnalyticsExportController.prototype, "listJobs", null);
__decorate([
    (0, common_1.Get)('jobs/:jobId'),
    __param(0, (0, common_1.Param)('jobId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AnalyticsExportController.prototype, "getJobStatus", null);
__decorate([
    (0, common_1.Get)('jobs/:jobId/download'),
    __param(0, (0, common_1.Param)('jobId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AnalyticsExportController.prototype, "downloadJobResult", null);
exports.AnalyticsExportController = AnalyticsExportController = __decorate([
    (0, common_1.Controller)('analytics/export'),
    (0, common_1.UseGuards)(AuthGuard),
    __metadata("design:paramtypes", [analytics_export_service_1.AnalyticsExportService])
], AnalyticsExportController);
//# sourceMappingURL=analytics-export.controller.js.map