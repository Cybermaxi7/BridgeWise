"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var GlobalExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const api_response_interface_1 = require("../types/api-response.interface");
require("../types/express-extend"); // Extend Express request types
const app_exception_1 = require("../exceptions/app.exception");
const uuid_1 = require("uuid");
/**
 * Global exception filter that catches ALL exceptions and formats responses
 * to the standardized ApiResponse envelope {success, error, timestamp, requestId}
 */
let GlobalExceptionFilter = GlobalExceptionFilter_1 = class GlobalExceptionFilter {
    constructor() {
        this.logger = new common_1.Logger(GlobalExceptionFilter_1.name);
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        // Get requestId from request or generate a fallback
        const requestId = request.id || this.generateRequestId();
        const timestamp = new Date().toISOString();
        let httpStatus = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let apiError = {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Internal server error',
            type: api_response_interface_1.ErrorType.INTERNAL,
            details: { requestId },
        };
        if (exception instanceof app_exception_1.AppException) {
            httpStatus = exception.httpStatus;
            apiError = exception.apiError;
        }
        else if (exception instanceof common_1.HttpException) {
            const mappedException = (0, app_exception_1.mapHttpExceptionToAppException)(exception, requestId);
            httpStatus = mappedException.httpStatus;
            apiError = mappedException.apiError;
        }
        else if (exception instanceof Error) {
            httpStatus = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
            apiError = {
                code: 'INTERNAL_SERVER_ERROR',
                message: exception.message || 'An unexpected error occurred',
                type: api_response_interface_1.ErrorType.INTERNAL,
                details: {
                    requestId,
                    errorName: exception.name,
                    stack: process.env.NODE_ENV === 'development'
                        ? exception.stack
                        : undefined,
                },
            };
        }
        else {
            httpStatus = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
            apiError = {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'An unexpected error occurred',
                type: api_response_interface_1.ErrorType.INTERNAL,
                details: {
                    requestId,
                    error: exception instanceof Error
                        ? exception.message
                        : JSON.stringify(exception),
                },
            };
        }
        this.logError(request, httpStatus, apiError, exception);
        const errorResponse = {
            success: false,
            error: apiError,
            timestamp,
            requestId,
        };
        response.status(httpStatus).json(errorResponse);
    }
    generateRequestId() {
        return (0, uuid_1.v4)();
    }
    logError(request, httpStatus, apiError, exception) {
        const logData = {
            timestamp: new Date().toISOString(),
            method: request.method,
            path: request.path,
            statusCode: httpStatus,
            errorCode: apiError.code,
            errorMessage: apiError.message,
            errorType: apiError.type,
            requestId: apiError.details?.requestId,
        };
        if (httpStatus >= 500) {
            this.logger.error(`Request failed: ${request.method} ${request.path}`, exception instanceof Error
                ? exception.stack
                : JSON.stringify(exception), { meta: logData });
        }
        else {
            this.logger.warn(`Request error: ${request.method} ${request.path}`, JSON.stringify(logData));
        }
    }
};
exports.GlobalExceptionFilter = GlobalExceptionFilter;
exports.GlobalExceptionFilter = GlobalExceptionFilter = GlobalExceptionFilter_1 = __decorate([
    (0, common_1.Catch)()
], GlobalExceptionFilter);
//# sourceMappingURL=global-exception.filter.js.map