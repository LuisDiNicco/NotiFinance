import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class MarketHistoryQueryRequest {
    @ApiPropertyOptional({ example: 30, minimum: 1, maximum: 365 })
    @Type(() => Number)
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(365)
    public readonly days?: number;
}
