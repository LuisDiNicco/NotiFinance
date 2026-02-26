import { Test, TestingModule } from '@nestjs/testing';
import { PortfolioService } from '../../../../../src/modules/portfolio/application/PortfolioService';
import { IPortfolioRepository, PORTFOLIO_REPOSITORY } from '../../../../../src/modules/portfolio/application/IPortfolioRepository';
import { ITradeRepository, TRADE_REPOSITORY } from '../../../../../src/modules/portfolio/application/ITradeRepository';
import { HoldingsCalculator } from '../../../../../src/modules/portfolio/application/HoldingsCalculator';
import { MarketDataService } from '../../../../../src/modules/market-data/application/MarketDataService';
import { Portfolio } from '../../../../../src/modules/portfolio/domain/entities/Portfolio';

describe('PortfolioService', () => {
    let service: PortfolioService;
    let repository: jest.Mocked<IPortfolioRepository>;
    let tradeRepository: jest.Mocked<ITradeRepository>;
    let holdingsCalculator: jest.Mocked<HoldingsCalculator>;
    let marketDataService: jest.Mocked<MarketDataService>;

    beforeEach(async () => {
        repository = {
            findByUserId: jest.fn(),
            findById: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
        };

        tradeRepository = {
            findByPortfolioId: jest.fn(),
            save: jest.fn(),
        };

        holdingsCalculator = {
            calculateHoldings: jest.fn(),
        } as unknown as jest.Mocked<HoldingsCalculator>;

        marketDataService = {
            getAssets: jest.fn(),
            getAssetQuotes: jest.fn(),
        } as unknown as jest.Mocked<MarketDataService>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PortfolioService,
                {
                    provide: PORTFOLIO_REPOSITORY,
                    useValue: repository,
                },
                {
                    provide: TRADE_REPOSITORY,
                    useValue: tradeRepository,
                },
                {
                    provide: HoldingsCalculator,
                    useValue: holdingsCalculator,
                },
                {
                    provide: MarketDataService,
                    useValue: marketDataService,
                },
            ],
        }).compile();

        service = module.get(PortfolioService);
    });

    it('creates a portfolio', async () => {
        const portfolio = new Portfolio({ userId: 'user-1', name: 'Main' });
        repository.save.mockResolvedValue(portfolio);

        const saved = await service.createPortfolio('user-1', 'Main');
        expect(saved.name).toBe('Main');
    });
});
