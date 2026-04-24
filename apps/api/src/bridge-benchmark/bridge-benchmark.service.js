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
var BridgeBenchmarkService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BridgeBenchmarkService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const bridge_benchmark_entity_1 = require("./entities/bridge-benchmark.entity");
let BridgeBenchmarkService = BridgeBenchmarkService_1 = class BridgeBenchmarkService {
    constructor(benchmarkRepository, eventEmitter) {
        this.benchmarkRepository = benchmarkRepository;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(BridgeBenchmarkService_1.name);
    }
    async initiate(dto) {
        const benchmark = this.benchmarkRepository.create({
            bridgeName: dto.bridgeName,
            sourceChain: dto.sourceChain,
            destinationChain: dto.destinationChain,
            token: dto.token,
            sourceChainType: dto.sourceChainType,
            destinationChainType: dto.destinationChainType,
            amount: dto.amount,
            quoteRequestedAt: dto.quoteRequestedAt
                ? new Date(dto.quoteRequestedAt)
                : null,
            startTime: new Date(),
            status: bridge_benchmark_entity_1.TransactionStatus.SUBMITTED,
        });
        return this.benchmarkRepository.save(benchmark);
    }
    async confirm(id, dto) {
        const benchmark = await this.findOneOrFail(id);
        if (benchmark.status === bridge_benchmark_entity_1.TransactionStatus.CONFIRMED) {
            throw new common_1.BadRequestException('Benchmark already confirmed');
        }
        const now = new Date();
        const durationMs = now.getTime() - benchmark.startTime.getTime();
        benchmark.destinationConfirmedAt = now;
        benchmark.completionTime = now;
        benchmark.durationMs = durationMs;
        benchmark.status = bridge_benchmark_entity_1.TransactionStatus.CONFIRMED;
        if (dto.transactionHash) {
            benchmark.transactionHash = dto.transactionHash;
        }
        if (dto.destinationTxHash) {
            benchmark.destinationTxHash = dto.destinationTxHash;
        }
        const saved = await this.benchmarkRepository.save(benchmark);
        // Emit event for analytics collection
        const event = {
            id: saved.id,
            bridgeName: saved.bridgeName,
            sourceChain: saved.sourceChain,
            destinationChain: saved.destinationChain,
            token: saved.token,
            status: 'confirmed',
            durationMs,
            amount: saved.amount || undefined,
            completedAt: now,
        };
        this.eventEmitter.emit('benchmark.completed', event);
        this.logger.debug(`Emitted benchmark.completed event for ${id}`);
        return saved;
    }
    async updateStatus(id, dto) {
        const benchmark = await this.findOneOrFail(id);
        const previousStatus = benchmark.status;
        benchmark.status = dto.status;
        if (dto.transactionHash) {
            benchmark.transactionHash = dto.transactionHash;
        }
        const saved = await this.benchmarkRepository.save(benchmark);
        // Emit event if status changed to failed
        if (dto.status === bridge_benchmark_entity_1.TransactionStatus.FAILED &&
            previousStatus !== bridge_benchmark_entity_1.TransactionStatus.FAILED) {
            const now = new Date();
            const durationMs = benchmark.startTime
                ? now.getTime() - benchmark.startTime.getTime()
                : 0;
            const event = {
                id: saved.id,
                bridgeName: saved.bridgeName,
                sourceChain: saved.sourceChain,
                destinationChain: saved.destinationChain,
                token: saved.token,
                status: 'failed',
                durationMs,
                amount: saved.amount || undefined,
                completedAt: now,
            };
            this.eventEmitter.emit('benchmark.completed', event);
            this.logger.debug(`Emitted benchmark.completed (failed) event for ${id}`);
        }
        return saved;
    }
    async getSpeedMetrics(query) {
        const rollingWindow = query.rollingWindow ?? 50;
        const qb = this.benchmarkRepository
            .createQueryBuilder('b')
            .select('b.bridge_name', 'bridgeName')
            .addSelect('b.source_chain', 'sourceChain')
            .addSelect('b.destination_chain', 'destinationChain')
            .addSelect('b.token', 'token')
            .addSelect('AVG(b.duration_ms)', 'avgDurationMs')
            .addSelect('MIN(b.duration_ms)', 'minDurationMs')
            .addSelect('MAX(b.duration_ms)', 'maxDurationMs')
            .addSelect('COUNT(*)', 'totalTransactions')
            .addSelect(`COUNT(*) FILTER (WHERE b.status = '${bridge_benchmark_entity_1.TransactionStatus.CONFIRMED}')`, 'successfulTransactions')
            .addSelect('MAX(b.completion_time)', 'lastUpdated')
            .where('b.status = :status', { status: bridge_benchmark_entity_1.TransactionStatus.CONFIRMED })
            .andWhere('b.duration_ms IS NOT NULL')
            .groupBy('b.bridge_name')
            .addGroupBy('b.source_chain')
            .addGroupBy('b.destination_chain')
            .addGroupBy('b.token');
        if (query.bridgeName) {
            qb.andWhere('b.bridge_name = :bridgeName', {
                bridgeName: query.bridgeName,
            });
        }
        if (query.sourceChain) {
            qb.andWhere('b.source_chain = :sourceChain', {
                sourceChain: query.sourceChain,
            });
        }
        if (query.destinationChain) {
            qb.andWhere('b.destination_chain = :destinationChain', {
                destinationChain: query.destinationChain,
            });
        }
        if (query.token) {
            qb.andWhere('b.token = :token', { token: query.token });
        }
        const rawMetrics = await qb.getRawMany();
        const metrics = await Promise.all(rawMetrics.map(async (row) => {
            const rollingAvgDurationMs = await this.computeRollingAverage(row.bridgeName, row.sourceChain, row.destinationChain, row.token, rollingWindow);
            const total = parseInt(row.totalTransactions, 10);
            const successful = parseInt(row.successfulTransactions, 10);
            return {
                bridgeName: row.bridgeName,
                sourceChain: row.sourceChain,
                destinationChain: row.destinationChain,
                token: row.token,
                avgDurationMs: parseFloat(row.avgDurationMs),
                minDurationMs: parseInt(row.minDurationMs, 10),
                maxDurationMs: parseInt(row.maxDurationMs, 10),
                totalTransactions: total,
                successfulTransactions: successful,
                successRate: total > 0 ? (successful / total) * 100 : 0,
                rollingAvgDurationMs,
                lastUpdated: row.lastUpdated,
            };
        }));
        return {
            metrics,
            generatedAt: new Date(),
        };
    }
    async getRankingMetrics() {
        const result = await this.getSpeedMetrics({ rollingWindow: 50 });
        return result.metrics.map((m) => ({
            bridgeName: m.bridgeName,
            sourceChain: m.sourceChain,
            destinationChain: m.destinationChain,
            token: m.token,
            rollingAvgDurationMs: m.rollingAvgDurationMs,
            successRate: m.successRate,
        }));
    }
    async findOne(id) {
        return this.benchmarkRepository.findOne({ where: { id } });
    }
    async findOneOrFail(id) {
        const benchmark = await this.findOne(id);
        if (!benchmark) {
            throw new common_1.NotFoundException(`Benchmark with id ${id} not found`);
        }
        return benchmark;
    }
    async computeRollingAverage(bridgeName, sourceChain, destinationChain, token, windowSize) {
        const rows = await this.benchmarkRepository
            .createQueryBuilder('b')
            .select('b.duration_ms', 'durationMs')
            .where('b.bridge_name = :bridgeName', { bridgeName })
            .andWhere('b.source_chain = :sourceChain', { sourceChain })
            .andWhere('b.destination_chain = :destinationChain', { destinationChain })
            .andWhere('b.token = :token', { token })
            .andWhere('b.status = :status', { status: bridge_benchmark_entity_1.TransactionStatus.CONFIRMED })
            .andWhere('b.duration_ms IS NOT NULL')
            .orderBy('b.completion_time', 'DESC')
            .limit(windowSize)
            .getRawMany();
        if (rows.length === 0)
            return 0;
        const sum = rows.reduce((acc, r) => acc + parseInt(r.durationMs, 10), 0);
        return sum / rows.length;
    }
};
exports.BridgeBenchmarkService = BridgeBenchmarkService;
exports.BridgeBenchmarkService = BridgeBenchmarkService = BridgeBenchmarkService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(bridge_benchmark_entity_1.BridgeBenchmark)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        event_emitter_1.EventEmitter2])
], BridgeBenchmarkService);
//# sourceMappingURL=bridge-benchmark.service.js.map