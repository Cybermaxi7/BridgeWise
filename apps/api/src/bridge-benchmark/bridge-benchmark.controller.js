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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BridgeBenchmarkController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const bridge_benchmark_service_1 = require("./bridge-benchmark.service");
const bridge_benchmark_dto_1 = require("./dto/bridge-benchmark.dto");
const bridge_benchmark_entity_1 = require("./entities/bridge-benchmark.entity");
let BridgeBenchmarkController = class BridgeBenchmarkController {
    constructor(benchmarkService) {
        this.benchmarkService = benchmarkService;
    }
    initiate(dto) {
        return this.benchmarkService.initiate(dto);
    }
    confirm(id, dto) {
        return this.benchmarkService.confirm(id, dto);
    }
    updateStatus(id, dto) {
        return this.benchmarkService.updateStatus(id, dto);
    }
    findOne(id) {
        return this.benchmarkService.findOne(id);
    }
    getSpeedMetrics(query) {
        return this.benchmarkService.getSpeedMetrics(query);
    }
};
exports.BridgeBenchmarkController = BridgeBenchmarkController;
__decorate([
    (0, common_1.Post)('benchmarks'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({
        summary: 'Initiate a bridge transaction benchmark',
        description: 'Records the start of a bridge transaction lifecycle for speed tracking.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Benchmark initiated',
        type: bridge_benchmark_entity_1.BridgeBenchmark,
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bridge_benchmark_dto_1.InitiateBenchmarkDto]),
    __metadata("design:returntype", Promise)
], BridgeBenchmarkController.prototype, "initiate", null);
__decorate([
    (0, common_1.Patch)('benchmarks/:id/confirm'),
    (0, swagger_1.ApiOperation)({
        summary: 'Confirm destination chain settlement',
        description: 'Records the completion timestamp and calculates total settlement duration.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Benchmark UUID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Benchmark confirmed',
        type: bridge_benchmark_entity_1.BridgeBenchmark,
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, bridge_benchmark_dto_1.ConfirmBenchmarkDto]),
    __metadata("design:returntype", Promise)
], BridgeBenchmarkController.prototype, "confirm", null);
__decorate([
    (0, common_1.Patch)('benchmarks/:id/status'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update benchmark transaction status',
        description: 'Update the status (pending, submitted, confirmed, failed).',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Benchmark UUID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Status updated',
        type: bridge_benchmark_entity_1.BridgeBenchmark,
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, bridge_benchmark_dto_1.UpdateBenchmarkStatusDto]),
    __metadata("design:returntype", Promise)
], BridgeBenchmarkController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Get)('benchmarks/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a single benchmark record' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Benchmark UUID' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: bridge_benchmark_entity_1.BridgeBenchmark }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BridgeBenchmarkController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('speed-metrics'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get bridge speed metrics',
        description: 'Returns aggregated speed metrics per bridge/route including rolling averages for the last N transactions (default 50). Suitable for consumption by the ranking engine.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Speed metrics per bridge route',
        type: bridge_benchmark_dto_1.SpeedMetricsResponseDto,
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bridge_benchmark_dto_1.SpeedMetricsQueryDto]),
    __metadata("design:returntype", Promise)
], BridgeBenchmarkController.prototype, "getSpeedMetrics", null);
exports.BridgeBenchmarkController = BridgeBenchmarkController = __decorate([
    (0, swagger_1.ApiTags)('Bridge Benchmarks'),
    (0, common_1.Controller)('api/v1/bridges'),
    __metadata("design:paramtypes", [bridge_benchmark_service_1.BridgeBenchmarkService])
], BridgeBenchmarkController);
//# sourceMappingURL=bridge-benchmark.controller.js.map