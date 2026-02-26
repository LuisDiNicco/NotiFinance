import { Test, TestingModule } from '@nestjs/testing';
import { PortfolioService } from '../../../../../src/modules/portfolio/application/PortfolioService';
import { IPortfolioRepository, PORTFOLIO_REPOSITORY } from '../../../../../src/modules/portfolio/application/IPortfolioRepository';
import { Portfolio } from '../../../../../src/modules/portfolio/domain/entities/Portfolio';

describe('PortfolioService', () => {
    let service: PortfolioService;
    let repository: jest.Mocked<IPortfolioRepository>;

    beforeEach(async () => {
        repository = {
            findByUserId: jest.fn(),
            findById: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PortfolioService,
                {
                    provide: PORTFOLIO_REPOSITORY,
                    useValue: repository,
                },
            ],
        }).compile();

        service = module.get(PortfolioService);
    });

    it('creates a portfolio', async () => {
        const portfolio = new Portfolio({ userId: 'user-1', name: 'Main' });
        repository.save.mockResolvedValue(portfolio);

        const saved = await service.createPortfolio('user-1', 'Main');
        expect(saved.name).toBe('Main');
    });
});
