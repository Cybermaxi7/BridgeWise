"use strict";
// Simplified Benchmark Module for BridgeWise
// This is a placeholder implementation that will be enhanced when dependencies are properly configured
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BenchmarkController = exports.BenchmarkService = exports.BenchmarkModule = void 0;
const common_1 = require("@nestjs/common");
const benchmark_service_1 = require("./benchmark.service");
Object.defineProperty(exports, "BenchmarkService", { enumerable: true, get: function () { return benchmark_service_1.BenchmarkService; } });
const benchmark_controller_1 = require("./benchmark.controller");
Object.defineProperty(exports, "BenchmarkController", { enumerable: true, get: function () { return benchmark_controller_1.BenchmarkController; } });
let BenchmarkModule = class BenchmarkModule {
};
exports.BenchmarkModule = BenchmarkModule;
exports.BenchmarkModule = BenchmarkModule = __decorate([
    (0, common_1.Module)({
        providers: [benchmark_service_1.BenchmarkService],
        controllers: [benchmark_controller_1.BenchmarkController],
        exports: [benchmark_service_1.BenchmarkService],
    })
], BenchmarkModule);
//# sourceMappingURL=benchmark.module.js.map