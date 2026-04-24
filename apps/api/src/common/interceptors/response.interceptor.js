"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ResponseInterceptor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
require("../types/express-extend"); // Extend Express request types
const uuid_1 = require("uuid");
/**
 * Global response interceptor to wrap successful responses into the
 * standardized ApiResponse envelope {success, data, timestamp, requestId}
 */
let ResponseInterceptor = ResponseInterceptor_1 = class ResponseInterceptor {
    constructor() {
        this.logger = new common_1.Logger(ResponseInterceptor_1.name);
    }
    intercept(context, next) {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest();
        const response = ctx.getResponse();
        const requestId = request.id || this.generateRequestId();
        const timestamp = new Date().toISOString();
        request.id = requestId;
        request.timestamp = timestamp;
        return next.handle().pipe((0, operators_1.map)((data) => {
            if (this.isApiResponse(data)) {
                return data;
            }
            const apiResponse = {
                success: true,
                data: data || null,
                timestamp,
                requestId,
            };
            this.logSuccess(request, response, requestId);
            return apiResponse;
        }));
    }
    isApiResponse(data) {
        return (typeof data === 'object' &&
            data !== null &&
            'success' in data &&
            'timestamp' in data &&
            'requestId' in data);
    }
    generateRequestId() {
        return (0, uuid_1.v4)();
    }
    logSuccess(request, response, requestId) {
        this.logger.debug(`${request.method} ${request.path} - ${response.statusCode}`, requestId);
    }
};
exports.ResponseInterceptor = ResponseInterceptor;
exports.ResponseInterceptor = ResponseInterceptor = ResponseInterceptor_1 = __decorate([
    (0, common_1.Injectable)()
], ResponseInterceptor);
//# sourceMappingURL=response.interceptor.js.map