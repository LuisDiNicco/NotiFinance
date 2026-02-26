import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { AssetType } from '../../../../../domain/enums/AssetType';

export class TopMoversQueryRequest {
    @ApiPropertyOptional({ enum: AssetType, default: AssetType.STOCK })
    @IsOptional()
    @IsEnum(AssetType)
    public readonly type?: AssetType;

    @ApiPropertyOptional({ example: 5, minimum: 1, maximum: 50, default: 5 })
    @Type(() => Number)
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(50)
    public readonly limit?: number;
}
