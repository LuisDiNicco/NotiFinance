import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResponse } from '../../../../application/ITemplateRepository';
import { NotificationTemplate } from '../../../../domain/entities/NotificationTemplate';
import { NotificationTemplateResponse } from './NotificationTemplateResponse';

export class PaginatedTemplateResponse {
  @ApiProperty({
    type: NotificationTemplateResponse,
    isArray: true,
  })
  data!: NotificationTemplateResponse[];

  @ApiProperty({
    example: 42,
    description: 'Total number of records',
  })
  total!: number;

  @ApiProperty({
    example: 1,
    description: 'Current page number',
  })
  page!: number;

  @ApiProperty({
    example: 5,
    description: 'Total number of pages',
  })
  totalPages!: number;

  static fromPaginated(
    result: PaginatedResponse<NotificationTemplate>,
  ): PaginatedTemplateResponse {
    const response = new PaginatedTemplateResponse();
    response.data = result.data.map((item) =>
      NotificationTemplateResponse.fromEntity(item),
    );
    response.total = result.total;
    response.page = result.page;
    response.totalPages = result.totalPages;
    return response;
  }
}
