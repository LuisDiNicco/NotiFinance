import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from '../../../../../../src/modules/notification/application/services/NotificationService';
import {
    INotificationRepository,
    NOTIFICATION_REPOSITORY,
} from '../../../../../../src/modules/notification/application/services/INotificationRepository';
import { Notification } from '../../../../../../src/modules/notification/domain/entities/Notification';

describe('NotificationService', () => {
    let service: NotificationService;
    let repository: jest.Mocked<INotificationRepository>;

    beforeEach(async () => {
        repository = {
            findByUserPaginated: jest.fn(),
            countUnread: jest.fn(),
            findById: jest.fn(),
            save: jest.fn(),
            markAllAsRead: jest.fn(),
            delete: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                NotificationService,
                {
                    provide: NOTIFICATION_REPOSITORY,
                    useValue: repository,
                },
            ],
        }).compile();

        service = module.get(NotificationService);
    });

    it('creates a notification entity and persists it', async () => {
        repository.save.mockImplementation(async (notification: Notification) => notification);

        const result = await service.createNotification({
            userId: 'user-1',
            title: 'Title',
            body: 'Body',
            type: 'alert.price.above',
            metadata: { ticker: 'GGAL' },
        });

        expect(result.userId).toBe('user-1');
        expect(repository.save).toHaveBeenCalledTimes(1);
    });

    it('marks notification as read when it belongs to the user', async () => {
        const notification = new Notification({
            userId: 'user-1',
            title: 'Title',
            body: 'Body',
            type: 'alert.price.above',
            isRead: false,
        });
        notification.id = 'notif-1';
        repository.findById.mockResolvedValue(notification);
        repository.save.mockImplementation(async (entity: Notification) => entity);

        await service.markAsRead('user-1', 'notif-1');

        expect(repository.save).toHaveBeenCalledTimes(1);
        expect(notification.isRead).toBe(true);
    });

    it('does not delete notification when it does not belong to the user', async () => {
        repository.findById.mockResolvedValue(
            new Notification({
                userId: 'other-user',
                title: 'Title',
                body: 'Body',
                type: 'alert.price.above',
            }),
        );

        await service.deleteNotification('user-1', 'notif-1');

        expect(repository.delete).not.toHaveBeenCalled();
    });
});
