import { Inject, Injectable } from '@nestjs/common';
import {
    NOTIFICATION_REPOSITORY,
} from './INotificationRepository';
import type { INotificationRepository } from './INotificationRepository';
import { Notification } from '../../domain/entities/Notification';

@Injectable()
export class NotificationService {
    constructor(
        @Inject(NOTIFICATION_REPOSITORY)
        private readonly notificationRepository: INotificationRepository,
    ) { }

    public async getUserNotifications(userId: string, unreadOnly: boolean, page: number, limit: number): Promise<Notification[]> {
        return this.notificationRepository.findByUserPaginated(userId, unreadOnly, page, limit);
    }

    public async getUnreadCount(userId: string): Promise<number> {
        return this.notificationRepository.countUnread(userId);
    }

    public async createNotification(params: {
        userId: string;
        alertId?: string | null;
        title: string;
        body: string;
        type: string;
        metadata?: Record<string, unknown>;
    }): Promise<Notification> {
        const notification = new Notification({
            userId: params.userId,
            alertId: params.alertId ?? null,
            title: params.title,
            body: params.body,
            type: params.type,
            metadata: params.metadata ?? {},
            isRead: false,
        });

        return this.notificationRepository.save(notification);
    }

    public async markAsRead(userId: string, notificationId: string): Promise<void> {
        const notification = await this.notificationRepository.findById(notificationId);
        if (!notification || notification.userId !== userId) {
            return;
        }

        notification.markAsRead();
        await this.notificationRepository.save(notification);
    }

    public async markAllAsRead(userId: string): Promise<void> {
        await this.notificationRepository.markAllAsRead(userId);
    }

    public async deleteNotification(userId: string, notificationId: string): Promise<void> {
        const notification = await this.notificationRepository.findById(notificationId);
        if (!notification || notification.userId !== userId) {
            return;
        }

        await this.notificationRepository.delete(notificationId);
    }
}
