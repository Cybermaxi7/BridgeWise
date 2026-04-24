"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var RequestIdMiddleware_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestIdMiddleware = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
require("../types/express-extend"); // Extend Express request types
/**
 * Middleware that assigns a UUID v4 request id to each incoming request
 * and sets it as response header 'X-Request-Id' for client-side tracing.
 */
let RequestIdMiddleware = RequestIdMiddleware_1 = class RequestIdMiddleware {
    constructor() {
        this.logger = new common_1.Logger(RequestIdMiddleware_1.name);
    }
    use(req, res, next) {
        const requestId = (0, uuid_1.v4)();
        req.id = requestId;
        res.setHeader('X-Request-Id', requestId);
        // Optionally log at debug level
        this.logger.debug(`${req.method} ${req.path} - requestId=${requestId}`);
        next();
    }
};
exports.RequestIdMiddleware = RequestIdMiddleware;
exports.RequestIdMiddleware = RequestIdMiddleware = RequestIdMiddleware_1 = __decorate([
    (0, common_1.Injectable)()
], RequestIdMiddleware);
//# sourceMappingURL=request-id.middleware.js.map