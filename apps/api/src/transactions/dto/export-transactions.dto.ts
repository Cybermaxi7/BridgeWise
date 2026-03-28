import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';

export enum ExportFormat {
  CSV = 'csv',
  JSON = 'json',
}

export class ExportTransactionsDto {
  @ApiProperty({
    required: false,
    description: 'Filter by account address',
    example: '0x742d35Cc6634C0532925a3b844Bc328e8f94D5dC',
  })
  @IsOptional()
  @IsString()
  account?: string;

  @ApiProperty({
    required: false,
    description: 'Filter by source chain',
    example: 'ethereum',
  })
  @IsOptional()
  @IsString()
  sourceChain?: string;

  @ApiProperty({
    required: false,
    description: 'Filter by destination chain',
    example: 'polygon',
  })
  @IsOptional()
  @IsString()
  destinationChain?: string;

  @ApiProperty({
    required: false,
    description: 'Filter by bridge name',
    example: 'hop',
  })
  @IsOptional()
  @IsString()
  bridgeName?: string;

  @ApiProperty({
    required: false,
    description: 'Filter by status',
    enum: ['pending', 'confirmed', 'failed'],
  })
  @IsOptional()
  @IsEnum(['pending', 'confirmed', 'failed'])
  status?: 'pending' | 'confirmed' | 'failed';

  @ApiProperty({
    required: false,
    description: 'Start date (ISO 8601 format)',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiProperty({
    required: false,
    description: 'End date (ISO 8601 format)',
    example: '2024-12-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsString()
  endDate?: string;
}
