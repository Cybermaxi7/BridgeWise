/**
 * Token Metadata Module
 * 
 * Provides automatic token metadata fetching and caching functionality
 */

import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TokenMetadataService } from './token-metadata.service';
import { TokenMetadataController } from './token-metadata.controller';

@Module({
  imports: [HttpModule],
  controllers: [TokenMetadataController],
  providers: [TokenMetadataService],
  exports: [TokenMetadataService],
})
export class TokenMetadataModule {}