import { Inject, Injectable } from '@nestjs/common';
import { PORTFOLIO_REPOSITORY, type IPortfolioRepository } from './IPortfolioRepository';
import { Portfolio } from '../domain/entities/Portfolio';

@Injectable()
export class PortfolioService {
    constructor(
        @Inject(PORTFOLIO_REPOSITORY)
        private readonly portfolioRepository: IPortfolioRepository,
    ) { }

    public async createPortfolio(userId: string, name: string, description?: string): Promise<Portfolio> {
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

    public async getPortfolioDetail(userId: string, portfolioId: string): Promise<Portfolio | null> {
        const portfolio = await this.portfolioRepository.findById(portfolioId);
        if (!portfolio || portfolio.userId !== userId) {
            return null;
        }

        return portfolio;
    }

    public async deletePortfolio(userId: string, portfolioId: string): Promise<void> {
        const portfolio = await this.getPortfolioDetail(userId, portfolioId);
        if (!portfolio?.id) {
            return;
        }

        await this.portfolioRepository.delete(portfolio.id);
    }
}
