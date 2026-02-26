import { Notification } from '../../domain/entities/Notification';

export const NOTIFICATION_REPOSITORY = 'INotificationRepository';

export interface INotificationRepository {
    findByUserPaginated(userId: string, unreadOnly: boolean, page: number, limit: number): Promise<Notification[]>;
    countUnread(userId: string): Promise<number>;
    findById(notificationId: string): Promise<Notification | null>;
    save(notification: Notification): Promise<Notification>;
    markAllAsRead(userId: string): Promise<void>;
    delete(notificationId: string): Promise<void>;
}
