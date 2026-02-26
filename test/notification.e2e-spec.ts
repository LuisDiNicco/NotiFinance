import { ExecutionContext, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { NotificationController } from '../src/modules/notification/infrastructure/primary-adapters/http/controllers/NotificationController';
import { NotificationService } from '../src/modules/notification/application/services/NotificationService';
import { JwtAuthGuard } from '../src/modules/auth/infrastructure/primary-adapters/http/guards/JwtAuthGuard';
import { Notification } from '../src/modules/notification/domain/entities/Notification';

describe('Notification endpoints (e2e)', () => {
    let app: INestApplication;

    const notification = new Notification({
        userId: 'user-1',
        alertId: '11111111-1111-4111-8111-111111111111',
        title: 'GGAL reached threshold',
        body: 'GGAL crossed your alert threshold',
        type: 'alert.price.above',
        metadata: { ticker: 'GGAL' },
        isRead: false,
    });
    notification.id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

    const notificationServiceMock = {
        getUserNotifications: jest.fn().mockResolvedValue([notification]),
        getUnreadCount: jest.fn().mockResolvedValue(1),
        createNotification: jest.fn(),
        markAsRead: jest.fn().mockResolvedValue(undefined),
        markAllAsRead: jest.fn().mockResolvedValue(undefined),
        deleteNotification: jest.fn().mockResolvedValue(undefined),
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            controllers: [NotificationController],
            providers: [
                {
                    provide: NotificationService,
                    useValue: notificationServiceMock,
                },
            ],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({
                canActivate: (context: ExecutionContext) => {
                    const req = context.switchToHttp().getRequest();
                    req.user = { sub: 'user-1' };
                    return true;
                },
            })
            .compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
            }),
        );

        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('/notifications (GET)', async () => {
        const response = await request(app.getHttpServer())
            .get('/notifications?unreadOnly=true&page=1&limit=20')
            .expect(200);

        expect(response.body).toHaveLength(1);
    });

    it('/notifications/count (GET)', async () => {
        const response = await request(app.getHttpServer()).get('/notifications/count').expect(200);
        expect(response.body.unread).toBe(1);
    });

    it('/notifications/:id/read (PATCH)', async () => {
        await request(app.getHttpServer()).patch(`/notifications/${notification.id}/read`).expect(200);
    });

    it('/notifications/read-all (PATCH)', async () => {
        await request(app.getHttpServer()).patch('/notifications/read-all').expect(200);
    });

    it('/notifications/:id (DELETE)', async () => {
        await request(app.getHttpServer()).delete(`/notifications/${notification.id}`).expect(200);
    });
});
