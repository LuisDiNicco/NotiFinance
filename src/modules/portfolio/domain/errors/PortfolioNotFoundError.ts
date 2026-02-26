export class PortfolioNotFoundError extends Error {
    constructor(portfolioId: string) {
        super(`Portfolio ${portfolioId} not found`);
        this.name = 'PortfolioNotFoundError';
    }
}
