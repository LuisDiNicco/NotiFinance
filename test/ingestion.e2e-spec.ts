import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { EventIngestionController } from '../src/modules/ingestion/infrastructure/primary-adapters/http/controllers/EventIngestionController';
import { EventIngestionService } from '../src/modules/ingestion/application/EventIngestionService';
import { EVENT_PUBLISHER } from '../src/modules/ingestion/application/IEventPublisher';
import { RedisService } from '../src/shared/infrastructure/base/redis/redis.service';
import { IdempotencyInterceptor } from '../src/modules/ingestion/infrastructure/primary-adapters/http/interceptors/IdempotencyInterceptor';
import { CustomExceptionsFilter } from '../src/shared/infrastructure/primary-adapters/http/filters/CustomExceptionsFilter';

describe('IngestionController (e2e)', () => {
    let app: INestApplication;
    const mockRedisService = { setNx: jest.fn() };
    const mockPublisher = { publishEvent: jest.fn() };

    beforeEach(() => {
        jest.clearAllMocks();
        mockRedisService.setNx.mockResolvedValue(true);
    });

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            controllers: [EventIngestionController],
            providers: [
                EventIngestionService,
                IdempotencyInterceptor,
                {
                    provide: RedisService,
                    useValue: mockRedisService,
                },
                {
                    provide: EVENT_PUBLISHER,
                    useValue: mockPublisher,
                },
            ],
        })
            .compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
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
