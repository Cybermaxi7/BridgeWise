"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigFactory = void 0;
const common_1 = require("@nestjs/common");
const env_loader_1 = require("./env-loader");
const env_schema_1 = require("./env-schema");
/**
 * Configuration Factory
 * Creates environment-specific configurations
 */
class ConfigFactory {
    /**
     * Create configuration for the current environment
     */
    static create() {
        // Load environment variables from .env files
        const loader = new env_loader_1.EnvironmentLoader();
        loader.load();
        const environment = env_loader_1.EnvironmentLoader.getEnvironment();
        // Validate environment
        const validation = env_schema_1.EnvironmentValidator.validate(environment);
        if (!validation.valid) {
            const errorMessages = validation.errors
                .map((e) => `  - ${e.key}: ${e.error}`)
                .join('\n');
            throw new Error(`Environment validation failed:\n${errorMessages}`);
        }
        if (validation.warnings.length > 0) {
            validation.warnings.forEach((w) => {
                this.logger.warn(`[${w.key}] ${w.warning}`);
            });
        }
        // Create base configuration
        const baseConfig = this.createBaseConfig(environment);
        // Apply environment-specific overrides
        const finalConfig = this.applyEnvironmentOverrides(baseConfig, environment);
        this.logger.debug(`Configuration loaded for environment: ${environment}`);
        return finalConfig;
    }
    /**
     * Create base configuration from environment variables
     */
    static createBaseConfig(environment) {
        return {
            nodeEnv: environment,
            database: {
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT || '5432', 10),
                username: process.env.DB_USERNAME || 'postgres',
                password: process.env.DB_PASSWORD || '',
                database: process.env.DB_NAME || 'bridgewise',
                ssl: process.env.DB_SSL === 'true',
                logging: environment === 'development',
                synchronize: environment === 'development',
            },
            rpc: {
                ethereum: process.env.RPC_ETHEREUM ||
                    'https://mainnet.infura.io/v3/YOUR_PROJECT_ID',
                polygon: process.env.RPC_POLYGON || 'https://polygon-rpc.com',
                bsc: process.env.RPC_BSC || 'https://bsc-dataseed.binance.org',
                arbitrum: process.env.RPC_ARBITRUM || 'https://arb1.arbitrum.io/rpc',
                optimism: process.env.RPC_OPTIMISM || 'https://mainnet.optimism.io',
            },
            server: {
                port: parseInt(process.env.PORT || '3000', 10),
                host: process.env.HOST || '0.0.0.0',
                cors: {
                    origin: this.parseCorsOrigins(process.env.CORS_ORIGIN || 'http://localhost:3000'),
                    credentials: process.env.CORS_CREDENTIALS === 'true',
                },
                forceHttps: process.env.FORCE_HTTPS === 'true',
            },
            logging: {
                level: (process.env.LOG_LEVEL || 'info'),
                format: (process.env.LOG_FORMAT || 'simple'),
            },
            api: {
                baseUrl: process.env.API_BASE_URL || 'https://api.bridgewise.com',
                timeout: parseInt(process.env.API_TIMEOUT || '30000', 10),
            },
            features: {
                enableAnalytics: process.env.ENABLE_ANALYTICS !== 'false',
                enableBenchmarking: process.env.ENABLE_BENCHMARKING === 'true',
                enableBridgeCompare: process.env.ENABLE_BRIDGE_COMPARE !== 'false',
                enableGasEstimation: process.env.ENABLE_GAS_ESTIMATION !== 'false',
                enableRealTimeFees: process.env.ENABLE_REAL_TIME_FEES !== 'false',
                enableBridgeDiscovery: process.env.ENABLE_BRIDGE_DISCOVERY !== 'false',
                enableReliabilityScore: process.env.ENABLE_RELIABILITY_SCORE !== 'false',
            },
        };
    }
    /**
     * Apply environment-specific configuration overrides
     */
    static applyEnvironmentOverrides(baseConfig, environment) {
        const overrides = this.getEnvironmentOverrides(environment);
        return this.mergeConfigs(baseConfig, overrides);
    }
    /**
     * Get environment-specific overrides
     */
    static getEnvironmentOverrides(environment) {
        switch (environment) {
            case 'development':
                return {
                    database: {
                        logging: true,
                        synchronize: true,
                    },
                    logging: {
                        level: 'debug',
                        format: 'simple',
                    },
                };
            case 'staging':
                return {
                    database: {
                        logging: false,
                        synchronize: false,
                        ssl: true,
                    },
                    logging: {
                        level: 'info',
                        format: 'json',
                    },
                };
            case 'production':
                return {
                    database: {
                        logging: false,
                        synchronize: false,
                        ssl: true,
                    },
                    logging: {
                        level: 'warn',
                        format: 'json',
                    },
                    server: {
                        forceHttps: true,
                    },
                };
            default:
                return {};
        }
    }
    /**
     * Deep merge configuration objects
     */
    static mergeConfigs(base, overrides) {
        const dbOverrides = overrides.database;
        const rpcOverrides = overrides.rpc;
        const apiOverrides = overrides.api;
        const serverOverrides = overrides.server;
        const loggingOverrides = overrides.logging;
        const featuresOverrides = overrides.features;
        return {
            ...base,
            ...overrides,
            database: { ...base.database, ...dbOverrides },
            rpc: { ...base.rpc, ...rpcOverrides },
            api: { ...base.api, ...apiOverrides },
            server: {
                ...base.server,
                ...serverOverrides,
                cors: { ...base.server.cors, ...serverOverrides?.cors },
            },
            logging: { ...base.logging, ...loggingOverrides },
            features: { ...base.features, ...featuresOverrides },
        };
    }
    /**
     * Parse CORS origins from comma-separated string
     */
    static parseCorsOrigins(origins) {
        if (origins === '*') {
            return '*';
        }
        return origins
            .split(',')
            .map((origin) => origin.trim())
            .filter((origin) => origin.length > 0);
    }
}
exports.ConfigFactory = ConfigFactory;
ConfigFactory.logger = new common_1.Logger(ConfigFactory.name);
//# sourceMappingURL=config-factory.js.map