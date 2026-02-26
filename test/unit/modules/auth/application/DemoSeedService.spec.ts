import { Test, TestingModule } from '@nestjs/testing';
import { DemoSeedService } from '../../../../../src/modules/auth/application/DemoSeedService';
import { USER_REPOSITORY, type IUserRepository } from '../../../../../src/modules/auth/application/IUserRepository';
import { PortfolioService } from '../../../../../src/modules/portfolio/application/PortfolioService';
import { TradeService } from '../../../../../src/modules/portfolio/application/TradeService';
import { WatchlistService } from '../../../../../src/modules/watchlist/application/WatchlistService';
import { AlertService } from '../../../../../src/modules/alert/application/AlertService';
import { NotificationService } from '../../../../../src/modules/notification/application/services/NotificationService';
import { MarketDataService } from '../../../../../src/modules/market-data/application/MarketDataService';
import { User } from '../../../../../src/modules/auth/domain/entities/User';

describe('DemoSeedService', () => {
    let service: DemoSeedService;
    let repository: jest.Mocked<IUserRepository>;
    let portfolioService: jest.Mocked<PortfolioService>;
    let tradeService: jest.Mocked<TradeService>;
    let watchlistService: jest.Mocked<WatchlistService>;
    let alertService: jest.Mocked<AlertService>;
    let notificationService: jest.Mocked<NotificationService>;
    let marketDataService: jest.Mocked<MarketDataService>;

    beforeEach(async () => {
        repository = {
            findByEmail: jest.fn(),
            findById: jest.fn(),
            save: jest.fn(),
            deleteExpiredDemoUsers: jest.fn(),
        };

        portfolioService = {
            createPortfolio: jest.fn(),
            getUserPortfolios: jest.fn(),
            getPortfolioDetail: jest.fn(),
            deletePortfolio: jest.fn(),
            getPortfolioHoldings: jest.fn(),
            getPortfolioDistribution: jest.fn(),
        } as unknown as jest.Mocked<PortfolioService>;

        tradeService = {
            recordTrade: jest.fn(),
            getTradeHistory: jest.fn(),
        } as unknown as jest.Mocked<TradeService>;

        watchlistService = {
            getUserWatchlist: jest.fn(),
            addToWatchlist: jest.fn(),
            removeFromWatchlist: jest.fn(),
        } as unknown as jest.Mocked<WatchlistService>;

        alertService = {
            createAlert: jest.fn(),
            getUserAlerts: jest.fn(),
            updateAlert: jest.fn(),
            changeStatus: jest.fn(),
            deleteAlert: jest.fn(),
        } as unknown as jest.Mocked<AlertService>;

        notificationService = {
            getUserNotifications: jest.fn(),
            getUnreadCount: jest.fn(),
            createNotification: jest.fn(),
            markAsRead: jest.fn(),
            markAllAsRead: jest.fn(),
            deleteNotification: jest.fn(),
        } as unknown as jest.Mocked<NotificationService>;

        marketDataService = {
            getAssetByTicker: jest.fn(),
        } as unknown as jest.Mocked<MarketDataService>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DemoSeedService,
                {
                    provide: USER_REPOSITORY,
                    useValue: repository,
                },
                {
                    provide: PortfolioService,
                    useValue: portfolioService,
                },
                {
                    provide: TradeService,
                    useValue: tradeService,
                },
                {
                    provide: WatchlistService,
                    useValue: watchlistService,
                },
                {
                    provide: AlertService,
                    useValue: alertService,
                },
                {
                    provide: NotificationService,
                    useValue: notificationService,
                },
                {
                    provide: MarketDataService,
                    useValue: marketDataService,
                },
            ],
        }).compile();

        service = module.get(DemoSeedService);
    });

    it('creates demo user and seeds data across modules', async () => {
        const demoUser = new User('demo@notifinance.local', 'hash', 'Usuario Demo', true);
        demoUser.id = 'demo-user-1';

        repository.save.mockResolvedValue(demoUser);
        portfolioService.createPortfolio.mockResolvedValue({ id: 'portfolio-1', userId: 'demo-user-1', name: 'Demo Portfolio', description: null });
        tradeService.recordTrade.mockResolvedValue({} as never);
        watchlistService.addToWatchlist.mockResolvedValue({} as never);
        alertService.createAlert.mockResolvedValue({} as never);
        notificationService.createNotification.mockResolvedValue({} as never);
        marketDataService.getAssetByTicker.mockResolvedValue({ id: 'asset-ggal', ticker: 'GGAL' } as never);

        const result = await service.createDemoUserWithSeedData();

        expect(result.id).toBe('demo-user-1');
        expect(repository.save).toHaveBeenCalledTimes(1);
        expect(portfolioService.createPortfolio).toHaveBeenCalledTimes(1);
        expect(tradeService.recordTrade).toHaveBeenCalledTimes(9);
        expect(watchlistService.addToWatchlist).toHaveBeenCalledTimes(10);
        expect(alertService.createAlert).toHaveBeenCalledTimes(3);
        expect(notificationService.createNotification).toHaveBeenCalledTimes(5);
    });
});
