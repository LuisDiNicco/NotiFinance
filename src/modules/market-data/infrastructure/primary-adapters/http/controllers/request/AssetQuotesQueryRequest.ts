import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class AssetQuotesQueryRequest {
  @ApiPropertyOptional({
    example: 30,
    minimum: 1,
    maximum: 365,
    description: 'Cantidad de días históricos a recuperar',
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  public readonly days?: number;
}
