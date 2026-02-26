import { Portfolio } from '../domain/entities/Portfolio';

export const PORTFOLIO_REPOSITORY = 'IPortfolioRepository';

export interface IPortfolioRepository {
    findByUserId(userId: string): Promise<Portfolio[]>;
    findById(id: string): Promise<Portfolio | null>;
    save(portfolio: Portfolio): Promise<Portfolio>;
    delete(id: string): Promise<void>;
}
