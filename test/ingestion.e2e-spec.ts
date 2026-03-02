import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import request from 'supertest';
import { EventIngestionController } from '../src/modules/ingestion/infrastructure/primary-adapters/http/controllers/EventIngestionController';
import { EventIngestionService } from '../src/modules/ingestion/application/EventIngestionService';
import { EVENT_PUBLISHER } from '../src/modules/ingestion/application/IEventPublisher';
import { CustomExceptionsFilter } from '../src/shared/infrastructure/primary-adapters/http/filters/CustomExceptionsFilter';
import { RedisService } from '../src/shared/infrastructure/base/redis/redis.service';

describe('IngestionController (e2e)', () => {
  let app: INestApplication;
  const mockPublisher = { publishEvent: jest.fn() };
  const idempotencyCache = new Set<string>();
  const redisServiceMock = {
    setNx: jest.fn().mockImplementation(async (key: string) => {
      if (idempotencyCache.has(key)) {
        return false;
      }

      idempotencyCache.add(key);
      return true;
    }),
  } as unknown as RedisService;
  const ingestionApiKey = 'test-ingestion-key';
  const previousIngestionApiKey = process.env['EVENTS_INGESTION_API_KEY'];

  beforeEach(() => {
    jest.clearAllMocks();
    idempotencyCache.clear();
  });

  beforeAll(async () => {
    process.env['EVENTS_INGESTION_API_KEY'] = ingestionApiKey;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [EventIngestionController],
      providers: [
        EventIngestionService,
        {
          provide: EVENT_PUBLISHER,
          useValue: mockPublisher,
        },
        {
          provide: ConfigService,
          useValue: {
            get: (key: string, defaultValue?: string) =>
              process.env[key] ?? defaultValue,
          },
        },
        {
          provide: RedisService,
          useValue: redisServiceMock,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.useGlobalFilters(new CustomExceptionsFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();

    if (previousIngestionApiKey == null) {
      delete process.env['EVENTS_INGESTION_API_KEY'];
      return;
    }

    process.env['EVENTS_INGESTION_API_KEY'] = previousIngestionApiKey;
  });

  it('/events (POST) - should reject when ingestion api key is missing', () => {
    return request(app.getHttpServer())
      .post('/api/v1/events')
      .send({
        eventId: '550e8400-e29b-41d4-a716-446655440000',
        eventType: 'market.quote.updated',
        recipientId: 'user-123',
        metadata: { assetId: 'asset-1', closePrice: 8025.5 },
      })
      .expect(401);
  });

  it('/events (POST) - should reject when ingestion api key is invalid', () => {
    return request(app.getHttpServer())
      .post('/api/v1/events')
      .set('x-ingestion-api-key', 'wrong-key')
      .send({
        eventId: '650e8400-e29b-41d4-a716-446655440000',
        eventType: 'market.quote.updated',
        recipientId: 'user-123',
        metadata: { assetId: 'asset-1', closePrice: 8025.5 },
      })
      .expect(401);
  });

  it('/events (POST) - should accept valid payload', () => {
    mockPublisher.publishEvent.mockResolvedValueOnce(undefined);

    return request(app.getHttpServer())
      .post('/api/v1/events')
      .set('x-ingestion-api-key', ingestionApiKey)
      .set('x-correlation-id', 'test-corr-id')
      .send({
        eventId: '550e8400-e29b-41d4-a716-446655440000',
        eventType: 'market.quote.updated',
        recipientId: 'user-123',
        metadata: { assetId: 'asset-1', closePrice: 8025.5 },
      })
      .expect(202);
  });

  it('/events (POST) - should return duplicate response on repeated payload', async () => {
    mockPublisher.publishEvent.mockResolvedValue(undefined);

    const payload = {
      eventId: '550e8400-e29b-41d4-a716-446655440000',
      eventType: 'market.quote.updated',
      recipientId: 'user-123',
      metadata: { assetId: 'asset-1', closePrice: 8025.5 },
    };

    await request(app.getHttpServer())
      .post('/api/v1/events')
      .set('x-ingestion-api-key', ingestionApiKey)
      .send(payload)
      .expect(202);

    await request(app.getHttpServer())
      .post('/api/v1/events')
      .set('x-ingestion-api-key', ingestionApiKey)
      .send(payload)
      .expect(200);

    expect(mockPublisher.publishEvent).toHaveBeenCalledTimes(1);
  });

  it('/events (POST) - should fail on schema validation error', () => {
    return request(app.getHttpServer())
      .post('/api/v1/events')
      .set('x-ingestion-api-key', ingestionApiKey)
      .send({
        eventId: '550e8400-e29b-41d4-a716-446655440000',
        eventType: 'invalid.type',
      })
      .expect(400);
  });
});
