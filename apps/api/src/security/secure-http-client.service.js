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
var SecureHttpClientService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecureHttpClientService = void 0;
const common_1 = require("@nestjs/common");
const https = __importStar(require("https"));
const http = __importStar(require("http"));
const api_key_vault_service_1 = require("./api-key-vault.service");
/**
 * Secure HTTP Client Service
 * Makes authenticated requests using keys from the vault
 * Prevents key exposure and manages request security
 */
let SecureHttpClientService = SecureHttpClientService_1 = class SecureHttpClientService {
    constructor(apiKeyVault) {
        this.apiKeyVault = apiKeyVault;
        this.logger = new common_1.Logger(SecureHttpClientService_1.name);
    }
    /**
     * Make a secure HTTP request with API key from vault
     * @param url Target URL
     * @param options Request options including apiKeyId
     * @returns Response promise
     */
    async request(url, options = {}) {
        const { method = 'GET', headers = {}, body, timeout = 30000, apiKeyId, contentType = 'application/json', } = options;
        // Validate URL to prevent SSRF attacks
        if (!this.isValidUrl(url)) {
            throw new Error('Invalid URL provided');
        }
        try {
            // Add API key from vault if specified
            const finalHeaders = { ...headers };
            if (apiKeyId) {
                const apiKey = this.apiKeyVault.retrieveKey(apiKeyId);
                finalHeaders['X-API-Key'] = apiKey;
                finalHeaders['Authorization'] = `Bearer ${apiKey}`;
            }
            // Set content type
            finalHeaders['Content-Type'] = contentType;
            finalHeaders['User-Agent'] = 'BridgeWise/1.0';
            return await this.executeRequest(url, {
                method,
                headers: finalHeaders,
                body,
                timeout,
            });
        }
        catch (error) {
            this.logger.error(`Secure request failed for ${method} ${url}: ${error.message}`);
            throw error;
        }
    }
    /**
     * Execute the actual HTTP request
     */
    async executeRequest(url, options) {
        return new Promise((resolve, reject) => {
            const urlObj = new URL(url);
            const isSecure = urlObj.protocol === 'https:';
            const client = isSecure ? https : http;
            const requestOptions = {
                method: options.method,
                headers: options.headers,
                timeout: options.timeout,
            };
            const request = client.request(urlObj, requestOptions, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    try {
                        let parsedBody;
                        try {
                            parsedBody =
                                data &&
                                    res.headers['content-type']?.includes('application/json')
                                    ? JSON.parse(data)
                                    : data;
                        }
                        catch {
                            parsedBody = data;
                        }
                        resolve({
                            statusCode: res.statusCode || 200,
                            headers: res.headers,
                            body: parsedBody,
                        });
                    }
                    catch (error) {
                        reject(error);
                    }
                });
            });
            request.on('error', (error) => {
                reject(error);
            });
            request.on('timeout', () => {
                request.destroy();
                reject(new Error('Request timeout'));
            });
            if (options.body) {
                const bodyString = typeof options.body === 'string'
                    ? options.body
                    : JSON.stringify(options.body);
                request.write(bodyString);
            }
            request.end();
        });
    }
    /**
     * Validate URL to prevent SSRF
     */
    isValidUrl(urlString) {
        try {
            const url = new URL(urlString);
            // Disallow internal IPs
            const hostname = url.hostname;
            const internalPatterns = [
                /^localhost$/,
                /^127\./,
                /^10\./,
                /^172\.(1[6-9]|2[0-9]|3[01])\./,
                /^192\.168\./,
                /^0\.0\.0\.0$/,
                /^::1$/,
                /^fc[0-9a-f]{2}:/i,
            ];
            for (const pattern of internalPatterns) {
                if (pattern.test(hostname)) {
                    this.logger.warn(`SSRF attempt detected: ${hostname}`);
                    return false;
                }
            }
            // Only allow http and https
            return url.protocol === 'http:' || url.protocol === 'https:';
        }
        catch {
            return false;
        }
    }
    /**
     * Make a GET request
     */
    async get(url, options) {
        return this.request(url, { ...options, method: 'GET' });
    }
    /**
     * Make a POST request
     */
    async post(url, body, options) {
        return this.request(url, { ...options, method: 'POST', body });
    }
    /**
     * Make a PUT request
     */
    async put(url, body, options) {
        return this.request(url, { ...options, method: 'PUT', body });
    }
    /**
     * Make a DELETE request
     */
    async delete(url, options) {
        return this.request(url, { ...options, method: 'DELETE' });
    }
    /**
     * Make a PATCH request
     */
    async patch(url, body, options) {
        return this.request(url, { ...options, method: 'PATCH', body });
    }
};
exports.SecureHttpClientService = SecureHttpClientService;
exports.SecureHttpClientService = SecureHttpClientService = SecureHttpClientService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [api_key_vault_service_1.ApiKeyVaultService])
], SecureHttpClientService);
//# sourceMappingURL=secure-http-client.service.js.map