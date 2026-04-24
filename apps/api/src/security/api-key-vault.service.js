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
var ApiKeyVaultService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiKeyVaultService = void 0;
const common_1 = require("@nestjs/common");
const crypto = __importStar(require("crypto"));
/**
 * Secure API Key Vault Service
 * Handles encryption, storage, and rotation of sensitive API keys
 * Prevents key exposure to clients and logs all access
 */
let ApiKeyVaultService = ApiKeyVaultService_1 = class ApiKeyVaultService {
    constructor() {
        this.logger = new common_1.Logger(ApiKeyVaultService_1.name);
        this.keyStore = new Map();
        // Initialize encryption key from environment
        const keyFromEnv = process.env.VAULT_ENCRYPTION_KEY;
        if (!keyFromEnv) {
            this.logger.error('VAULT_ENCRYPTION_KEY not set. Using generated key (NOT FOR PRODUCTION)');
            this.encryptionKey = crypto.randomBytes(32);
        }
        else {
            // Ensure key is proper length (32 bytes for AES-256)
            this.encryptionKey = crypto
                .createHash('sha256')
                .update(keyFromEnv)
                .digest();
        }
    }
    /**
     * Store a sensitive API key securely
     * @param keyId Unique identifier for this key
     * @param secretValue The actual API key value
     * @param expiresAt Optional expiration date
     * @returns Encrypted key data
     */
    storeKey(keyId, secretValue, expiresAt) {
        if (!secretValue || secretValue.trim() === '') {
            this.logger.warn(`Attempted to store empty key with ID: ${keyId}`);
            throw new Error('Cannot store empty API key');
        }
        // Generate random IV for each encryption
        const iv = crypto.randomBytes(16);
        // Create cipher
        const cipher = crypto.createCipheriv('aes-256-gcm', this.encryptionKey, iv);
        // Encrypt the secret
        let ciphered = cipher.update(secretValue, 'utf-8', 'hex');
        ciphered += cipher.final('hex');
        // Get authentication tag
        const authTag = cipher.getAuthTag();
        const metadata = {
            id: keyId,
            createdAt: new Date(),
            expiresAt,
            isActive: true,
            rotationRequired: false,
        };
        const encryptedKey = {
            ciphered,
            iv: iv.toString('hex'),
            authTag: authTag.toString('hex'),
            metadata,
        };
        this.keyStore.set(keyId, encryptedKey);
        this.logger.debug(`Key stored: ${keyId}`);
        return encryptedKey;
    }
    /**
     * Retrieve and decrypt an API key
     * @param keyId Unique identifier for the key
     * @returns Decrypted API key value
     */
    retrieveKey(keyId) {
        const encryptedKey = this.keyStore.get(keyId);
        if (!encryptedKey) {
            this.logger.warn(`Attempted to retrieve non-existent key: ${keyId}`);
            throw new Error(`Key not found: ${keyId}`);
        }
        // Check expiration
        if (encryptedKey.metadata.expiresAt &&
            new Date() > encryptedKey.metadata.expiresAt) {
            this.logger.warn(`Attempted to access expired key: ${keyId}`);
            throw new Error(`Key has expired: ${keyId}`);
        }
        if (!encryptedKey.metadata.isActive) {
            this.logger.warn(`Attempted to access inactive key: ${keyId}`);
            throw new Error(`Key is inactive: ${keyId}`);
        }
        try {
            const decipher = crypto.createDecipheriv('aes-256-gcm', this.encryptionKey, Buffer.from(encryptedKey.iv, 'hex'));
            decipher.setAuthTag(Buffer.from(encryptedKey.authTag, 'hex'));
            let decrypted = decipher.update(encryptedKey.ciphered, 'hex', 'utf-8');
            decrypted += decipher.final('utf-8');
            this.logger.debug(`Key accessed: ${keyId}`);
            return decrypted;
        }
        catch (error) {
            this.logger.error(`Failed to decrypt key ${keyId}: ${error.message}`);
            throw new Error('Failed to decrypt key - possible tampering detected');
        }
    }
    /**
     * Check if a key has expired
     * @param keyId Unique identifier for the key
     * @returns True if key has expired
     */
    isKeyExpired(keyId) {
        const encryptedKey = this.keyStore.get(keyId);
        if (!encryptedKey) {
            return false;
        }
        if (!encryptedKey.metadata.expiresAt) {
            return false;
        }
        return new Date() > encryptedKey.metadata.expiresAt;
    }
    /**
     * Mark a key as requiring rotation
     * @param keyId Unique identifier for the key
     */
    markForRotation(keyId) {
        const encryptedKey = this.keyStore.get(keyId);
        if (!encryptedKey) {
            this.logger.warn(`Attempted to mark non-existent key for rotation: ${keyId}`);
            throw new Error(`Key not found: ${keyId}`);
        }
        encryptedKey.metadata.rotationRequired = true;
        this.logger.log(`Key marked for rotation: ${keyId}`);
    }
    /**
     * Rotate an API key - deactivate old, store new
     * @param keyId Unique identifier for the key
     * @param newSecretValue The new API key value
     * @returns Encrypted new key data
     */
    rotateKey(keyId, newSecretValue) {
        const oldKey = this.keyStore.get(keyId);
        if (oldKey) {
            oldKey.metadata.isActive = false;
            this.logger.log(`Key rotated, old key deactivated: ${keyId}`);
        }
        // Store new key with expiration 90 days from now
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 90);
        return this.storeKey(keyId, newSecretValue, expiresAt);
    }
    /**
     * Revoke a key immediately
     * @param keyId Unique identifier for the key
     */
    revokeKey(keyId) {
        const encryptedKey = this.keyStore.get(keyId);
        if (!encryptedKey) {
            this.logger.warn(`Attempted to revoke non-existent key: ${keyId}`);
            throw new Error(`Key not found: ${keyId}`);
        }
        encryptedKey.metadata.isActive = false;
        this.logger.warn(`Key revoked: ${keyId}`);
    }
    /**
     * Get key metadata (without exposing the actual key)
     * @param keyId Unique identifier for the key
     * @returns Key metadata only
     */
    getKeyMetadata(keyId) {
        const encryptedKey = this.keyStore.get(keyId);
        return encryptedKey?.metadata || null;
    }
    /**
     * List all keys (metadata only, no secrets)
     * @returns Array of key metadata
     */
    listKeys() {
        return Array.from(this.keyStore.values()).map((ek) => ek.metadata);
    }
    /**
     * Check for and return keys requiring rotation
     * @returns Array of key IDs requiring rotation
     */
    getKeysRequiringRotation() {
        return Array.from(this.keyStore.entries())
            .filter(([, ek]) => ek.metadata.rotationRequired)
            .map(([id]) => id);
    }
    /**
     * Verify key integrity
     * @param keyId Unique identifier for the key
     * @returns True if key can be decrypted successfully
     */
    verifyKeyIntegrity(keyId) {
        const encryptedKey = this.keyStore.get(keyId);
        if (!encryptedKey) {
            return false;
        }
        try {
            this.retrieveKey(keyId);
            return true;
        }
        catch {
            return false;
        }
    }
};
exports.ApiKeyVaultService = ApiKeyVaultService;
exports.ApiKeyVaultService = ApiKeyVaultService = ApiKeyVaultService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ApiKeyVaultService);
//# sourceMappingURL=api-key-vault.service.js.map