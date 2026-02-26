import {
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { WatchlistController } from '../src/modules/watchlist/infrastructure/primary-adapters/http/controllers/WatchlistController';
import { WatchlistService } from '../src/modules/watchlist/application/WatchlistService';
import { WatchlistItem } from '../src/modules/watchlist/domain/entities/WatchlistItem';
import { JwtAuthGuard } from '../src/modules/auth/infrastructure/primary-adapters/http/guards/JwtAuthGuard';

describe('Watchlist endpoints (e2e)', () => {
  let app: INestApplication;

  const item = new WatchlistItem({
    userId: 'user-1',
    assetId: 'asset-1',
  });
  item.id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

  const watchlistServiceMock = {
    getUserWatchlist: jest.fn().mockResolvedValue([item]),
    addToWatchlist: jest.fn().mockResolvedValue(item),
    removeFromWatchlist: jest.fn().mockResolvedValue(undefined),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [WatchlistController],
      providers: [
        {
          provide: WatchlistService,
          useValue: watchlistServiceMock,
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
    app.setGlobalPrefix('api/v1');
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

  it('/api/v1/watchlist (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/watchlist')
      .expect(200);
    expect(response.body).toHaveLength(1);
  });

  it('/api/v1/watchlist (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/watchlist')
      .send({ ticker: 'GGAL' })
      .expect(201);

    expect(response.body.id).toBe(item.id);
  });

  it('/api/v1/watchlist/:ticker (DELETE)', async () => {
    await request(app.getHttpServer())
      .delete('/api/v1/watchlist/GGAL')
      .expect(200);
  });
});
