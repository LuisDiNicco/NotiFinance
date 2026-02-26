import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { PaginatedRequest } from '../../../../../application/ITemplateRepository';

export class TemplateListQueryRequest {
  @ApiPropertyOptional({
    description: 'Page number (starts at 1)',
    default: 1,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit: number = 10;

  @ApiPropertyOptional({
    description: 'Sorting field',
    enum: ['name', 'eventType', 'createdAt'],
    default: 'createdAt',
  })
  @IsIn(['name', 'eventType', 'createdAt'])
  @IsOptional()
  sortBy: 'name' | 'eventType' | 'createdAt' = 'createdAt';

  toPagination(): PaginatedRequest {
    return {
      page: this.page,
      limit: this.limit,
      sortBy: this.sortBy,
    };
  }
}
