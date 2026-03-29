import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
  IsISO8601,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { AnalyticsMetric } from '../enums/analytics-metric.enum';

@ValidatorConstraint({ name: 'DateRangeValid', async: false })
class DateRangeConstraint implements ValidatorConstraintInterface {
  validate(_value: unknown, args: { object: ExportAnalyticsDto }): boolean {
    const { startDate, endDate } = args.object;
    if (!startDate || !endDate) return true;
    return new Date(startDate) < new Date(endDate);
  }

  defaultMessage(): string {
    return 'startDate must be before endDate';
  }
}

@ValidatorConstraint({ name: 'MaxRangeValid', async: false })
class MaxRangeConstraint implements ValidatorConstraintInterface {
  private readonly MAX_DAYS = 365;

  validate(_value: unknown, args: { object: ExportAnalyticsDto }): boolean {
    const { startDate, endDate } = args.object;
    if (!startDate || !endDate) return true;
    const diffMs =
      new Date(endDate).getTime() - new Date(startDate).getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays <= this.MAX_DAYS;
  }

  defaultMessage(): string {
    return 'Date range cannot exceed 365 days';
  }
}

export class ExportAnalyticsDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(AnalyticsMetric, { each: true })
  @Transform(({ value }) =>
    Array.isArray(value) ? value : [value],
  )
  metrics: AnalyticsMetric[];

  @IsISO8601()
  @Validate(DateRangeConstraint)
  @Validate(MaxRangeConstraint)
  startDate: string;

  @IsISO8601()
  endDate: string;

  @IsOptional()
  @IsUUID()
  networkId?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  includeMetadata?: boolean = true;

  @IsOptional()
  @IsIn([',', ';', '\t'])
  delimiter?: ',' | ';' | '\t' = ',';

  @IsOptional()
  @IsIn(['iso', 'unix', 'locale'])
  dateFormat?: 'iso' | 'unix' | 'locale' = 'iso';

  @IsOptional()
  @IsString()
  timezone?: string = 'UTC';

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1_000_000)
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  async?: boolean = false;
}
