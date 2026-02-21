import { NotificationTemplate } from '../domain/entities/NotificationTemplate';

export const TEMPLATE_REPO = 'ITemplateRepository';

export interface ITemplateRepository {
    findByEventType(eventType: string): Promise<NotificationTemplate | null>;
    save(template: NotificationTemplate): Promise<NotificationTemplate>;
}
