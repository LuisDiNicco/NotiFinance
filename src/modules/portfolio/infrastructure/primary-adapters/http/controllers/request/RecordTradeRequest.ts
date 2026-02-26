import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsISO8601,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { TradeType } from '../../../../../domain/enums/TradeType';

export class RecordTradeRequest {
  @ApiPropertyOptional({ example: '2026-02-26T15:00:00.000Z' })
  @IsOptional()
  @IsISO8601()
  public readonly executedAt?: string;

  @ApiProperty({ example: 'GGAL' })
  @IsString()
  @MaxLength(20)
  public readonly ticker!: string;

  @ApiProperty({ enum: TradeType })
  @IsEnum(TradeType)
  public readonly tradeType!: TradeType;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0.000001)
  public readonly quantity!: number;

  @ApiProperty({ example: 1500 })
  @IsNumber()
  @Min(0)
  public readonly pricePerUnit!: number;

  @ApiProperty({ example: 'ARS' })
  @IsString()
  @MaxLength(10)
  public readonly currency!: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  public readonly commission?: number;
}
