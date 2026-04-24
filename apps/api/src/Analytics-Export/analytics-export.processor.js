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
var AnalyticsExportProcessor_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsExportProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const bull_2 = require("bull");
const analytics_export_service_1 = require("../analytics-export.service");
let AnalyticsExportProcessor = AnalyticsExportProcessor_1 = class AnalyticsExportProcessor {
    constructor(exportService) {
        this.exportService = exportService;
        this.logger = new common_1.Logger(AnalyticsExportProcessor_1.name);
    }
    async handleExport(job) {
        const { jobId, userId } = job.data;
        this.logger.log(`Processing export job: jobId=${jobId}, userId=${userId}, attempt=${job.attemptsMade + 1}`);
        await job.progress(5);
        try {
            await this.exportService.processExportJob(job.data);
            await job.progress(100);
            this.logger.log(`Export job completed: jobId=${jobId}`);
        }
        catch (error) {
            this.logger.error(`Export job failed: jobId=${jobId}`, error instanceof Error ? error.stack : String(error));
            throw error; // Re-throw so Bull handles retries
        }
    }
};
exports.AnalyticsExportProcessor = AnalyticsExportProcessor;
__decorate([
    (0, bull_1.Process)('export'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof bull_2.Job !== "undefined" && bull_2.Job) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], AnalyticsExportProcessor.prototype, "handleExport", null);
exports.AnalyticsExportProcessor = AnalyticsExportProcessor = AnalyticsExportProcessor_1 = __decorate([
    (0, bull_1.Processor)(analytics_export_service_1.ANALYTICS_EXPORT_QUEUE),
    __metadata("design:paramtypes", [typeof (_a = typeof analytics_export_service_1.AnalyticsExportService !== "undefined" && analytics_export_service_1.AnalyticsExportService) === "function" ? _a : Object])
], AnalyticsExportProcessor);
//# sourceMappingURL=analytics-export.processor.js.map