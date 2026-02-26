import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

export class TradeHistoryQueryRequest {
  @ApiPropertyOptional({
    example: 'executedAt:DESC',
    enum: ['executedAt:ASC', 'executedAt:DESC'],
  })
  @IsOptional()
  @IsIn(['executedAt:ASC', 'executedAt:DESC'])
  public readonly sortBy?: string;

  @ApiPropertyOptional({ example: 1, minimum: 1 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  public readonly page?: number;

  @ApiPropertyOptional({ example: 20, minimum: 1, maximum: 100 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  public readonly limit?: number;
}
