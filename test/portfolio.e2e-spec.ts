import { ExecutionContext, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { PortfolioController } from '../src/modules/portfolio/infrastructure/primary-adapters/http/controllers/PortfolioController';
import { PortfolioService } from '../src/modules/portfolio/application/PortfolioService';
import { TradeService } from '../src/modules/portfolio/application/TradeService';
import { JwtAuthGuard } from '../src/modules/auth/infrastructure/primary-adapters/http/guards/JwtAuthGuard';
import { Portfolio } from '../src/modules/portfolio/domain/entities/Portfolio';
import { Trade } from '../src/modules/portfolio/domain/entities/Trade';
import { TradeType } from '../src/modules/portfolio/domain/enums/TradeType';

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

    it('/portfolios (POST)', async () => {
        const response = await request(app.getHttpServer())
            .post('/portfolios')
            .send({ name: 'Main Portfolio' })
            .expect(201);

        expect(response.body.id).toBe(portfolio.id);
    });

    it('/portfolios (GET)', async () => {
        const response = await request(app.getHttpServer()).get('/portfolios').expect(200);
        expect(response.body).toHaveLength(1);
    });

    it('/portfolios/:id/trades (POST)', async () => {
        const response = await request(app.getHttpServer())
            .post(`/portfolios/${portfolio.id}/trades`)
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
});
