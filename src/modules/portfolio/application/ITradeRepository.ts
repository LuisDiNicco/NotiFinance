import { Trade } from '../domain/entities/Trade';
import { PaginatedResponse } from './Pagination';

export const TRADE_REPOSITORY = 'ITradeRepository';

export interface ITradeRepository {
  findByPortfolioId(portfolioId: string): Promise<Trade[]>;
  findByPortfolioIdPaginated(
    portfolioId: string,
    page: number,
    limit: number,
    sortBy?: string,
  ): Promise<PaginatedResponse<Trade>>;
  save(trade: Trade): Promise<Trade>;
}
