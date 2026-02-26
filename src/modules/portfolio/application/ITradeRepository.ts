import { Trade } from '../domain/entities/Trade';

export const TRADE_REPOSITORY = 'ITradeRepository';

export interface ITradeRepository {
    findByPortfolioId(portfolioId: string): Promise<Trade[]>;
    save(trade: Trade): Promise<Trade>;
}
