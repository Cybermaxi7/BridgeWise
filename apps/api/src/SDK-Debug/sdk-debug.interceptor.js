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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SdkDebugInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const sdk_debug_constants_1 = require("./sdk-debug.constants");
const sdk_debug_service_1 = require("./sdk-debug.service");
const sdk_debug_utils_1 = require("./sdk-debug.utils");
let SdkDebugInterceptor = class SdkDebugInterceptor {
    constructor(debugService) {
        this.debugService = debugService;
    }
    intercept(ctx, next) {
        if (!this.debugService.isEnabled)
            return next.handle();
        const type = ctx.getType();
        if (type === 'http') {
            return this.handleHttp(ctx, next);
        }
        // For RPC / WS just pass through
        return next.handle();
    }
    handleHttp(ctx, next) {
        const req = ctx.switchToHttp().getRequest();
        const res = ctx.switchToHttp().getResponse();
        const traceId = req.headers[sdk_debug_constants_1.SDK_DEBUG_TRACE_ID_HEADER] ??
            (0, sdk_debug_utils_1.generateId)('trace');
        const requestId = req.headers[sdk_debug_constants_1.SDK_DEBUG_REQUEST_ID_HEADER] ??
            (0, sdk_debug_utils_1.generateId)('req');
        // Echo trace ID back in response headers
        res.setHeader(sdk_debug_constants_1.SDK_DEBUG_TRACE_ID_HEADER, traceId);
        res.setHeader(sdk_debug_constants_1.SDK_DEBUG_REQUEST_ID_HEADER, requestId);
        const startTime = Date.now();
        this.debugService.debug(sdk_debug_constants_1.SDK_DEBUG_EVENTS.REQUEST_START, `→ ${req.method} ${req.url}`, {
            traceId,
            requestId,
            method: req.method,
            url: req.url,
            query: req.query,
            headers: this.safeHeaders(req.headers),
            body: req.body,
            ip: req.ip,
            userAgent: req.headers['user-agent'],
        });
        return next.handle().pipe((0, operators_1.tap)(() => {
            const duration = Date.now() - startTime;
            this.debugService.debug(sdk_debug_constants_1.SDK_DEBUG_EVENTS.REQUEST_END, `← ${req.method} ${req.url} [${res.statusCode}] ${duration}ms`, {
                traceId,
                requestId,
                method: req.method,
                url: req.url,
                statusCode: res.statusCode,
                duration,
            });
        }), (0, operators_1.catchError)((err) => {
            const duration = Date.now() - startTime;
            this.debugService.error(sdk_debug_constants_1.SDK_DEBUG_EVENTS.REQUEST_ERROR, `✖ ${req.method} ${req.url} FAILED after ${duration}ms`, err, {
                traceId,
                requestId,
                method: req.method,
                url: req.url,
                duration,
            });
            return (0, rxjs_1.throwError)(() => err);
        }));
    }
    /** Strip Authorization header but keep everything else */
    safeHeaders(headers) {
        const { authorization, Authorization, ...rest } = headers;
        void authorization;
        void Authorization;
        return rest;
    }
};
exports.SdkDebugInterceptor = SdkDebugInterceptor;
exports.SdkDebugInterceptor = SdkDebugInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [sdk_debug_service_1.SdkDebugService])
], SdkDebugInterceptor);
//# sourceMappingURL=sdk-debug.interceptor.js.map