"use strict";
// import { PartialType } from '@nestjs/mapped-types';
// import { CreateTransactionDto } from './create-transaction.dto';
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTransactionDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const transaction_entity_1 = require("../entities/transaction.entity");
// export class UpdateTransactionDto extends PartialType(CreateTransactionDto) {}
class UpdateTransactionDto {
}
exports.UpdateTransactionDto = UpdateTransactionDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: transaction_entity_1.TransactionStatus,
        description: 'Updated transaction status',
        required: false,
        example: 'completed',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(transaction_entity_1.TransactionStatus),
    __metadata("design:type", String)
], UpdateTransactionDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: Object,
        description: 'Updated internal state object. Typically contains boolean flags for transaction milestones (validated, submitted, confirmed).',
        required: false,
        example: {
            validated: true,
            submitted: true,
            confirmed: true,
        },
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdateTransactionDto.prototype, "state", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: Number,
        description: 'Current step number in the transaction workflow. Should be incremented as transaction progresses.',
        required: false,
        example: 2,
        minimum: 0,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateTransactionDto.prototype, "currentStep", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: String,
        description: 'Error message if transaction has failed. Populated when status is "failed" or "error".',
        required: false,
        example: 'Insufficient balance for transaction',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTransactionDto.prototype, "error", void 0);
//# sourceMappingURL=update-transaction.dto.js.map