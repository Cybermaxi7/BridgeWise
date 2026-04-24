"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsExportModule = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const analytics_export_controller_1 = require("./analytics-export.controller");
const analytics_export_repository_1 = require("./analytics-export.repository");
const analytics_export_service_1 = require("./analytics-export.service");
const export_job_entity_1 = require("./entities/export-job.entity");
const analytics_export_processor_1 = require("./processors/analytics-export.processor");
const csv_builder_util_1 = require("./utils/csv-builder.util");
let AnalyticsExportModule = class AnalyticsExportModule {
};
exports.AnalyticsExportModule = AnalyticsExportModule;
exports.AnalyticsExportModule = AnalyticsExportModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([export_job_entity_1.ExportJobEntity]),
            bull_1.BullModule.registerQueue({
                name: analytics_export_service_1.ANALYTICS_EXPORT_QUEUE,
                defaultJobOptions: {
                    attempts: 3,
                    removeOnComplete: 100,
                    removeOnFail: 50,
                },
            }),
        ],
        controllers: [analytics_export_controller_1.AnalyticsExportController],
        providers: [
            analytics_export_service_1.AnalyticsExportService,
            analytics_export_repository_1.AnalyticsExportRepository,
            analytics_export_processor_1.AnalyticsExportProcessor,
            csv_builder_util_1.CsvBuilderUtil,
        ],
        exports: [analytics_export_service_1.AnalyticsExportService],
    })
], AnalyticsExportModule);
//# sourceMappingURL=analytics-export.module.js.map