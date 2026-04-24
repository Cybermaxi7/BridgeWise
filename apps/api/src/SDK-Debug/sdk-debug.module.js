"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var SdkDebugModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SdkDebugModule = void 0;
const common_1 = require("@nestjs/common");
const sdk_debug_constants_1 = require("./sdk-debug.constants");
const sdk_debug_service_1 = require("./sdk-debug.service");
const sdk_debug_interceptor_1 = require("./sdk-debug.interceptor");
const sdk_debug_middleware_1 = require("./sdk-debug.middleware");
let SdkDebugModule = SdkDebugModule_1 = class SdkDebugModule {
    /**
     * Synchronous registration.
     *
     * @example
     * SdkDebugModule.forRoot({
     *   enabled: process.env.NODE_ENV !== 'production',
     *   level: 'debug',
     *   namespace: 'BridgeWise',
     *   colorize: true,
     *   prettyPrint: true,
     *   includeStackTrace: true,
     * })
     */
    static forRoot(options) {
        return {
            module: SdkDebugModule_1,
            providers: [
                { provide: sdk_debug_constants_1.SDK_DEBUG_MODULE_OPTIONS, useValue: options },
                sdk_debug_service_1.SdkDebugService,
                sdk_debug_interceptor_1.SdkDebugInterceptor,
                sdk_debug_middleware_1.SdkDebugMiddleware,
            ],
            exports: [sdk_debug_service_1.SdkDebugService, sdk_debug_interceptor_1.SdkDebugInterceptor, sdk_debug_middleware_1.SdkDebugMiddleware],
        };
    }
    /**
     * Async registration — use when options come from ConfigService or env.
     *
     * @example
     * SdkDebugModule.forRootAsync({
     *   imports: [ConfigModule],
     *   useFactory: (cfg: ConfigService) => ({
     *     enabled: cfg.get<boolean>('SDK_DEBUG_ENABLED', false),
     *     level: cfg.get('SDK_DEBUG_LEVEL', 'debug'),
     *     namespace: cfg.get('SDK_DEBUG_NAMESPACE', 'BridgeWise'),
     *   }),
     *   inject: [ConfigService],
     * })
     */
    static forRootAsync(options) {
        const asyncProviders = SdkDebugModule_1.createAsyncProviders(options);
        return {
            module: SdkDebugModule_1,
            imports: options.imports ?? [],
            providers: [
                ...asyncProviders,
                sdk_debug_service_1.SdkDebugService,
                sdk_debug_interceptor_1.SdkDebugInterceptor,
                sdk_debug_middleware_1.SdkDebugMiddleware,
            ],
            exports: [sdk_debug_service_1.SdkDebugService, sdk_debug_interceptor_1.SdkDebugInterceptor, sdk_debug_middleware_1.SdkDebugMiddleware],
        };
    }
    static createAsyncProviders(options) {
        if (options.useFactory) {
            return [
                {
                    provide: sdk_debug_constants_1.SDK_DEBUG_MODULE_OPTIONS,
                    useFactory: options.useFactory,
                    inject: (options.inject ?? []),
                },
            ];
        }
        const useClass = options.useClass ?? options.useExisting;
        if (useClass) {
            const providers = [
                {
                    provide: sdk_debug_constants_1.SDK_DEBUG_MODULE_OPTIONS,
                    useFactory: async (factory) => factory.createSdkDebugOptions(),
                    inject: [useClass],
                },
            ];
            if (options.useClass) {
                providers.push({
                    provide: useClass,
                    useClass: useClass,
                });
            }
            return providers;
        }
        throw new Error('SdkDebugModule: provide useFactory, useClass, or useExisting');
    }
};
exports.SdkDebugModule = SdkDebugModule;
exports.SdkDebugModule = SdkDebugModule = SdkDebugModule_1 = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({})
], SdkDebugModule);
//# sourceMappingURL=sdk-debug.module.js.map