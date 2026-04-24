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
var QuotesController_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuotesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const fee_aggregation_service_1 = require("./services/fee-aggregation.service");
const get_quotes_dto_1 = require("./dto/get-quotes.dto");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
let QuotesController = QuotesController_1 = class QuotesController {
    constructor(aggregationService) {
        this.aggregationService = aggregationService;
        this.logger = new common_1.Logger(QuotesController_1.name);
    }
    async compareQuotes(query) {
        const dto = (0, class_transformer_1.plainToInstance)(get_quotes_dto_1.GetQuotesDto, query);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            const messages = errors.flatMap((e) => Object.values(e.constraints ?? {}));
            throw new common_1.BadRequestException(messages);
        }
        this.logger.log(`Comparing quotes: ${dto.token} ${dto.amount} from chain ${dto.fromChain} → ${dto.toChain} [rankBy=${dto.rankBy}]`);
        return this.aggregationService.compareQuotes({
            fromChain: dto.fromChain,
            toChain: dto.toChain,
            token: dto.token,
            amount: dto.amount,
        }, dto.rankBy);
    }
};
exports.QuotesController = QuotesController;
__decorate([
    (0, common_1.Get)('compare'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Compare live bridge quotes',
        description: 'Fetches and ranks real-time quotes from all registered bridge adapters for a given transfer request.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'fromChain', type: Number, example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'toChain', type: Number, example: 137 }),
    (0, swagger_1.ApiQuery)({ name: 'token', type: String, example: 'USDC' }),
    (0, swagger_1.ApiQuery)({ name: 'amount', type: String, example: '1000' }),
    (0, swagger_1.ApiQuery)({
        name: 'rankBy',
        enum: ['cost', 'speed', 'score'],
        required: false,
        description: 'Ranking strategy (default: score)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Ranked bridge quotes returned successfully',
        type: get_quotes_dto_1.CompareQuotesResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid query parameters' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], QuotesController.prototype, "compareQuotes", null);
exports.QuotesController = QuotesController = QuotesController_1 = __decorate([
    (0, swagger_1.ApiTags)('Bridge Quotes'),
    (0, common_1.Controller)('quotes'),
    __metadata("design:paramtypes", [typeof (_a = typeof fee_aggregation_service_1.FeeAggregationService !== "undefined" && fee_aggregation_service_1.FeeAggregationService) === "function" ? _a : Object])
], QuotesController);
//# sourceMappingURL=quotes.controller.js.map