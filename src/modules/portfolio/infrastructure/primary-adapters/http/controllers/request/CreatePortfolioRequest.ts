import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreatePortfolioRequest {
  @ApiProperty({ example: 'Main Portfolio' })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  public readonly name!: string;

  @ApiPropertyOptional({ example: 'Long-term holdings' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  public readonly description?: string;
}
