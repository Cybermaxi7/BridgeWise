"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var SdkDebugService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SdkDebugService = void 0;
const common_1 = require("@nestjs/common");
const os = __importStar(require("os"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const event_emitter_1 = require("@nestjs/event-emitter");
const sdk_debug_constants_1 = require("./sdk-debug.constants");
const sdk_debug_types_1 = require("./sdk-debug.types");
const sdk_debug_utils_1 = require("./sdk-debug.utils");
let SdkDebugService = SdkDebugService_1 = class SdkDebugService {
    constructor(options, eventEmitter) {
        this.options = options;
        this.eventEmitter = eventEmitter;
        this.nestLogger = new common_1.Logger(SdkDebugService_1.name);
        this.systemInfo = {
            hostname: os.hostname(),
            pid: process.pid,
            nodeVersion: process.version,
            platform: process.platform,
        };
        this.stats = {
            totalLogs: 0,
            logsByLevel: {
                verbose: 0,
                debug: 0,
                info: 0,
                warn: 0,
                error: 0,
            },
            logsByEvent: {},
            averageRequestDurationMs: 0,
            errorRate: 0,
            sampledOut: 0,
        };
    }
    // ---------------------------------------------------------------------------
    // Public API
    // ---------------------------------------------------------------------------
    verbose(event, message, meta) {
        this.emit(sdk_debug_constants_1.SDK_DEBUG_LOG_LEVELS.VERBOSE, event, message, meta);
    }
    debug(event, message, meta) {
        this.emit(sdk_debug_constants_1.SDK_DEBUG_LOG_LEVELS.DEBUG, event, message, meta);
    }
    info(event, message, meta) {
        this.emit(sdk_debug_constants_1.SDK_DEBUG_LOG_LEVELS.INFO, event, message, meta);
    }
    warn(event, message, meta) {
        this.emit(sdk_debug_constants_1.SDK_DEBUG_LOG_LEVELS.WARN, event, message, meta);
    }
    error(event, message, error, meta) {
        const errorInfo = error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: this.options.includeStackTrace ? error.stack : undefined,
                code: error.code,
            }
            : error
                ? { name: 'UnknownError', message: String(error) }
                : undefined;
        this.emit(sdk_debug_constants_1.SDK_DEBUG_LOG_LEVELS.ERROR, event, message, meta, errorInfo);
    }
    /**
     * Start a timed operation. Returns a finish() function that logs the result.
     */
    time(event, label, meta) {
        const start = Date.now();
        const traceId = (0, sdk_debug_utils_1.generateId)('trace');
        this.debug(event, `⏱  START ${label}`, { traceId, ...meta });
        return (resultMeta) => {
            const duration = Date.now() - start;
            this.updateAverageRequestDuration(duration);
            this.debug(event, `⏱  END ${label} [${duration}ms]`, {
                traceId,
                duration,
                ...resultMeta,
            });
        };
    }
    /**
     * Wrap an async fn with automatic start/end/error debug logs.
     */
    async trace(event, label, fn, meta) {
        const finish = this.time(event, label, meta);
        try {
            const result = await fn();
            finish({ success: true });
            return result;
        }
        catch (err) {
            finish({ success: false });
            this.error(event, `TRACE ERROR: ${label}`, err, meta);
            throw err;
        }
    }
    /** Retrieve runtime stats */
    getStats() {
        return { ...this.stats };
    }
    /** Check if debug is active */
    get isEnabled() {
        return this.options.enabled;
    }
    // ---------------------------------------------------------------------------
    // Internal
    // ---------------------------------------------------------------------------
    emit(level, event, message, meta, errorInfo) {
        if (!this.options.enabled)
            return;
        const minLevel = this.options.level ?? sdk_debug_constants_1.SDK_DEBUG_LOG_LEVELS.DEBUG;
        if (!(0, sdk_debug_utils_1.isLevelEnabled)(level, minLevel))
            return;
        const suppressedEvents = this.options.suppressedEvents ?? [];
        if (suppressedEvents.includes(event))
            return;
        const samplingRate = this.options.samplingRate ?? 1;
        if (!(0, sdk_debug_utils_1.shouldSample)(samplingRate)) {
            this.stats.sampledOut++;
            return;
        }
        const entry = this.buildEntry(level, event, message, meta, errorInfo);
        this.updateStats(entry);
        this.dispatch(entry);
    }
    buildEntry(level, event, message, meta, errorInfo) {
        const sensitiveKeys = this.options.sensitiveKeys ?? [];
        const maxDepth = this.options.maxDepth ?? 8;
        const maxStringLength = this.options.maxStringLength ?? 2048;
        const mergedMeta = {
            ...this.options.globalMeta,
            ...meta,
        };
        const sanitizedMeta = (0, sdk_debug_utils_1.sanitize)(mergedMeta, sensitiveKeys, maxDepth, maxStringLength);
        const entry = {
            timestamp: new Date().toISOString(),
            level,
            namespace: this.options.namespace,
            event,
            message,
            meta: Object.keys(sanitizedMeta).length ? sanitizedMeta : undefined,
            error: errorInfo,
        };
        if (this.options.includeSystemInfo) {
            entry.system = this.systemInfo;
        }
        if (this.options.includeMemoryUsage) {
            entry.memory = this.captureMemory();
        }
        return entry;
    }
    dispatch(entry) {
        const transports = this.options.transports ?? [
            { type: sdk_debug_constants_1.SDK_DEBUG_TRANSPORT.CONSOLE },
        ];
        for (const transport of transports) {
            try {
                switch (transport.type) {
                    case sdk_debug_constants_1.SDK_DEBUG_TRANSPORT.CONSOLE:
                        this.writeConsole(entry);
                        break;
                    case sdk_debug_constants_1.SDK_DEBUG_TRANSPORT.FILE:
                        if (transport.filePath)
                            this.writeFile(entry, transport.filePath);
                        break;
                    case sdk_debug_constants_1.SDK_DEBUG_TRANSPORT.HTTP:
                        if (transport.endpoint)
                            this.writeHttp(entry, transport.endpoint, transport.headers);
                        break;
                    case sdk_debug_constants_1.SDK_DEBUG_TRANSPORT.CUSTOM:
                        if (transport.handler) {
                            Promise.resolve(transport.handler(entry)).catch((err) => this.nestLogger.error('Custom transport error', err));
                        }
                        break;
                }
            }
            catch (err) {
                this.nestLogger.error(`Transport ${transport.type} failed`, err);
            }
        }
        if (this.options.emitEvents && this.eventEmitter) {
            this.eventEmitter.emit(entry.event, entry);
        }
    }
    // ---------------------------------------------------------------------------
    // Transport implementations
    // ---------------------------------------------------------------------------
    writeConsole(entry) {
        const format = this.options.format ?? sdk_debug_constants_1.SDK_DEBUG_FORMAT.PRETTY;
        const useColor = this.options.colorize !== false;
        if (format === sdk_debug_constants_1.SDK_DEBUG_FORMAT.JSON) {
            process.stdout.write(JSON.stringify(entry) + '\n');
            return;
        }
        if (format === sdk_debug_constants_1.SDK_DEBUG_FORMAT.COMPACT) {
            const ns = entry.namespace ? `[${entry.namespace}] ` : '';
            const dur = entry.duration ? ` (${entry.duration}ms)` : '';
            process.stdout.write(`${entry.timestamp} ${entry.level.toUpperCase()} ${ns}${entry.event}: ${entry.message}${dur}\n`);
            return;
        }
        // Pretty format
        const ts = useColor
            ? (0, sdk_debug_utils_1.colorize)(entry.timestamp, 'gray')
            : entry.timestamp;
        const lvl = useColor
            ? (0, sdk_debug_utils_1.colorize)(entry.level.toUpperCase().padEnd(7), (0, sdk_debug_utils_1.levelColor)(entry.level), 'bold')
            : entry.level.toUpperCase().padEnd(7);
        const ns = entry.namespace
            ? useColor
                ? (0, sdk_debug_utils_1.colorize)(`[${entry.namespace}]`, 'magenta')
                : `[${entry.namespace}]`
            : '';
        const evt = useColor
            ? (0, sdk_debug_utils_1.colorize)(entry.event, 'cyan')
            : entry.event;
        const msg = useColor
            ? (0, sdk_debug_utils_1.colorize)(entry.message, 'white', 'bold')
            : entry.message;
        let line = `${ts} ${lvl} ${ns} ${evt} → ${msg}`;
        if (entry.meta && Object.keys(entry.meta).length) {
            const metaStr = this.options.prettyPrint
                ? '\n' + JSON.stringify(entry.meta, null, 2)
                : ' ' + JSON.stringify(entry.meta);
            line += useColor ? (0, sdk_debug_utils_1.colorize)(metaStr, 'dim') : metaStr;
        }
        if (entry.error) {
            const errStr = `\n  ERROR: ${entry.error.name}: ${entry.error.message}`;
            line += useColor ? (0, sdk_debug_utils_1.colorize)(errStr, 'red') : errStr;
            if (entry.error.stack) {
                const stackStr = '\n' + entry.error.stack;
                line += useColor ? (0, sdk_debug_utils_1.colorize)(stackStr, 'gray') : stackStr;
            }
        }
        if (entry.memory) {
            line += useColor
                ? (0, sdk_debug_utils_1.colorize)(` [heap: ${entry.memory.heapUsedMB}/${entry.memory.heapTotalMB} MB]`, 'dim')
                : ` [heap: ${entry.memory.heapUsedMB}/${entry.memory.heapTotalMB} MB]`;
        }
        process.stdout.write(line + '\n');
    }
    writeFile(entry, filePath) {
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir))
            fs.mkdirSync(dir, { recursive: true });
        fs.appendFileSync(filePath, JSON.stringify(entry) + '\n', 'utf8');
    }
    writeHttp(entry, endpoint, headers) {
        // Fire-and-forget — non-blocking
        fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...headers },
            body: JSON.stringify(entry),
        }).catch((err) => this.nestLogger.warn(`HTTP transport failed: ${err.message}`));
    }
    // ---------------------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------------------
    captureMemory() {
        const m = process.memoryUsage();
        return {
            heapUsedMB: (0, sdk_debug_utils_1.toMB)(m.heapUsed),
            heapTotalMB: (0, sdk_debug_utils_1.toMB)(m.heapTotal),
            externalMB: (0, sdk_debug_utils_1.toMB)(m.external),
            rssMB: (0, sdk_debug_utils_1.toMB)(m.rss),
        };
    }
    updateStats(entry) {
        this.stats.totalLogs++;
        this.stats.logsByLevel[entry.level]++;
        this.stats.logsByEvent[entry.event] =
            (this.stats.logsByEvent[entry.event] ?? 0) + 1;
        if (entry.level === sdk_debug_constants_1.SDK_DEBUG_LOG_LEVELS.ERROR) {
            this.stats.errorRate =
                this.stats.logsByLevel.error / this.stats.totalLogs;
        }
    }
    updateAverageRequestDuration(duration) {
        const prev = this.stats.averageRequestDurationMs;
        const count = this.stats.logsByEvent['sdk.request.end'] ?? 1;
        this.stats.averageRequestDurationMs =
            (prev * (count - 1) + duration) / count;
    }
};
exports.SdkDebugService = SdkDebugService;
exports.SdkDebugService = SdkDebugService = SdkDebugService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(sdk_debug_constants_1.SDK_DEBUG_MODULE_OPTIONS)),
    __param(1, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [typeof (_a = typeof sdk_debug_types_1.SdkDebugModuleOptions !== "undefined" && sdk_debug_types_1.SdkDebugModuleOptions) === "function" ? _a : Object, event_emitter_1.EventEmitter2])
], SdkDebugService);
//# sourceMappingURL=sdk-debug.service.js.map