import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { MarketController } from '../src/modules/market-data/infrastructure/primary-adapters/http/controllers/MarketController';
import { AssetController } from '../src/modules/market-data/infrastructure/primary-adapters/http/controllers/AssetController';
import { SearchController } from '../src/modules/market-data/infrastructure/primary-adapters/http/controllers/SearchController';
import { MarketDataService } from '../src/modules/market-data/application/MarketDataService';
import { Asset } from '../src/modules/market-data/domain/entities/Asset';
import { AssetType } from '../src/modules/market-data/domain/enums/AssetType';
import { DollarQuote } from '../src/modules/market-data/domain/entities/DollarQuote';
import { DollarType } from '../src/modules/market-data/domain/enums/DollarType';
import { CountryRisk } from '../src/modules/market-data/domain/entities/CountryRisk';
import { MarketQuote } from '../src/modules/market-data/domain/entities/MarketQuote';

const assets = [
  new Asset('GGAL', 'Galicia', AssetType.STOCK, 'Financiero', 'GGAL.BA'),
  new Asset('YPFD', 'YPF', AssetType.STOCK, 'Energía', 'YPFD.BA'),
];

describe('Market data endpoints (e2e)', () => {
  let app: INestApplication;

  const marketDataServiceMock = {
    getDollarQuotes: jest
      .fn()
      .mockResolvedValue([
        new DollarQuote(
          DollarType.MEP,
          1300,
          1320,
          new Date(),
          'test-provider',
        ),
      ]),
    getCountryRisk: jest
      .fn()
      .mockResolvedValue(new CountryRisk(680, -0.8, new Date())),
    getCountryRiskHistory: jest.fn().mockResolvedValue([
      new CountryRisk(680, -0.8, new Date('2024-01-02T00:00:00.000Z')),
      new CountryRisk(690, 0.4, new Date('2024-01-01T00:00:00.000Z')),
    ]),
    getAssetStats: jest.fn().mockResolvedValue({
      latestClose: 1500000,
      latestVolume: 120000000,
      changePctFromPeriodStart: 1.2,
      maxClose: 1510000,
      minClose: 1495000,
      averageClose: 1502500,
      totalVolume: 120000000,
      points: 2,
    }),
    getMarketSummary: jest.fn().mockResolvedValue({
      dollar: [
        new DollarQuote(
          DollarType.MEP,
          1300,
          1320,
          new Date(),
          'test-provider',
        ),
      ],
      risk: new CountryRisk(680, -0.8, new Date()),
      marketStatus: {
        now: new Date().toISOString(),
        marketOpen: true,
        schedules: {
          stocks: '*/5 10-17 * * 1-5',
          cedears: '*/5 10-17 * * 1-5',
          bonds: '*/15 10-17 * * 1-5',
          dollar: '*/5 * * * *',
          risk: '*/10 * * * *',
        },
        lastUpdate: {
          dollar: new Date().toISOString(),
          risk: new Date().toISOString(),
          quotes: new Date().toISOString(),
        },
      },
      topMovers: {
        stocks: { gainers: [], losers: [] },
        cedears: { gainers: [], losers: [] },
      },
    }),
    getMarketStatus: jest.fn().mockResolvedValue({
      now: new Date().toISOString(),
      marketOpen: true,
      schedules: {
        stocks: '*/5 10-17 * * 1-5',
        cedears: '*/5 10-17 * * 1-5',
        bonds: '*/15 10-17 * * 1-5',
        dollar: '*/5 * * * *',
        risk: '*/10 * * * *',
      },
      lastUpdate: {
        dollar: new Date().toISOString(),
        risk: new Date().toISOString(),
        quotes: new Date().toISOString(),
      },
    }),
    getTopMovers: jest.fn().mockResolvedValue({
      gainers: [
        {
          asset: assets[0],
          quote: new MarketQuote(new Date('2024-01-02T00:00:00.000Z'), {
            assetId: 'asset-1',
            changePct: 4.2,
            closePrice: 1050,
          }),
        },
      ],
      losers: [
        {
          asset: assets[1],
          quote: new MarketQuote(new Date('2024-01-02T00:00:00.000Z'), {
            assetId: 'asset-2',
            changePct: -3.1,
            closePrice: 900,
          }),
        },
      ],
    }),
    getAssets: jest.fn().mockResolvedValue(assets),
    getAssetByTicker: jest.fn().mockResolvedValue(assets[0]),
    searchAssets: jest.fn().mockResolvedValue([assets[0]]),
    getAssetQuotes: jest.fn().mockResolvedValue([
      new MarketQuote(new Date('2024-01-01T00:00:00.000Z'), {
        assetId: 'asset-1',
        closePrice: 1000,
        openPrice: 980,
      }),
    ]),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [MarketController, AssetController, SearchController],
      providers: [
        {
          provide: MarketDataService,
          useValue: marketDataServiceMock,
        },
      ],
    }).compile();

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

  it('/api/v1/market/dollar (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/market/dollar')
      .expect(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body).toHaveProperty('updatedAt');
  });

  it('/api/v1/market/risk (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/market/risk')
      .expect(200);
    expect(response.body.value).toBe(680);
  });

  it('/api/v1/market/summary (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/market/summary')
      .expect(200);
    expect(response.body).toHaveProperty('merval');
    expect(response.body).toHaveProperty('dollar');
    expect(response.body).toHaveProperty('risk');
  });

  it('/api/v1/market/status (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/market/status')
      .expect(200);
    expect(response.body).toHaveProperty('marketOpen');
    expect(response.body).toHaveProperty('lastUpdate');
  });

  it('/api/v1/market/top-movers (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/market/top-movers?type=STOCK&limit=5')
      .expect(200);
    expect(response.body).toHaveProperty('gainers');
    expect(response.body).toHaveProperty('losers');
    expect(response.body.gainers[0].asset.ticker).toBe('GGAL');
  });

  it('/api/v1/assets (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/assets?type=STOCK&limit=1')
      .expect(200);
    expect(response.body).toHaveLength(1);
  });

  it('/api/v1/assets/:ticker (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/assets/GGAL')
      .expect(200);
    expect(response.body.ticker).toBe('GGAL');
  });

  it('/api/v1/search (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/search?q=ggal&limit=5')
      .expect(200);
    expect(response.body[0].ticker).toBe('GGAL');
  });

  it('/api/v1/assets/:ticker/quotes (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/assets/GGAL/quotes?days=30')
      .expect(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0].closePrice).toBe(1000);
  });
});
