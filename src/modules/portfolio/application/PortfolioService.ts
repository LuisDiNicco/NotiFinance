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
import { AssetType } from '../../market-data/domain/enums/AssetType';

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
  ): Promise<{
    byAsset: Array<{ ticker: string; value: number; weight: number }>;
    byType: Array<{ type: string; value: number; weight: number }>;
    bySector: Array<{ sector: string; value: number; weight: number }>;
    byCurrency: Array<{ currency: string; value: number; weight: number }>;
  }> {
    const holdings = await this.getPortfolioHoldings(userId, portfolioId);
    const byAsset = holdings.map((holding) => ({
      ticker: holding.ticker,
      value: holding.marketValue,
      weight: holding.weight,
    }));

    const assets = await this.marketDataService.getAssets();
    const assetByTicker = new Map(assets.map((asset) => [asset.ticker, asset]));

    const totalValue = byAsset.reduce((acc, item) => acc + item.value, 0);

    const typeMap = new Map<string, number>();
    const sectorMap = new Map<string, number>();
    const currencyMap = new Map<string, number>();

    for (const item of byAsset) {
      const asset = assetByTicker.get(item.ticker);
      const assetType: AssetType | 'UNKNOWN' = asset?.assetType ?? 'UNKNOWN';
      const sector = asset?.sector ?? 'Unknown';
      const currency =
        assetType === AssetType.CEDEAR ||
        assetType === AssetType.BOND ||
        assetType === AssetType.ON
          ? 'USD'
          : 'ARS';

      typeMap.set(assetType, (typeMap.get(assetType) ?? 0) + item.value);
      sectorMap.set(sector, (sectorMap.get(sector) ?? 0) + item.value);
      currencyMap.set(currency, (currencyMap.get(currency) ?? 0) + item.value);
    }

    const toWeightedList = <T extends string>(
      map: Map<T, number>,
      field: 'type' | 'sector' | 'currency',
    ): Array<{ [K in typeof field]: T } & { value: number; weight: number }> =>
      Array.from(map.entries()).map(([key, value]) => ({
        [field]: key,
        value,
        weight: totalValue > 0 ? (value / totalValue) * 100 : 0,
      })) as Array<
        { [K in typeof field]: T } & { value: number; weight: number }
      >;

    return {
      byAsset,
      byType: toWeightedList(typeMap, 'type'),
      bySector: toWeightedList(sectorMap, 'sector'),
      byCurrency: toWeightedList(currencyMap, 'currency'),
    };
  }

  public async getPortfolioPerformance(
    userId: string,
    portfolioId: string,
    period = '3M',
  ): Promise<{
    period: string;
    points: Array<{ date: string; value: number }>;
  }> {
    const holdings = await this.getPortfolioHoldings(userId, portfolioId);
    const totalValue = holdings.reduce(
      (acc, holding) => acc + holding.marketValue,
      0,
    );

    return {
      period,
      points: [
        {
          date: new Date().toISOString().slice(0, 10),
          value: totalValue,
        },
      ],
    };
  }
}
