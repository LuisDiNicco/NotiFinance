import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { IsEnum } from 'class-validator';
import { DollarType } from '../../../../../domain/enums/DollarType';

export class MarketHistoryQueryRequest {
  @ApiPropertyOptional({ enum: DollarType, example: DollarType.MEP })
  @IsOptional()
  @IsEnum(DollarType)
  public readonly type?: DollarType;

  @ApiPropertyOptional({ example: 30, minimum: 1, maximum: 365 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  public readonly days?: number;
}
