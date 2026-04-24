"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BridgeWiseLogger = void 0;
const common_1 = require("@nestjs/common");
let BridgeWiseLogger = class BridgeWiseLogger {
    setContext(context) {
        this.context = context;
    }
    log(message, ...optionalParams) {
        this.printLog('log', message, optionalParams);
    }
    error(message, ...optionalParams) {
        this.printLog('error', message, optionalParams);
    }
    warn(message, ...optionalParams) {
        this.printLog('warn', message, optionalParams);
    }
    debug(message, ...optionalParams) {
        this.printLog('debug', message, optionalParams);
    }
    verbose(message, ...optionalParams) {
        this.printLog('verbose', message, optionalParams);
    }
    printLog(level, message, optionalParams) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level: level.toUpperCase(),
            context: this.context,
            message,
            metadata: optionalParams.length > 0 ? optionalParams : undefined,
        };
        console.log(JSON.stringify(logEntry));
    }
};
exports.BridgeWiseLogger = BridgeWiseLogger;
exports.BridgeWiseLogger = BridgeWiseLogger = __decorate([
    (0, common_1.Injectable)({ scope: common_1.Scope.TRANSIENT })
], BridgeWiseLogger);
//# sourceMappingURL=logger.service.js.map