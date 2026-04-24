"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SdkDebugMiddleware = void 0;
const common_1 = require("@nestjs/common");
const sdk_debug_constants_1 = require("./sdk-debug.constants");
const sdk_debug_utils_1 = require("./sdk-debug.utils");
/**
 * Middleware that ensures every incoming request has a traceId and requestId.
 * Apply globally in AppModule or selectively per route group.
 *
 * @example
 * // app.module.ts
 * configure(consumer: MiddlewareConsumer) {
 *   consumer.apply(SdkDebugMiddleware).forRoutes('*');
 * }
 */
let SdkDebugMiddleware = class SdkDebugMiddleware {
    use(req, res, next) {
        if (!req.headers[sdk_debug_constants_1.SDK_DEBUG_TRACE_ID_HEADER]) {
            req.headers[sdk_debug_constants_1.SDK_DEBUG_TRACE_ID_HEADER] = (0, sdk_debug_utils_1.generateId)('trace');
        }
        if (!req.headers[sdk_debug_constants_1.SDK_DEBUG_REQUEST_ID_HEADER]) {
            req.headers[sdk_debug_constants_1.SDK_DEBUG_REQUEST_ID_HEADER] = (0, sdk_debug_utils_1.generateId)('req');
        }
        // Expose on res headers too
        res.setHeader(sdk_debug_constants_1.SDK_DEBUG_TRACE_ID_HEADER, req.headers[sdk_debug_constants_1.SDK_DEBUG_TRACE_ID_HEADER]);
        res.setHeader(sdk_debug_constants_1.SDK_DEBUG_REQUEST_ID_HEADER, req.headers[sdk_debug_constants_1.SDK_DEBUG_REQUEST_ID_HEADER]);
        next();
    }
};
exports.SdkDebugMiddleware = SdkDebugMiddleware;
exports.SdkDebugMiddleware = SdkDebugMiddleware = __decorate([
    (0, common_1.Injectable)()
], SdkDebugMiddleware);
//# sourceMappingURL=sdk-debug.middleware.js.map