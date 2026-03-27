import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { OverrideType } from '../entities/route-override.entity';

export class CreateRouteOverrideDto {
  @ApiProperty({
    description: 'Bridge provider ID to override',
    example: 'stargate',
  })
  @IsString()
  @IsNotEmpty()
  bridgeId: string;

  @ApiProperty({ description: 'Source blockchain', example: 'stellar' })
  @IsString()
  @IsNotEmpty()
  sourceChain: string;

  @ApiProperty({ description: 'Destination blockchain', example: 'ethereum' })
  @IsString()
  @IsNotEmpty()
  destinationChain: string;

  @ApiProperty({ description: 'Source token symbol', example: 'USDC' })
  @IsString()
  @IsNotEmpty()
  sourceToken: string;

  @ApiProperty({
    description: 'Type of override to apply',
    enum: OverrideType,
    example: OverrideType.FORCE_FIRST,
  })
  @IsEnum(OverrideType)
  overrideType: OverrideType;

  @ApiPropertyOptional({
    description:
      'Score adjustment value (-100 to +100). Only used when overrideType is score_adjustment.',
    example: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-100)
  @Max(100)
  scoreAdjustment?: number;

  @ApiPropertyOptional({
    description: 'Human-readable reason for the override',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class UpdateRouteOverrideDto extends PartialType(
  CreateRouteOverrideDto,
) {
  @ApiPropertyOptional({ description: 'Enable or disable this override' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
