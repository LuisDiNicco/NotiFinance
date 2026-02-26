import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SearchQueryRequest {
  @ApiProperty({ example: 'gal' })
  @IsString()
  @MinLength(1)
  public readonly q!: string;

  @ApiProperty({ required: false, example: 10, minimum: 1, maximum: 100 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  public readonly limit?: number;
}
