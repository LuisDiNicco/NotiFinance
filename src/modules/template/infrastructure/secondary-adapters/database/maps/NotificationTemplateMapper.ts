import { NotificationTemplate } from '../../../../domain/entities/NotificationTemplate';
import { NotificationTemplateEntity } from '../entities/NotificationTemplateEntity';

/**
 * Maps between the database entity (NotificationTemplateEntity) and domain entity (NotificationTemplate).
 * Provides clean separation and prevents leaking ORM concerns into business logic.
 */
export class NotificationTemplateMapper {
    /**
     * Maps a raw database entity to a domain entity.
     * @param entity The database entity from TypeORM
     * @returns A domain entity ready for use in business logic
     */
    static toDomain(entity: NotificationTemplateEntity | { id: string; name: string; eventType: string; subjectTemplate: string; bodyTemplate: string }): NotificationTemplate {
        const domain = new NotificationTemplate(
            entity.name,
            entity.eventType,
            entity.subjectTemplate,
            entity.bodyTemplate,
        );
        domain.id = entity.id;
        return domain;
    }

    /**
     * Maps a domain entity to a database persistence format.
     * @param domain The domain entity
     * @returns An object ready for persistence in the database
     */
    static toPersistence(domain: NotificationTemplate): {
        name: string;
        eventType: string;
        subjectTemplate: string;
        bodyTemplate: string;
    } {
        return {
            name: domain.name,
            eventType: domain.eventType,
            subjectTemplate: domain.subjectTemplate,
            bodyTemplate: domain.bodyTemplate,
        };
    }
}
