import { Inject, Injectable } from '@nestjs/common';
import {
  PORTFOLIO_REPOSITORY,
  type IPortfolioRepository,
} from './IPortfolioRepository';
import { Portfolio } from '../domain/entities/Portfolio';
import { TRADE_REPOSITORY, type ITradeRepository } from './ITradeRepository';
import { HoldingsCalculator } from './HoldingsCalculator';
import { Holding } from '../domain/entities/Holding';
import { MarketDataService } from '../../market-data/application/MarketDataService';

@Injectable()
export class PortfolioService {
  constructor(
    @Inject(PORTFOLIO_REPOSITORY)
    private readonly portfolioRepository: IPortfolioRepository,
    @Inject(TRADE_REPOSITORY)
    private readonly tradeRepository: ITradeRepository,
    private readonly holdingsCalculator: HoldingsCalculator,
    private readonly marketDataService: MarketDataService,
  ) {}

  public async createPortfolio(
    userId: string,
    name: string,
    description?: string,
  ): Promise<Portfolio> {
    return this.portfolioRepository.save(
      new Portfolio({
        userId,
        name,
        description: description ?? null,
      }),
    );
  }

  public async getUserPortfolios(userId: string): Promise<Portfolio[]> {
    return this.portfolioRepository.findByUserId(userId);
  }

  public async getPortfolioDetail(
    userId: string,
    portfolioId: string,
  ): Promise<Portfolio | null> {
    const portfolio = await this.portfolioRepository.findById(portfolioId);
    if (!portfolio || portfolio.userId !== userId) {
      return null;
    }

    return portfolio;
  }

  public async deletePortfolio(
    userId: string,
    portfolioId: string,
  ): Promise<void> {
    const portfolio = await this.getPortfolioDetail(userId, portfolioId);
    if (!portfolio?.id) {
      return;
    }

    await this.portfolioRepository.delete(portfolio.id);
  }

  public async getPortfolioHoldings(
    userId: string,
    portfolioId: string,
  ): Promise<Holding[]> {
    const portfolio = await this.getPortfolioDetail(userId, portfolioId);
    if (!portfolio?.id) {
      return [];
    }

    const [trades, assets] = await Promise.all([
      this.tradeRepository.findByPortfolioId(portfolio.id),
      this.marketDataService.getAssets(),
    ]);

    const assetsById = new Map<
      string,
      { ticker: string; currentPrice: number }
    >();
    for (const asset of assets) {
      if (!asset.id) {
        continue;
      }

      let currentPrice = 0;
      try {
        const quotes = await this.marketDataService.getAssetQuotes(
          asset.ticker,
          2,
        );
        const latestQuote = quotes.at(-1);
        currentPrice = latestQuote?.closePrice ?? 0;
      } catch {
        currentPrice = 0;
      }

      assetsById.set(asset.id, { ticker: asset.ticker, currentPrice });
    }

    const priceMap = new Map<string, number>();
    const tickerMap = new Map<string, string>();
    for (const [assetId, value] of assetsById.entries()) {
      priceMap.set(assetId, value.currentPrice);
      tickerMap.set(assetId, value.ticker);
    }

    return this.holdingsCalculator.calculateHoldings(
      trades,
      priceMap,
      tickerMap,
    );
  }

  public async getPortfolioDistribution(
    userId: string,
    portfolioId: string,
  ): Promise<Array<{ ticker: string; weight: number }>> {
    const holdings = await this.getPortfolioHoldings(userId, portfolioId);
    return holdings.map((holding) => ({
      ticker: holding.ticker,
      weight: holding.weight,
    }));
  }
}
