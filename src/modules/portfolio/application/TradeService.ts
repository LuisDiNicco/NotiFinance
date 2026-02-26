import { Inject, Injectable } from '@nestjs/common';
import { TRADE_REPOSITORY, type ITradeRepository } from './ITradeRepository';
import { Trade } from '../domain/entities/Trade';
import { TradeType } from '../domain/enums/TradeType';
import { MarketDataService } from '../../market-data/application/MarketDataService';

@Injectable()
export class TradeService {
    constructor(
        @Inject(TRADE_REPOSITORY)
        private readonly tradeRepository: ITradeRepository,
        private readonly marketDataService: MarketDataService,
    ) { }

    public async recordTrade(params: {
        portfolioId: string;
        ticker: string;
        tradeType: TradeType;
        quantity: number;
        pricePerUnit: number;
        currency: string;
        commission?: number;
    }): Promise<Trade> {
        const asset = await this.marketDataService.getAssetByTicker(params.ticker);
        if (!asset.id) {
            throw new Error(`Asset ${params.ticker} has no persistent id`);
        }

        const trade = new Trade({
            portfolioId: params.portfolioId,
            assetId: asset.id,
            tradeType: params.tradeType,
            quantity: params.quantity,
            pricePerUnit: params.pricePerUnit,
            currency: params.currency,
            commission: params.commission ?? 0,
        });

        return this.tradeRepository.save(trade);
    }

    public async getTradeHistory(portfolioId: string): Promise<Trade[]> {
        return this.tradeRepository.findByPortfolioId(portfolioId);
    }
}
