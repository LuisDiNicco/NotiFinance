import {
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { PortfolioController } from '../src/modules/portfolio/infrastructure/primary-adapters/http/controllers/PortfolioController';
import { PortfolioService } from '../src/modules/portfolio/application/PortfolioService';
import { TradeService } from '../src/modules/portfolio/application/TradeService';
import { JwtAuthGuard } from '../src/modules/auth/infrastructure/primary-adapters/http/guards/JwtAuthGuard';
import { Portfolio } from '../src/modules/portfolio/domain/entities/Portfolio';
import { Trade } from '../src/modules/portfolio/domain/entities/Trade';
import { TradeType } from '../src/modules/portfolio/domain/enums/TradeType';
import { Holding } from '../src/modules/portfolio/domain/entities/Holding';

describe('Portfolio endpoints (e2e)', () => {
  let app: INestApplication;

  const portfolio = new Portfolio({ userId: 'user-1', name: 'Main Portfolio' });
  portfolio.id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

  const trade = new Trade({
    portfolioId: portfolio.id,
    assetId: 'asset-1',
    tradeType: TradeType.BUY,
    quantity: 10,
    pricePerUnit: 1000,
    currency: 'ARS',
  });
  trade.id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

  const portfolioServiceMock = {
    createPortfolio: jest.fn().mockResolvedValue(portfolio),
    getUserPortfolios: jest.fn().mockResolvedValue([portfolio]),
    getPortfolioDetail: jest.fn().mockResolvedValue(portfolio),
    deletePortfolio: jest.fn().mockResolvedValue(undefined),
    getPortfolioHoldings: jest.fn().mockResolvedValue([
      new Holding({
        assetId: 'asset-1',
        ticker: 'GGAL',
        quantity: 10,
        avgCostBasis: 1000,
        currentPrice: 1050,
        marketValue: 10500,
        costBasis: 10000,
        unrealizedPnl: 500,
        unrealizedPnlPct: 5,
        weight: 100,
      }),
    ]),
    getPortfolioDistribution: jest
      .fn()
      .mockResolvedValue([{ ticker: 'GGAL', weight: 100 }]),
  };

  const tradeServiceMock = {
    recordTrade: jest.fn().mockResolvedValue(trade),
    getTradeHistory: jest.fn().mockResolvedValue([trade]),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [PortfolioController],
      providers: [
        {
          provide: PortfolioService,
          useValue: portfolioServiceMock,
        },
        {
          provide: TradeService,
          useValue: tradeServiceMock,
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

  it('/api/v1/portfolios (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/portfolios')
      .send({ name: 'Main Portfolio' })
      .expect(201);

    expect(response.body.id).toBe(portfolio.id);
  });

  it('/api/v1/portfolios (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/portfolios')
      .expect(200);
    expect(response.body).toHaveLength(1);
  });

  it('/api/v1/portfolios/:id/trades (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post(`/api/v1/portfolios/${portfolio.id}/trades`)
      .send({
        ticker: 'GGAL',
        tradeType: 'BUY',
        quantity: 10,
        pricePerUnit: 1000,
        currency: 'ARS',
      })
      .expect(201);

    expect(response.body.id).toBe(trade.id);
  });

  it('/api/v1/portfolios/:id/holdings (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/v1/portfolios/${portfolio.id}/holdings`)
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0].ticker).toBe('GGAL');
  });

  it('/api/v1/portfolios/:id/distribution (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/v1/portfolios/${portfolio.id}/distribution`)
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0].weight).toBe(100);
  });
});
