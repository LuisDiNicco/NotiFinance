import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class RelatedAssetsQueryRequest {
  @ApiPropertyOptional({ example: 5, minimum: 1, maximum: 20 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  public readonly limit?: number;
}
