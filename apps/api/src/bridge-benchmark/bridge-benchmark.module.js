"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BridgeBenchmarkModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const bridge_benchmark_entity_1 = require("./entities/bridge-benchmark.entity");
const bridge_benchmark_service_1 = require("./bridge-benchmark.service");
const bridge_benchmark_controller_1 = require("./bridge-benchmark.controller");
let BridgeBenchmarkModule = class BridgeBenchmarkModule {
};
exports.BridgeBenchmarkModule = BridgeBenchmarkModule;
exports.BridgeBenchmarkModule = BridgeBenchmarkModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([bridge_benchmark_entity_1.BridgeBenchmark])],
        controllers: [bridge_benchmark_controller_1.BridgeBenchmarkController],
        providers: [bridge_benchmark_service_1.BridgeBenchmarkService],
        exports: [bridge_benchmark_service_1.BridgeBenchmarkService],
    })
], BridgeBenchmarkModule);
//# sourceMappingURL=bridge-benchmark.module.js.map