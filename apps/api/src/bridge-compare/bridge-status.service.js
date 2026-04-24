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
var BridgeStatusService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BridgeStatusService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const enums_1 = require("../enums");
let BridgeStatusService = BridgeStatusService_1 = class BridgeStatusService {
    constructor(httpService) {
        this.httpService = httpService;
        this.logger = new common_1.Logger(BridgeStatusService_1.name);
        this.statusMap = {};
        this.statusCheckUrls = new Map([
            ['stargate', 'https://api.stargate.finance/route'],
            ['hop', 'https://api.hop.exchange/quote'],
            ['multichain', 'https://api.multichain.org/router'],
            ['axelar', 'https://api.axelarscan.io/status'],
            ['wormhole', 'https://api.wormholescan.io/api/v1/global-stats'],
            ['lifi', 'https://li.fi/health'],
            ['cbridge', 'https://cbridge-api.celer.network/v1/get_supported_token_list'],
            ['connext', 'https://api.connext.network/pools/'],
        ]);
        this.initializeStatusMap();
    }
    initializeStatusMap() {
        for (const [bridgeId, url] of this.statusCheckUrls) {
            this.statusMap[bridgeId] = {
                bridgeId,
                name: this.formatBridgeName(bridgeId),
                status: enums_1.BridgeStatus.ACTIVE,
                uptime: 100,
                lastUpdated: new Date(),
            };
        }
    }
    formatBridgeName(bridgeId) {
        const names = {
            stargate: 'Stargate',
            hop: 'Hop Protocol',
            multichain: 'Multichain',
            axelar: 'Axelar',
            wormhole: 'Wormhole',
            lifi: 'LiFi',
            cbridge: 'cBridge',
            connext: 'Connext',
        };
        return names[bridgeId] || bridgeId.charAt(0).toUpperCase() + bridgeId.slice(1);
    }
    async checkAllBridgesStatus() {
        this.logger.debug('Starting bridge status check');
        const statusChecks = Array.from(this.statusCheckUrls.entries()).map(([bridgeId, url]) => this.checkBridgeStatus(bridgeId, url));
        await Promise.allSettled(statusChecks);
    }
    async checkBridgeStatus(bridgeId, statusUrl) {
        try {
            const timeout = 5000; // 5 second timeout
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(statusUrl, { timeout }).pipe());
            const previousStatus = this.statusMap[bridgeId]?.status || enums_1.BridgeStatus.ACTIVE;
            if (response.status === 200) {
                // Bridge is responding - check if it was previously offline
                if (previousStatus !== enums_1.BridgeStatus.ACTIVE) {
                    this.logger.log(`Bridge ${bridgeId} recovered - status now ACTIVE`);
                }
                this.statusMap[bridgeId] = {
                    ...this.statusMap[bridgeId],
                    status: enums_1.BridgeStatus.ACTIVE,
                    uptime: Math.min(100, (this.statusMap[bridgeId]?.uptime || 95) + 1),
                    lastUpdated: new Date(),
                    errorMessage: undefined,
                };
            }
            else {
                this.handleBridgeStatusChange(bridgeId, enums_1.BridgeStatus.DEGRADED, 'Slow response');
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.warn(`Bridge ${bridgeId} status check failed: ${errorMessage}`);
            const previousStatus = this.statusMap[bridgeId]?.status || enums_1.BridgeStatus.ACTIVE;
            if (previousStatus === enums_1.BridgeStatus.ACTIVE) {
                // First failure - mark as degraded
                this.handleBridgeStatusChange(bridgeId, enums_1.BridgeStatus.DEGRADED, errorMessage);
            }
            else if (previousStatus === enums_1.BridgeStatus.DEGRADED) {
                // Second consecutive failure - mark as offline
                this.handleBridgeStatusChange(bridgeId, enums_1.BridgeStatus.OFFLINE, errorMessage);
            }
            else {
                // Already offline, just update uptime
                this.statusMap[bridgeId] = {
                    ...this.statusMap[bridgeId],
                    uptime: Math.max(0, (this.statusMap[bridgeId]?.uptime || 50) - 2),
                    lastUpdated: new Date(),
                    errorMessage,
                };
            }
        }
    }
    handleBridgeStatusChange(bridgeId, newStatus, errorMessage) {
        const currentInfo = this.statusMap[bridgeId];
        const wasOffline = currentInfo?.status === enums_1.BridgeStatus.OFFLINE;
        const nowOffline = newStatus === enums_1.BridgeStatus.OFFLINE;
        if (nowOffline && !wasOffline) {
            this.logger.warn(`Bridge ${bridgeId} went OFFLINE: ${errorMessage}`);
        }
        this.statusMap[bridgeId] = {
            ...currentInfo,
            status: newStatus,
            uptime: nowOffline ? Math.max(0, (currentInfo?.uptime || 50) - 5) : currentInfo?.uptime || 100,
            lastUpdated: new Date(),
            lastDowntimeStart: nowOffline ? new Date() : currentInfo?.lastDowntimeStart,
            errorMessage,
        };
    }
    getBridgeStatus(bridgeId) {
        return this.statusMap[bridgeId];
    }
    getAllBridgesStatus() {
        return Object.values(this.statusMap);
    }
    getBridgesStatus(bridgeIds) {
        const result = {};
        for (const id of bridgeIds) {
            if (this.statusMap[id]) {
                result[id] = this.statusMap[id];
            }
        }
        return result;
    }
    isOnline(bridgeId) {
        const status = this.statusMap[bridgeId];
        return status?.status === enums_1.BridgeStatus.ACTIVE || status?.status === enums_1.BridgeStatus.DEGRADED;
    }
    isOffline(bridgeId) {
        return this.statusMap[bridgeId]?.status === enums_1.BridgeStatus.OFFLINE;
    }
    isDegraded(bridgeId) {
        return this.statusMap[bridgeId]?.status === enums_1.BridgeStatus.DEGRADED;
    }
    getOfflineBridges() {
        return Object.values(this.statusMap).filter((info) => info.status === enums_1.BridgeStatus.OFFLINE);
    }
    getAverageUptime(bridgeIds) {
        const bridges = bridgeIds
            ? bridgeIds.map((id) => this.statusMap[id]).filter(Boolean)
            : Object.values(this.statusMap);
        if (bridges.length === 0)
            return 100;
        const totalUptime = bridges.reduce((sum, info) => sum + info.uptime, 0);
        return totalUptime / bridges.length;
    }
    updateManualStatus(bridgeId, status, errorMessage) {
        this.logger.log(`Manually updating bridge ${bridgeId} status to ${status}`);
        this.statusMap[bridgeId] = {
            ...this.statusMap[bridgeId],
            status,
            lastUpdated: new Date(),
            errorMessage,
        };
        return this.statusMap[bridgeId];
    }
    // Check if a bridge has been offline for a certain duration
    getDowntimeDuration(bridgeId) {
        const info = this.statusMap[bridgeId];
        if (!info?.lastDowntimeStart)
            return null;
        const now = new Date();
        return now.getTime() - info.lastDowntimeStart.getTime();
    }
};
exports.BridgeStatusService = BridgeStatusService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_5_MINUTES),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BridgeStatusService.prototype, "checkAllBridgesStatus", null);
exports.BridgeStatusService = BridgeStatusService = BridgeStatusService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], BridgeStatusService);
//# sourceMappingURL=bridge-status.service.js.map