import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { RedisService } from '../src/shared/infrastructure/base/redis/redis.service';
import { EVENT_PUBLISHER } from '../src/modules/ingestion/application/IEventPublisher';
import { CustomExceptionsFilter } from '../src/shared/infrastructure/primary-adapters/http/filters/CustomExceptionsFilter';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserPreferenceEntity } from '../src/modules/preferences/infrastructure/secondary-adapters/database/entities/UserPreferenceEntity';
import { NotificationTemplateEntity } from '../src/modules/template/infrastructure/secondary-adapters/database/entities/NotificationTemplateEntity';

describe('IngestionController (e2e)', () => {
    let app: INestApplication;
    const mockRedisService = { setNx: jest.fn() };
    const mockPublisher = { publishEvent: jest.fn() };
    const mockRepository = { findOne: jest.fn(), save: jest.fn(), create: jest.fn() };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(RedisService).useValue(mockRedisService)
            .overrideProvider(EVENT_PUBLISHER).useValue(mockPublisher)
            .overrideProvider(getRepositoryToken(UserPreferenceEntity)).useValue(mockRepository)
            .overrideProvider(getRepositoryToken(NotificationTemplateEntity)).useValue(mockRepository)
            .compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
        app.useGlobalFilters(new CustomExceptionsFilter());
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('/events (POST) - should accept valid payload', () => {
        mockRedisService.setNx.mockResolvedValueOnce(true);
        mockPublisher.publishEvent.mockResolvedValueOnce(undefined);

        return request(app.getHttpServer())
            .post('/events')
            .set('x-correlation-id', 'test-corr-id')
            .send({
                eventId: '550e8400-e29b-41d4-a716-446655440000',
                eventType: 'payment.success',
                recipientId: 'user-123',
                metadata: { amount: 100 }
            })
            .expect(202);
    });

    it('/events (POST) - should return 200 OK for duplicate event (Idempotency)', () => {
        mockRedisService.setNx.mockResolvedValueOnce(false);

        return request(app.getHttpServer())
            .post('/events')
            .send({
                eventId: '550e8400-e29b-41d4-a716-446655440000',
                eventType: 'payment.success',
                recipientId: 'user-123',
                metadata: { amount: 100 }
            })
            .expect(200)
            .expect((res) => {
                expect(res.body.message).toBe('Event already processed or processing');
            });
    });

    it('/events (POST) - should fail on schema validation error', () => {
        return request(app.getHttpServer())
            .post('/events')
            .send({
                eventId: 'invalid-id-format',
                eventType: 'invalid.type',
            })
            .expect(400);
    });
});
