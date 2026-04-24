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
var ApiKeyRotationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiKeyRotationService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const api_key_vault_service_1 = require("./api-key-vault.service");
/**
 * API Key Rotation Service
 * Handles automatic and manual key rotation
 * Maintains rotation logs and notifies about expiring keys
 */
let ApiKeyRotationService = ApiKeyRotationService_1 = class ApiKeyRotationService {
    constructor(apiKeyVault) {
        this.apiKeyVault = apiKeyVault;
        this.logger = new common_1.Logger(ApiKeyRotationService_1.name);
        this.rotationPolicies = new Map();
        this.rotationLogs = [];
        this.initializeDefaultPolicies();
    }
    /**
     * Initialize default rotation policies
     */
    initializeDefaultPolicies() {
        // Default 90-day rotation for all keys
        this.setRotationPolicy('api-key-main', {
            rotationIntervalDays: 90,
            autoRotate: true,
        });
        this.setRotationPolicy('api-secret-main', {
            rotationIntervalDays: 90,
            autoRotate: true,
        });
        this.setRotationPolicy('db-password', {
            rotationIntervalDays: 180,
            autoRotate: true,
        });
    }
    /**
     * Set rotation policy for a key
     */
    setRotationPolicy(keyId, policy) {
        this.rotationPolicies.set(keyId, { keyId, ...policy });
        this.logger.log(`Rotation policy set for ${keyId}: ${policy.rotationIntervalDays} days`);
    }
    /**
     * Get rotation policy for a key
     */
    getRotationPolicy(keyId) {
        return this.rotationPolicies.get(keyId);
    }
    /**
     * Check if a key needs rotation
     */
    needsRotation(keyId) {
        const metadata = this.apiKeyVault.getKeyMetadata(keyId);
        if (!metadata) {
            return false;
        }
        const policy = this.getRotationPolicy(keyId);
        if (!policy) {
            return false;
        }
        const createdDate = new Date(metadata.createdAt);
        const rotationDue = new Date(createdDate);
        rotationDue.setDate(rotationDue.getDate() + policy.rotationIntervalDays);
        return new Date() > rotationDue;
    }
    /**
     * Get days until key rotation is due
     */
    getDaysUntilRotation(keyId) {
        const metadata = this.apiKeyVault.getKeyMetadata(keyId);
        if (!metadata) {
            return -1;
        }
        const policy = this.getRotationPolicy(keyId);
        if (!policy) {
            return -1;
        }
        const createdDate = new Date(metadata.createdAt);
        const rotationDue = new Date(createdDate);
        rotationDue.setDate(rotationDue.getDate() + policy.rotationIntervalDays);
        const daysLeft = Math.ceil((rotationDue.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        return daysLeft;
    }
    /**
     * Manually rotate a key
     */
    async rotateKeyManually(keyId, newSecretValue) {
        try {
            this.apiKeyVault.rotateKey(keyId, newSecretValue);
            const metadata = this.apiKeyVault.getKeyMetadata(keyId);
            const log = {
                keyId,
                rotatedAt: new Date(),
                oldKeyExpired: false,
                newKeyExpires: metadata?.expiresAt || new Date(),
            };
            this.rotationLogs.push(log);
            this.logger.log(`Key rotated manually: ${keyId}`);
        }
        catch (error) {
            this.logger.error(`Failed to rotate key ${keyId}: ${error.message}`);
            throw error;
        }
    }
    /**
     * Check all keys for rotation needs (scheduled task)
     */
    async checkKeysForRotation() {
        this.logger.debug('Running scheduled key rotation check');
        const allKeys = this.apiKeyVault.listKeys();
        const keysNeedingRotation = [];
        for (const keyMetadata of allKeys) {
            if (this.needsRotation(keyMetadata.id)) {
                keysNeedingRotation.push(keyMetadata.id);
                this.logger.warn(`Key requiring rotation: ${keyMetadata.id}`);
                this.apiKeyVault.markForRotation(keyMetadata.id);
            }
        }
        // Check for keys expiring soon (within 14 days)
        const expiringKeys = allKeys.filter((meta) => {
            if (!meta.expiresAt)
                return false;
            const daysUntilExpiry = Math.ceil((new Date(meta.expiresAt).getTime() - new Date().getTime()) /
                (1000 * 60 * 60 * 24));
            return daysUntilExpiry > 0 && daysUntilExpiry <= 14;
        });
        if (expiringKeys.length > 0) {
            this.logger.warn(`${expiringKeys.length} keys expiring within 14 days`);
            // TODO: Send notification emails
        }
        return;
    }
    /**
     * Get rotation status for all keys
     */
    getRotationStatus() {
        const allKeys = this.apiKeyVault.listKeys();
        return allKeys.map((meta) => ({
            keyId: meta.id,
            needsRotation: this.needsRotation(meta.id),
            daysUntilRotation: this.getDaysUntilRotation(meta.id),
            isActive: meta.isActive,
            expiresAt: meta.expiresAt,
        }));
    }
    /**
     * Get rotation history
     */
    getRotationHistory(limit = 100) {
        return this.rotationLogs.slice(-limit);
    }
    /**
     * Get keys requiring rotation
     */
    getKeysRequiringRotation() {
        return this.apiKeyVault.getKeysRequiringRotation();
    }
    /**
     * Get rotation recommendations
     */
    getRotationRecommendations() {
        const allKeys = this.apiKeyVault.listKeys();
        const recommendations = [];
        for (const meta of allKeys) {
            const daysUntilRotation = this.getDaysUntilRotation(meta.id);
            if (daysUntilRotation < 0) {
                recommendations.push({
                    keyId: meta.id,
                    recommendation: 'Key rotation is OVERDUE',
                    urgent: true,
                });
            }
            else if (daysUntilRotation < 7) {
                recommendations.push({
                    keyId: meta.id,
                    recommendation: `Rotate within ${daysUntilRotation} days`,
                    urgent: true,
                });
            }
            else if (daysUntilRotation < 30) {
                recommendations.push({
                    keyId: meta.id,
                    recommendation: `Rotate within ${daysUntilRotation} days`,
                    urgent: false,
                });
            }
        }
        return recommendations;
    }
};
exports.ApiKeyRotationService = ApiKeyRotationService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ApiKeyRotationService.prototype, "checkKeysForRotation", null);
exports.ApiKeyRotationService = ApiKeyRotationService = ApiKeyRotationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [api_key_vault_service_1.ApiKeyVaultService])
], ApiKeyRotationService);
//# sourceMappingURL=api-key-rotation.service.js.map