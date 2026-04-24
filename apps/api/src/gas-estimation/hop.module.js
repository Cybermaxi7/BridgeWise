"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HopModule = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const hop_adapter_1 = require("./adapters/hop.adapter");
const hop_service_1 = require("./hop.service");
const config_module_1 = require("../config/config.module");
/**
 * STEP 15: Creating the Hop Module
 * =================================
 *
 * In NestJS, a "Module" is like a container that groups related code together.
 * Think of it like organizing your closet:
 * - All your shirts go in one drawer
 * - All your pants go in another drawer
 * - This module is the "Hop Protocol drawer"
 *
 * What does this module do?
 * 1. Imports dependencies (HttpModule for making API calls, ConfigModule for settings)
 * 2. Provides services (HopAdapter and HopService)
 * 3. Exports services (makes them available to other parts of the app)
 *
 * Why do we need a module?
 * - Keeps code organized
 * - Makes dependencies clear
 * - Enables dependency injection (NestJS automatically creates and injects instances)
 * - Makes testing easier (we can test this module in isolation)
 */
let HopModule = class HopModule {
};
exports.HopModule = HopModule;
exports.HopModule = HopModule = __decorate([
    (0, common_1.Module)({
        /**
         * IMPORTS: Other modules we depend on
         * ====================================
         *
         * - HttpModule: Provides HttpService for making HTTP requests to Hop API
         * - ConfigModule: Provides ConfigService for accessing environment variables
         */
        imports: [
            axios_1.HttpModule.register({
                timeout: 10000, // 10 second timeout for HTTP requests
                maxRedirects: 5, // Follow up to 5 redirects
            }),
            config_module_1.ConfigModule,
        ],
        /**
         * PROVIDERS: Services this module creates
         * ========================================
         *
         * These are the "workers" of our module.
         * NestJS will create one instance of each and manage their lifecycle.
         *
         * - HopService: Handles route/fee normalization and caching
         * - HopAdapter: Handles communication with Hop API
         */
        providers: [hop_service_1.HopService, hop_adapter_1.HopAdapter],
        /**
         * EXPORTS: Services we make available to other modules
         * =====================================================
         *
         * Other modules can import HopModule and use these services.
         *
         * Example:
         * ```typescript
         * @Module({
         *   imports: [HopModule],
         * })
         * export class SomeOtherModule {
         *   constructor(private hopAdapter: HopAdapter) {}
         * }
         * ```
         */
        exports: [hop_service_1.HopService, hop_adapter_1.HopAdapter],
    })
], HopModule);
//# sourceMappingURL=hop.module.js.map