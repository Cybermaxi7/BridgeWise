"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const throttler_1 = require("@nestjs/throttler");
const typeorm_1 = require("@nestjs/typeorm");
const config_module_1 = require("./config/config.module");
const config_service_1 = require("./config/config.service");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const transactions_module_1 = require("./transactions/transactions.module");
const benchmark_module_1 = require("./benchmark/benchmark.module");
const analytics_module_1 = require("./analytics/analytics.module");
const token_metadata_module_1 = require("./token-metadata/token-metadata.module");
const version_module_1 = require("./version/version.module");
const global_exception_filter_1 = require("./common/filters/global-exception.filter");
const response_interceptor_1 = require("./common/interceptors/response.interceptor");
const logger_module_1 = require("./logger/logger.module");
const transaction_entity_1 = require("./transactions/entities/transaction.entity");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            logger_module_1.LoggerModule,
            config_module_1.ConfigModule,
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_module_1.ConfigModule],
                inject: [config_service_1.ConfigService],
                useFactory: (configService) => {
                    const dbConfig = configService.get('database');
                    return {
                        type: 'postgres',
                        host: dbConfig.host,
                        port: dbConfig.port,
                        username: dbConfig.username,
                        password: dbConfig.password,
                        database: dbConfig.database,
                        ssl: dbConfig.ssl,
                        entities: [transaction_entity_1.Transaction],
                        synchronize: process.env.NODE_ENV === 'development',
                        logging: process.env.NODE_ENV === 'development',
                    };
                },
            }),
            transactions_module_1.TransactionsModule,
            benchmark_module_1.BenchmarkModule,
            analytics_module_1.AnalyticsModule,
            token_metadata_module_1.TokenMetadataModule,
            version_module_1.VersionModule,
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: 60000,
                    limit: 10,
                },
            ]),
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            {
                provide: core_1.APP_FILTER,
                useClass: global_exception_filter_1.GlobalExceptionFilter,
            },
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: response_interceptor_1.ResponseInterceptor,
            },
            app_service_1.AppService,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map