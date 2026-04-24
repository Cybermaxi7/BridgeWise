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
var ConfigService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigService = void 0;
const common_1 = require("@nestjs/common");
const api_key_vault_service_1 = require("../security/api-key-vault.service");
let ConfigService = ConfigService_1 = class ConfigService {
    constructor(apiKeyVault) {
        this.apiKeyVault = apiKeyVault;
        this.logger = new common_1.Logger(ConfigService_1.name);
        this.vaultInitialized = false;
        this.config = this.createConfig();
        this.validateConfig();
    }
    async onModuleInit() {
        // Initialize vault with keys from environment
        this.initializeVault();
        this.vaultInitialized = true;
    }
    initializeVault() {
        try {
            // Store API key in vault
            const apiKey = process.env.API_KEY;
            if (apiKey) {
                this.apiKeyVault.storeKey('api-key-main', apiKey);
                this.logger.debug('API key stored in vault');
            }
            // Store API secret in vault if present
            const apiSecret = process.env.API_SECRET;
            if (apiSecret) {
                this.apiKeyVault.storeKey('api-secret-main', apiSecret);
                this.logger.debug('API secret stored in vault');
            }
            // Store database password in vault
            const dbPassword = process.env.DB_PASSWORD;
            if (dbPassword) {
                this.apiKeyVault.storeKey('db-password', dbPassword);
                this.logger.debug('Database password stored in vault');
            }
        }
        catch (error) {
            this.logger.error(`Failed to initialize vault: ${error.message}`);
            // Continue anyway - vault is optional for development
        }
    }
    createConfig() {
        const nodeEnv = (process.env.NODE_ENV || 'development');
        const baseConfig = {
            nodeEnv,
            database: {
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT || '5432', 10),
                username: process.env.DB_USERNAME || 'postgres',
                password: '', // NEVER store password in config - use vault
                database: process.env.DB_NAME || 'bridgewise',
                ssl: nodeEnv === 'production' ? process.env.DB_SSL === 'true' : false,
            },
            rpc: {
                ethereum: process.env.RPC_ETHEREUM ||
                    'https://mainnet.infura.io/v3/YOUR_PROJECT_ID',
                polygon: process.env.RPC_POLYGON || 'https://polygon-rpc.com',
                bsc: process.env.RPC_BSC || 'https://bsc-dataseed.binance.org',
                arbitrum: process.env.RPC_ARBITRUM || 'https://arb1.arbitrum.io/rpc',
                optimism: process.env.RPC_OPTIMISM || 'https://mainnet.optimism.io',
            },
            api: {
                apiKey: '', // NEVER store in config - use vault
                apiSecret: '', // NEVER store in config - use vault
                baseUrl: process.env.API_BASE_URL || 'https://api.bridgewise.com',
                timeout: parseInt(process.env.API_TIMEOUT || '30000', 10),
            },
            server: {
                port: parseInt(process.env.PORT || '3000', 10),
                host: process.env.HOST || '0.0.0.0',
                cors: {
                    origin: this.parseCorsOrigins(process.env.CORS_ORIGIN || 'http://localhost:3000'),
                    credentials: process.env.CORS_CREDENTIALS === 'true',
                },
            },
            logging: {
                level: (process.env.LOG_LEVEL || 'info'),
                format: (process.env.LOG_FORMAT || 'simple'),
            },
        };
        return this.applyEnvironmentOverrides(baseConfig, nodeEnv);
    }
    applyEnvironmentOverrides(baseConfig, env) {
        const overrides = this.getEnvironmentOverrides(env);
        return this.mergeConfigs(baseConfig, overrides);
    }
    getEnvironmentOverrides(env) {
        switch (env) {
            case 'development':
                return {
                    logging: {
                        level: 'debug',
                        format: 'simple',
                    },
                };
            case 'staging':
                return {
                    logging: {
                        level: 'info',
                        format: 'json',
                    },
                };
            case 'production':
                return {
                    logging: {
                        level: 'warn',
                        format: 'json',
                    },
                };
            default:
                return {};
        }
    }
    mergeConfigs(base, overrides) {
        return {
            ...base,
            ...overrides,
            database: { ...base.database, ...overrides.database },
            rpc: { ...base.rpc, ...overrides.rpc },
            api: { ...base.api, ...overrides.api },
            server: {
                ...base.server,
                ...overrides.server,
                cors: { ...base.server.cors, ...overrides.server?.cors },
            },
            logging: { ...base.logging, ...overrides.logging },
        };
    }
    parseCorsOrigins(origins) {
        if (origins === '*')
            return '*';
        return origins.split(',').map((origin) => origin.trim());
    }
    validateConfig() {
        // Check that environment variables are set, but don't store their values
        const requiredEnvVars = [
            { key: 'API_KEY', value: process.env.API_KEY },
            { key: 'DB_PASSWORD', value: process.env.DB_PASSWORD },
        ];
        const missing = requiredEnvVars.filter((field) => !field.value);
        if (missing.length > 0) {
            this.logger.warn(`Missing recommended environment variables: ${missing.map((f) => f.key).join(', ')}`);
        }
        if (this.config.nodeEnv === 'production') {
            const productionRequired = [
                { key: 'API_KEY', value: process.env.API_KEY },
                { key: 'DB_PASSWORD', value: process.env.DB_PASSWORD },
                {
                    key: 'VAULT_ENCRYPTION_KEY',
                    value: process.env.VAULT_ENCRYPTION_KEY,
                },
            ];
            const missingProduction = productionRequired.filter((field) => !field.value);
            if (missingProduction.length > 0) {
                throw new Error(`Missing required environment variables for production: ${missingProduction.map((f) => f.key).join(', ')}`);
            }
        }
    }
    get(key) {
        return this.config[key];
    }
    get all() {
        return { ...this.config };
    }
    get isDevelopment() {
        return this.config.nodeEnv === 'development';
    }
    get isStaging() {
        return this.config.nodeEnv === 'staging';
    }
    get isProduction() {
        return this.config.nodeEnv === 'production';
    }
    /**
     * Retrieve API key from vault
     * Should only be used server-side
     */
    getApiKey() {
        try {
            return this.apiKeyVault.retrieveKey('api-key-main');
        }
        catch (error) {
            this.logger.warn('Failed to retrieve API key from vault');
            return '';
        }
    }
    /**
     * Retrieve API secret from vault
     * Should only be used server-side
     */
    getApiSecret() {
        try {
            return this.apiKeyVault.retrieveKey('api-secret-main');
        }
        catch (error) {
            this.logger.warn('Failed to retrieve API secret from vault');
            return '';
        }
    }
    /**
     * Retrieve database password from vault
     * Should only be used server-side
     */
    getDatabasePassword() {
        try {
            return this.apiKeyVault.retrieveKey('db-password');
        }
        catch (error) {
            this.logger.warn('Failed to retrieve database password from vault');
            return this.config.database.password;
        }
    }
};
exports.ConfigService = ConfigService;
exports.ConfigService = ConfigService = ConfigService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [api_key_vault_service_1.ApiKeyVaultService])
], ConfigService);
//# sourceMappingURL=config.service.js.map