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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvironmentLoader = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const common_1 = require("@nestjs/common");
/**
 * Loads environment-specific .env files
 * Priority order:
 * 1. .env.{NODE_ENV}.local
 * 2. .env.{NODE_ENV}
 * 3. .env.local
 * 4. .env
 */
class EnvironmentLoader {
    constructor(envDir = process.cwd()) {
        this.envDir = envDir;
        this.logger = new common_1.Logger(EnvironmentLoader.name);
        this.loaded = false;
    }
    /**
     * Load environment variables from .env files
     */
    load() {
        if (this.loaded) {
            return;
        }
        const nodeEnv = process.env.NODE_ENV || 'development';
        const envFiles = this.getEnvFilesByPriority(nodeEnv);
        for (const envFile of envFiles) {
            const envPath = path.join(this.envDir, envFile);
            if (fs.existsSync(envPath)) {
                this.loadEnvFile(envPath);
                this.logger.debug(`Loaded environment from: ${envFile}`);
            }
        }
        this.loaded = true;
    }
    /**
     * Get ordered list of .env files to load based on environment
     */
    getEnvFilesByPriority(nodeEnv) {
        return [
            `.env.${nodeEnv}.local`, // Highest priority - uncommitted overrides
            `.env.${nodeEnv}`, // Environment-specific config
            '.env.local', // Local overrides for all environments
            '.env', // Default configuration
        ];
    }
    /**
     * Parse and load env file into process.env
     */
    loadEnvFile(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const lines = content.split('\n');
            for (const line of lines) {
                const trimmedLine = line.trim();
                // Skip empty lines and comments
                if (!trimmedLine || trimmedLine.startsWith('#')) {
                    continue;
                }
                const [key, ...valueParts] = trimmedLine.split('=');
                const value = valueParts.join('=').trim();
                // Remove quotes if present
                const cleanValue = this.parseValue(value);
                // Only set if not already set (allow process.env to take precedence)
                if (!process.env[key]) {
                    process.env[key] = cleanValue;
                }
            }
        }
        catch (error) {
            this.logger.error(`Failed to load env file ${filePath}: ${error.message}`);
        }
    }
    /**
     * Parse environment variable value, handling quotes and escaped characters
     */
    parseValue(value) {
        // Handle quoted values
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
            return value.slice(1, -1);
        }
        // Handle inline comments after unquoted values
        const commentIndex = value.indexOf('#');
        if (commentIndex !== -1) {
            return value.substring(0, commentIndex).trim();
        }
        return value;
    }
    /**
     * Get the current environment
     */
    static getEnvironment() {
        return process.env.NODE_ENV || 'development';
    }
    /**
     * Check if running in production
     */
    static isProduction() {
        return EnvironmentLoader.getEnvironment() === 'production';
    }
    /**
     * Check if running in staging
     */
    static isStaging() {
        return EnvironmentLoader.getEnvironment() === 'staging';
    }
    /**
     * Check if running in development
     */
    static isDevelopment() {
        return EnvironmentLoader.getEnvironment() === 'development';
    }
}
exports.EnvironmentLoader = EnvironmentLoader;
//# sourceMappingURL=env-loader.js.map