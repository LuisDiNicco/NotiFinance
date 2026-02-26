import { Notification } from '../../../../domain/entities/Notification';
import { NotificationEntity } from '../entities/NotificationEntity';

export class NotificationMapper {
    public static toDomain(entity: NotificationEntity): Notification {
        const notification = new Notification({
            userId: entity.userId,
            alertId: entity.alertId,
            title: entity.title,
            body: entity.body,
            type: entity.type,
            metadata: entity.metadata,
            isRead: entity.isRead,
            readAt: entity.readAt,
            createdAt: entity.createdAt,
        });

        notification.id = entity.id;
        return notification;
    }

    public static toPersistence(domain: Notification): NotificationEntity {
        const entity = new NotificationEntity();
        if (domain.id) {
            entity.id = domain.id;
        }

        entity.userId = domain.userId;
        entity.alertId = domain.alertId;
        entity.title = domain.title;
        entity.body = domain.body;
        entity.type = domain.type;
        entity.metadata = domain.metadata;
        entity.isRead = domain.isRead;
        entity.readAt = domain.readAt;

        return entity;
    }
}
