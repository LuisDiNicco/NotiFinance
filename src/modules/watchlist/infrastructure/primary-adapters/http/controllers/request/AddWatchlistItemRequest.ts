import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class AddWatchlistItemRequest {
    @ApiProperty({ example: 'GGAL' })
    @IsString()
    @MinLength(1)
    @MaxLength(20)
    public readonly ticker!: string;
}
