"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const sdk_debug_service_1 = require("../src/sdk-debug.service");
const sdk_debug_constants_1 = require("../src/sdk-debug.constants");
// Silence stdout during tests
const stdoutSpy = jest
    .spyOn(process.stdout, 'write')
    .mockImplementation(() => true);
afterAll(() => stdoutSpy.mockRestore());
function buildModule(overrides = {}) {
    const defaults = {
        enabled: true,
        level: 'verbose',
        colorize: false,
        prettyPrint: false,
    };
    return testing_1.Test.createTestingModule({
        providers: [
            { provide: sdk_debug_constants_1.SDK_DEBUG_MODULE_OPTIONS, useValue: { ...defaults, ...overrides } },
            sdk_debug_service_1.SdkDebugService,
        ],
    }).compile();
}
describe('SdkDebugService', () => {
    let module;
    let service;
    beforeEach(async () => {
        stdoutSpy.mockClear();
        module = await buildModule();
        service = module.get(sdk_debug_service_1.SdkDebugService);
    });
    afterEach(() => module.close());
    // ---------------------------------------------------------------------------
    // Basic enabled/disabled
    // ---------------------------------------------------------------------------
    describe('enabled flag', () => {
        it('emits logs when enabled', () => {
            service.info(sdk_debug_constants_1.SDK_DEBUG_EVENTS.REQUEST_START, 'test message');
            expect(stdoutSpy).toHaveBeenCalled();
        });
        it('emits nothing when disabled', async () => {
            const disabledModule = await buildModule({ enabled: false });
            const disabledService = disabledModule.get(sdk_debug_service_1.SdkDebugService);
            disabledService.info(sdk_debug_constants_1.SDK_DEBUG_EVENTS.REQUEST_START, 'should not appear');
            expect(stdoutSpy).not.toHaveBeenCalled();
            await disabledModule.close();
        });
        it('isEnabled reflects config', async () => {
            expect(service.isEnabled).toBe(true);
            const off = await buildModule({ enabled: false });
            expect(off.get(sdk_debug_service_1.SdkDebugService).isEnabled).toBe(false);
            await off.close();
        });
    });
    // ---------------------------------------------------------------------------
    // Log level methods
    // ---------------------------------------------------------------------------
    describe('log level methods', () => {
        const methods = ['verbose', 'debug', 'info', 'warn'];
        methods.forEach((method) => {
            it(`${method}() calls emit and writes to stdout`, () => {
                service[method]('test.event', `${method} message`);
                expect(stdoutSpy).toHaveBeenCalledTimes(1);
            });
        });
        it('error() includes error details in log entry', () => {
            const err = new Error('disk full');
            service.error('test.error', 'Something broke', err);
            const output = stdoutSpy.mock.calls[0][0];
            expect(output).toContain('disk full');
        });
        it('error() handles non-Error objects gracefully', () => {
            expect(() => service.error('test.error', 'oops', 'string error')).not.toThrow();
        });
    });
    // ---------------------------------------------------------------------------
    // Level filtering
    // ---------------------------------------------------------------------------
    describe('level filtering', () => {
        it('suppresses entries below min level', async () => {
            const mod = await buildModule({ level: 'warn' });
            const svc = mod.get(sdk_debug_service_1.SdkDebugService);
            svc.debug('test.event', 'should be filtered');
            expect(stdoutSpy).not.toHaveBeenCalled();
            await mod.close();
        });
        it('allows entries at or above min level', async () => {
            const mod = await buildModule({ level: 'warn' });
            const svc = mod.get(sdk_debug_service_1.SdkDebugService);
            svc.error('test.event', 'should appear');
            expect(stdoutSpy).toHaveBeenCalled();
            await mod.close();
        });
    });
    // ---------------------------------------------------------------------------
    // Sensitive key redaction
    // ---------------------------------------------------------------------------
    describe('sensitive key redaction', () => {
        it('redacts configured sensitive keys from meta', () => {
            service.debug('test.event', 'msg', {
                apiKey: 'super-secret',
                safeField: 'visible',
            });
            const output = stdoutSpy.mock.calls[0][0];
            expect(output).not.toContain('super-secret');
            expect(output).toContain('[REDACTED]');
        });
        it('keeps non-sensitive keys intact', () => {
            service.debug('test.event', 'msg', { userId: 'user-123' });
            const output = stdoutSpy.mock.calls[0][0];
            expect(output).toContain('user-123');
        });
    });
    // ---------------------------------------------------------------------------
    // Suppressed events
    // ---------------------------------------------------------------------------
    describe('suppressedEvents', () => {
        it('suppresses matching events', async () => {
            const mod = await buildModule({
                suppressedEvents: ['sdk.noisy.event'],
            });
            const svc = mod.get(sdk_debug_service_1.SdkDebugService);
            svc.debug('sdk.noisy.event', 'should not appear');
            expect(stdoutSpy).not.toHaveBeenCalled();
            await mod.close();
        });
    });
    // ---------------------------------------------------------------------------
    // Global meta
    // ---------------------------------------------------------------------------
    describe('globalMeta', () => {
        it('attaches global meta to every log entry', () => {
            // We test this by checking the stdout output contains our global meta key
            // We'll use a custom transport to capture the entry directly
            const entries = [];
            const mod = testing_1.Test.createTestingModule({
                providers: [
                    {
                        provide: sdk_debug_constants_1.SDK_DEBUG_MODULE_OPTIONS,
                        useValue: {
                            enabled: true,
                            level: 'verbose',
                            globalMeta: { service: 'BridgeWise', version: '1.0.0' },
                            transports: [
                                {
                                    type: sdk_debug_constants_1.SDK_DEBUG_TRANSPORT.CUSTOM,
                                    handler: (e) => entries.push(e),
                                },
                            ],
                        },
                    },
                    sdk_debug_service_1.SdkDebugService,
                ],
            }).compile();
            return mod.then(async (m) => {
                const svc = m.get(sdk_debug_service_1.SdkDebugService);
                svc.debug('some.event', 'hello');
                expect(entries).toHaveLength(1);
                expect(entries[0].meta?.service).toBe('BridgeWise');
                expect(entries[0].meta?.version).toBe('1.0.0');
                await m.close();
            });
        });
    });
    // ---------------------------------------------------------------------------
    // Custom transport
    // ---------------------------------------------------------------------------
    describe('custom transport', () => {
        it('calls the custom handler with the log entry', async () => {
            const captured = [];
            const mod = await testing_1.Test.createTestingModule({
                providers: [
                    {
                        provide: sdk_debug_constants_1.SDK_DEBUG_MODULE_OPTIONS,
                        useValue: {
                            enabled: true,
                            level: 'verbose',
                            transports: [
                                {
                                    type: sdk_debug_constants_1.SDK_DEBUG_TRANSPORT.CUSTOM,
                                    handler: (entry) => captured.push(entry),
                                },
                            ],
                        },
                    },
                    sdk_debug_service_1.SdkDebugService,
                ],
            }).compile();
            const svc = mod.get(sdk_debug_service_1.SdkDebugService);
            svc.info('sdk.payment.create', 'Payment initiated', { amount: 100 });
            expect(captured).toHaveLength(1);
            expect(captured[0].event).toBe('sdk.payment.create');
            expect(captured[0].message).toBe('Payment initiated');
            expect(captured[0].meta?.amount).toBe(100);
            expect(captured[0].level).toBe('info');
            await mod.close();
        });
    });
    // ---------------------------------------------------------------------------
    // time() helper
    // ---------------------------------------------------------------------------
    describe('time()', () => {
        it('returns a finish function', () => {
            const finish = service.time(sdk_debug_constants_1.SDK_DEBUG_EVENTS.REQUEST_START, 'FetchUser');
            expect(typeof finish).toBe('function');
        });
        it('logs start and end entries', () => {
            const finish = service.time(sdk_debug_constants_1.SDK_DEBUG_EVENTS.REQUEST_END, 'FetchUser');
            finish();
            expect(stdoutSpy).toHaveBeenCalledTimes(2); // start + end
        });
    });
    // ---------------------------------------------------------------------------
    // trace() helper
    // ---------------------------------------------------------------------------
    describe('trace()', () => {
        it('resolves and logs success', async () => {
            const result = await service.trace(sdk_debug_constants_1.SDK_DEBUG_EVENTS.REQUEST_END, 'GetBalance', async () => ({ balance: 500 }));
            expect(result).toEqual({ balance: 500 });
            expect(stdoutSpy).toHaveBeenCalledTimes(2); // start + end
        });
        it('rethrows errors and logs failure', async () => {
            await expect(service.trace(sdk_debug_constants_1.SDK_DEBUG_EVENTS.REQUEST_ERROR, 'FailingOp', async () => {
                throw new Error('intentional failure');
            })).rejects.toThrow('intentional failure');
            // start + end + error = 3 writes
            expect(stdoutSpy.mock.calls.length).toBeGreaterThanOrEqual(2);
        });
    });
    // ---------------------------------------------------------------------------
    // getStats()
    // ---------------------------------------------------------------------------
    describe('getStats()', () => {
        it('tracks total log count', () => {
            service.debug('a', 'msg 1');
            service.info('b', 'msg 2');
            service.error('c', 'msg 3');
            const stats = service.getStats();
            expect(stats.totalLogs).toBe(3);
        });
        it('tracks per-level counts', () => {
            service.warn('x', 'warn msg');
            const stats = service.getStats();
            expect(stats.logsByLevel.warn).toBeGreaterThanOrEqual(1);
        });
        it('tracks per-event counts', () => {
            service.debug(sdk_debug_constants_1.SDK_DEBUG_EVENTS.CACHE_HIT, 'cache hit 1');
            service.debug(sdk_debug_constants_1.SDK_DEBUG_EVENTS.CACHE_HIT, 'cache hit 2');
            const stats = service.getStats();
            expect(stats.logsByEvent[sdk_debug_constants_1.SDK_DEBUG_EVENTS.CACHE_HIT]).toBe(2);
        });
        it('tracks error rate', () => {
            service.info('event', 'ok');
            service.info('event', 'ok');
            service.error('event', 'fail');
            const stats = service.getStats();
            // 1 error out of 3 total
            expect(stats.errorRate).toBeCloseTo(1 / 3, 2);
        });
        it('returns a copy (immutable snapshot)', () => {
            const stats1 = service.getStats();
            service.info('extra.event', 'extra');
            const stats2 = service.getStats();
            expect(stats2.totalLogs).toBeGreaterThan(stats1.totalLogs);
        });
    });
    // ---------------------------------------------------------------------------
    // Format variants
    // ---------------------------------------------------------------------------
    describe('format variants', () => {
        it('JSON format outputs valid JSON per line', async () => {
            const mod = await buildModule({ format: 'json' });
            const svc = mod.get(sdk_debug_service_1.SdkDebugService);
            svc.info('test.event', 'json format test');
            const output = stdoutSpy.mock.calls[0][0].trim();
            expect(() => JSON.parse(output)).not.toThrow();
            await mod.close();
        });
        it('compact format outputs a single line', async () => {
            const mod = await buildModule({ format: 'compact' });
            const svc = mod.get(sdk_debug_service_1.SdkDebugService);
            svc.info('test.event', 'compact format test');
            const output = stdoutSpy.mock.calls[0][0].trim();
            expect(output.includes('\n')).toBe(false);
            await mod.close();
        });
    });
    // ---------------------------------------------------------------------------
    // System / memory info
    // ---------------------------------------------------------------------------
    describe('system and memory info', () => {
        it('includes system info when configured', async () => {
            const entries = [];
            const mod = await testing_1.Test.createTestingModule({
                providers: [
                    {
                        provide: sdk_debug_constants_1.SDK_DEBUG_MODULE_OPTIONS,
                        useValue: {
                            enabled: true,
                            level: 'verbose',
                            includeSystemInfo: true,
                            transports: [
                                {
                                    type: sdk_debug_constants_1.SDK_DEBUG_TRANSPORT.CUSTOM,
                                    handler: (e) => entries.push(e),
                                },
                            ],
                        },
                    },
                    sdk_debug_service_1.SdkDebugService,
                ],
            }).compile();
            mod.get(sdk_debug_service_1.SdkDebugService).info('event', 'msg');
            expect(entries[0].system).toBeDefined();
            expect(entries[0].system?.pid).toBe(process.pid);
            await mod.close();
        });
        it('includes memory info when configured', async () => {
            const entries = [];
            const mod = await testing_1.Test.createTestingModule({
                providers: [
                    {
                        provide: sdk_debug_constants_1.SDK_DEBUG_MODULE_OPTIONS,
                        useValue: {
                            enabled: true,
                            level: 'verbose',
                            includeMemoryUsage: true,
                            transports: [
                                {
                                    type: sdk_debug_constants_1.SDK_DEBUG_TRANSPORT.CUSTOM,
                                    handler: (e) => entries.push(e),
                                },
                            ],
                        },
                    },
                    sdk_debug_service_1.SdkDebugService,
                ],
            }).compile();
            mod.get(sdk_debug_service_1.SdkDebugService).info('event', 'msg');
            expect(entries[0].memory).toBeDefined();
            expect(typeof entries[0].memory?.heapUsedMB).toBe('number');
            await mod.close();
        });
    });
});
//# sourceMappingURL=sdk-debug.service.spec%20(1).js.map