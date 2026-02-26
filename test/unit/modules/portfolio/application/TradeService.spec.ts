import { Test, TestingModule } from '@nestjs/testing';
import { TradeService } from '../../../../../src/modules/portfolio/application/TradeService';
import {
  ITradeRepository,
  TRADE_REPOSITORY,
} from '../../../../../src/modules/portfolio/application/ITradeRepository';
import { MarketDataService } from '../../../../../src/modules/market-data/application/MarketDataService';
import { PortfolioService } from '../../../../../src/modules/portfolio/application/PortfolioService';
import { TradeType } from '../../../../../src/modules/portfolio/domain/enums/TradeType';
import { Trade } from '../../../../../src/modules/portfolio/domain/entities/Trade';
import { InsufficientHoldingsError } from '../../../../../src/modules/portfolio/domain/errors/InsufficientHoldingsError';
import { PortfolioNotFoundError } from '../../../../../src/modules/portfolio/domain/errors/PortfolioNotFoundError';
import { InvalidTradeExecutionDateError } from '../../../../../src/modules/portfolio/domain/errors/InvalidTradeExecutionDateError';

describe('TradeService', () => {
  let service: TradeService;
  let repository: jest.Mocked<ITradeRepository>;
  let marketDataService: jest.Mocked<MarketDataService>;
  let portfolioService: jest.Mocked<PortfolioService>;

  beforeEach(async () => {
    repository = {
      findByPortfolioId: jest.fn(),
      findByPortfolioIdPaginated: jest.fn(),
      save: jest.fn(),
    };

    marketDataService = {
      getAssetByTicker: jest.fn(),
    } as unknown as jest.Mocked<MarketDataService>;

    portfolioService = {
      getPortfolioDetail: jest.fn(),
    } as unknown as jest.Mocked<PortfolioService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TradeService,
        {
          provide: TRADE_REPOSITORY,
          useValue: repository,
        },
        {
          provide: MarketDataService,
          useValue: marketDataService,
        },
        {
          provide: PortfolioService,
          useValue: portfolioService,
        },
      ],
    }).compile();

    service = module.get(TradeService);
  });

  it('records BUY trade successfully', async () => {
    portfolioService.getPortfolioDetail.mockResolvedValue({
      id: 'portfolio-1',
      userId: 'user-1',
      name: 'Main',
      description: null,
    });
    marketDataService.getAssetByTicker.mockResolvedValue({
      id: 'asset-ggal',
      ticker: 'GGAL',
    } as never);
    repository.save.mockImplementation(async (trade: Trade) => {
      trade.id = 'trade-1';
      return trade;
    });

    const result = await service.recordTrade({
      userId: 'user-1',
      portfolioId: 'portfolio-1',
      ticker: 'GGAL',
      tradeType: TradeType.BUY,
      quantity: 10,
      pricePerUnit: 1000,
      currency: 'ARS',
    });

    expect(result.id).toBe('trade-1');
    expect(result.tradeType).toBe(TradeType.BUY);
    expect(repository.save).toHaveBeenCalledTimes(1);
  });

  it('throws InsufficientHoldingsError for SELL when holdings are not enough', async () => {
    portfolioService.getPortfolioDetail.mockResolvedValue({
      id: 'portfolio-1',
      userId: 'user-1',
      name: 'Main',
      description: null,
    });
    marketDataService.getAssetByTicker.mockResolvedValue({
      id: 'asset-ggal',
      ticker: 'GGAL',
    } as never);
    repository.findByPortfolioId.mockResolvedValue([
      new Trade({
        portfolioId: 'portfolio-1',
        assetId: 'asset-ggal',
        tradeType: TradeType.BUY,
        quantity: 3,
        pricePerUnit: 1000,
        currency: 'ARS',
      }),
    ]);

    await expect(
      service.recordTrade({
        userId: 'user-1',
        portfolioId: 'portfolio-1',
        ticker: 'GGAL',
        tradeType: TradeType.SELL,
        quantity: 5,
        pricePerUnit: 1100,
        currency: 'ARS',
      }),
    ).rejects.toThrow(InsufficientHoldingsError);
  });

  it('throws PortfolioNotFoundError when recording trade on missing portfolio', async () => {
    portfolioService.getPortfolioDetail.mockResolvedValue(null);

    await expect(
      service.recordTrade({
        userId: 'user-1',
        portfolioId: 'missing',
        ticker: 'GGAL',
        tradeType: TradeType.BUY,
        quantity: 1,
        pricePerUnit: 100,
        currency: 'ARS',
      }),
    ).rejects.toThrow(PortfolioNotFoundError);
  });

  it('throws InvalidTradeExecutionDateError when executedAt is in the future', async () => {
    portfolioService.getPortfolioDetail.mockResolvedValue({
      id: 'portfolio-1',
      userId: 'user-1',
      name: 'Main',
      description: null,
    });
    marketDataService.getAssetByTicker.mockResolvedValue({
      id: 'asset-ggal',
      ticker: 'GGAL',
    } as never);

    const future = new Date(Date.now() + 60_000);

    await expect(
      service.recordTrade({
        userId: 'user-1',
        portfolioId: 'portfolio-1',
        ticker: 'GGAL',
        tradeType: TradeType.BUY,
        quantity: 1,
        pricePerUnit: 100,
        currency: 'ARS',
        executedAt: future,
      }),
    ).rejects.toThrow(InvalidTradeExecutionDateError);
  });

  it('returns trade history only when user owns portfolio', async () => {
    portfolioService.getPortfolioDetail.mockResolvedValue({
      id: 'portfolio-1',
      userId: 'user-1',
      name: 'Main',
      description: null,
    });
    repository.findByPortfolioIdPaginated.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      totalPages: 0,
    });

    await service.getTradeHistory('user-1', 'portfolio-1');

    expect(repository.findByPortfolioIdPaginated).toHaveBeenCalledWith(
      'portfolio-1',
      1,
      20,
      undefined,
    );
  });

  it('throws PortfolioNotFoundError when user does not own portfolio history', async () => {
    portfolioService.getPortfolioDetail.mockResolvedValue(null);

    await expect(
      service.getTradeHistory('user-1', 'portfolio-1'),
    ).rejects.toThrow(PortfolioNotFoundError);
  });
});
