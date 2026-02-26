import { Inject, Injectable } from '@nestjs/common';
import { TRADE_REPOSITORY, type ITradeRepository } from './ITradeRepository';
import { Trade } from '../domain/entities/Trade';
import { TradeType } from '../domain/enums/TradeType';
import { MarketDataService } from '../../market-data/application/MarketDataService';
import { PortfolioService } from './PortfolioService';
import { PortfolioNotFoundError } from '../domain/errors/PortfolioNotFoundError';
import { InsufficientHoldingsError } from '../domain/errors/InsufficientHoldingsError';
import { PaginatedResponse } from './Pagination';
import { InvalidTradeExecutionDateError } from '../domain/errors/InvalidTradeExecutionDateError';

@Injectable()
export class TradeService {
  constructor(
    @Inject(TRADE_REPOSITORY)
    private readonly tradeRepository: ITradeRepository,
    private readonly marketDataService: MarketDataService,
    private readonly portfolioService: PortfolioService,
  ) {}

  public async recordTrade(params: {
    userId: string;
    portfolioId: string;
    ticker: string;
    tradeType: TradeType;
    quantity: number;
    pricePerUnit: number;
    currency: string;
    commission?: number;
    executedAt?: Date;
  }): Promise<Trade> {
    const portfolio = await this.portfolioService.getPortfolioDetail(
      params.userId,
      params.portfolioId,
    );
    if (!portfolio) {
      throw new PortfolioNotFoundError(params.portfolioId);
    }

    const asset = await this.marketDataService.getAssetByTicker(params.ticker);
    if (!asset.id) {
      throw new Error(`Asset ${params.ticker} has no persistent id`);
    }

    if (params.tradeType === TradeType.SELL) {
      const existingTrades = await this.tradeRepository.findByPortfolioId(
        params.portfolioId,
      );
      const availableQty = existingTrades
        .filter((trade) => trade.assetId === asset.id)
        .reduce((acc, trade) => {
          if (trade.tradeType === TradeType.BUY) {
            return acc + trade.quantity;
          }

          return acc - trade.quantity;
        }, 0);

      if (availableQty < params.quantity) {
        throw new InsufficientHoldingsError(
          asset.id,
          availableQty,
          params.quantity,
        );
      }
    }

    if (params.executedAt && params.executedAt.getTime() > Date.now()) {
      throw new InvalidTradeExecutionDateError(params.executedAt);
    }

    const trade = new Trade({
      portfolioId: params.portfolioId,
      assetId: asset.id,
      tradeType: params.tradeType,
      quantity: params.quantity,
      pricePerUnit: params.pricePerUnit,
      currency: params.currency,
      commission: params.commission ?? 0,
      ...(params.executedAt ? { executedAt: params.executedAt } : {}),
    });

    return this.tradeRepository.save(trade);
  }

  public async getTradeHistory(
    userId: string,
    portfolioId: string,
    page = 1,
    limit = 20,
    sortBy?: string,
  ): Promise<PaginatedResponse<Trade>> {
    const portfolio = await this.portfolioService.getPortfolioDetail(
      userId,
      portfolioId,
    );
    if (!portfolio) {
      throw new PortfolioNotFoundError(portfolioId);
    }

    return this.tradeRepository.findByPortfolioIdPaginated(
      portfolioId,
      page,
      limit,
      sortBy,
    );
  }
}
