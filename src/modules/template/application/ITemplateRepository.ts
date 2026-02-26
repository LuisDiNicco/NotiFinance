import { NotificationTemplate } from '../domain/entities/NotificationTemplate';

export const TEMPLATE_REPO = 'ITemplateRepository';

export interface PaginatedRequest {
  page: number;
  limit: number;
  sortBy: 'name' | 'eventType' | 'createdAt';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ITemplateRepository {
  findByEventType(eventType: string): Promise<NotificationTemplate | null>;
  save(template: NotificationTemplate): Promise<NotificationTemplate>;
  findPaginated(
    request: PaginatedRequest,
  ): Promise<PaginatedResponse<NotificationTemplate>>;
}
