import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { EventIngestionController } from '../src/modules/ingestion/infrastructure/primary-adapters/http/controllers/EventIngestionController';
import { EventIngestionService } from '../src/modules/ingestion/application/EventIngestionService';
import { EVENT_PUBLISHER } from '../src/modules/ingestion/application/IEventPublisher';
import { CustomExceptionsFilter } from '../src/shared/infrastructure/primary-adapters/http/filters/CustomExceptionsFilter';

describe('IngestionController (e2e)', () => {
  let app: INestApplication;
  const mockPublisher = { publishEvent: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [EventIngestionController],
      providers: [
        EventIngestionService,
        {
          provide: EVENT_PUBLISHER,
          useValue: mockPublisher,
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
  });

  it('/events (POST) - should accept valid payload', () => {
    mockPublisher.publishEvent.mockResolvedValueOnce(undefined);

    return request(app.getHttpServer())
      .post('/api/v1/events')
      .set('x-correlation-id', 'test-corr-id')
      .send({
        eventId: '550e8400-e29b-41d4-a716-446655440000',
        eventType: 'market.quote.updated',
        recipientId: 'user-123',
        metadata: { assetId: 'asset-1', closePrice: 8025.5 },
      })
      .expect(202);
  });

  it('/events (POST) - should process same payload again if received twice', async () => {
    mockPublisher.publishEvent.mockResolvedValue(undefined);

    const payload = {
      eventId: '550e8400-e29b-41d4-a716-446655440000',
      eventType: 'market.quote.updated',
      recipientId: 'user-123',
      metadata: { assetId: 'asset-1', closePrice: 8025.5 },
    };

    await request(app.getHttpServer())
      .post('/api/v1/events')
      .send(payload)
      .expect(202);

    await request(app.getHttpServer())
      .post('/api/v1/events')
      .send(payload)
      .expect(202);

    expect(mockPublisher.publishEvent).toHaveBeenCalledTimes(2);
  });

  it('/events (POST) - should fail on schema validation error', () => {
    return request(app.getHttpServer())
      .post('/api/v1/events')
      .send({
        eventId: '550e8400-e29b-41d4-a716-446655440000',
        eventType: 'invalid.type',
      })
      .expect(400);
  });
});
