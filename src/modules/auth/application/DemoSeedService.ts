import { Inject, Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';
import { USER_REPOSITORY, type IUserRepository } from './IUserRepository';
import { User } from '../domain/entities/User';
import { PortfolioService } from '../../portfolio/application/PortfolioService';
import { TradeService } from '../../portfolio/application/TradeService';
import { TradeType } from '../../portfolio/domain/enums/TradeType';
import { WatchlistService } from '../../watchlist/application/WatchlistService';
import { AlertService } from '../../alert/application/AlertService';
import { Alert } from '../../alert/domain/entities/Alert';
import { AlertType } from '../../alert/domain/enums/AlertType';
import { AlertCondition } from '../../alert/domain/enums/AlertCondition';
import { AlertStatus } from '../../alert/domain/enums/AlertStatus';
import { NotificationChannel } from '../../preferences/domain/enums/NotificationChannel';
import { NotificationService } from '../../notification/application/services/NotificationService';
import { EventType } from '../../ingestion/domain/enums/EventType';
import { MarketDataService } from '../../market-data/application/MarketDataService';

@Injectable()
export class DemoSeedService {
  private readonly logger = new Logger(DemoSeedService.name);
  private static readonly SALT_ROUNDS = 10;

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly portfolioService: PortfolioService,
    private readonly tradeService: TradeService,
    private readonly watchlistService: WatchlistService,
    private readonly alertService: AlertService,
    private readonly notificationService: NotificationService,
    private readonly marketDataService: MarketDataService,
  ) {}

  public async createDemoUserWithSeedData(): Promise<User> {
    const demoEmail = `demo-${Date.now()}-${randomUUID()}@notifinance.local`;
    const demoPasswordHash = await bcrypt.hash(
      randomUUID(),
      DemoSeedService.SALT_ROUNDS,
    );

    const demoUser = new User(
      demoEmail,
      demoPasswordHash,
      'Usuario Demo',
      true,
    );
    const savedUser = await this.userRepository.save(demoUser);

    if (!savedUser.id) {
      throw new Error('Failed to create demo user id');
    }

    await this.seedPortfolio(savedUser.id);
    await this.seedWatchlist(savedUser.id);
    await this.seedAlerts(savedUser.id);
    await this.seedNotifications(savedUser.id);

    return savedUser;
  }

  private async seedPortfolio(userId: string): Promise<void> {
    const portfolio = await this.portfolioService.createPortfolio(
      userId,
      'Demo Portfolio',
      'Portafolio inicial para explorar NotiFinance',
    );

    if (!portfolio.id) {
      this.logger.warn(
        `Demo portfolio for user ${userId} has no id. Skipping trade seeding.`,
      );
      return;
    }

    const trades = [
      { ticker: 'GGAL', quantity: 20, pricePerUnit: 7800, currency: 'ARS' },
      { ticker: 'YPFD', quantity: 6, pricePerUnit: 33500, currency: 'ARS' },
      { ticker: 'PAMP', quantity: 12, pricePerUnit: 2900, currency: 'ARS' },
      { ticker: 'AAPL', quantity: 10, pricePerUnit: 18000, currency: 'ARS' },
      { ticker: 'MSFT', quantity: 6, pricePerUnit: 22000, currency: 'ARS' },
      { ticker: 'GOOGL', quantity: 8, pricePerUnit: 21000, currency: 'ARS' },
      { ticker: 'NVDA', quantity: 5, pricePerUnit: 26000, currency: 'ARS' },
      { ticker: 'AL30', quantity: 200, pricePerUnit: 580, currency: 'USD' },
      { ticker: 'GD30', quantity: 200, pricePerUnit: 610, currency: 'USD' },
    ];

    for (const trade of trades) {
      try {
        await this.tradeService.recordTrade({
          userId,
          portfolioId: portfolio.id,
          ticker: trade.ticker,
          tradeType: TradeType.BUY,
          quantity: trade.quantity,
          pricePerUnit: trade.pricePerUnit,
          currency: trade.currency,
        });
      } catch (error) {
        this.logger.warn(
          `Skipping demo trade for ${trade.ticker}: ${(error as Error).message}`,
        );
      }
    }
  }

  private async seedWatchlist(userId: string): Promise<void> {
    const tickers = [
      'GGAL',
      'YPFD',
      'PAMP',
      'BMA',
      'AL30',
      'GD30',
      'AAPL',
      'MSFT',
      'GOOGL',
      'NVDA',
    ];

    for (const ticker of tickers) {
      try {
        await this.watchlistService.addToWatchlist(userId, ticker);
      } catch (error) {
        this.logger.warn(
          `Skipping demo watchlist ticker ${ticker}: ${(error as Error).message}`,
        );
      }
    }
  }

  private async seedAlerts(userId: string): Promise<void> {
    try {
      const ggal = await this.marketDataService.getAssetByTicker('GGAL');

      await this.alertService.createAlert(
        userId,
        new Alert({
          userId,
          assetId: ggal.id ?? null,
          alertType: AlertType.PRICE,
          condition: AlertCondition.ABOVE,
          threshold: 8000,
          channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
          isRecurring: true,
          status: AlertStatus.ACTIVE,
        }),
      );
    } catch (error) {
      this.logger.warn(`Skipping GGAL demo alert: ${(error as Error).message}`);
    }

    try {
      await this.alertService.createAlert(
        userId,
        new Alert({
          userId,
          alertType: AlertType.DOLLAR,
          condition: AlertCondition.ABOVE,
          threshold: 1500,
          channels: [NotificationChannel.IN_APP],
          isRecurring: true,
          status: AlertStatus.ACTIVE,
        }),
      );
    } catch (error) {
      this.logger.warn(
        `Skipping dollar demo alert: ${(error as Error).message}`,
      );
    }

    try {
      await this.alertService.createAlert(
        userId,
        new Alert({
          userId,
          alertType: AlertType.RISK,
          condition: AlertCondition.BELOW,
          threshold: 500,
          channels: [NotificationChannel.IN_APP],
          isRecurring: true,
          status: AlertStatus.ACTIVE,
        }),
      );
    } catch (error) {
      this.logger.warn(`Skipping risk demo alert: ${(error as Error).message}`);
    }
  }

  private async seedNotifications(userId: string): Promise<void> {
    const notifications = [
      {
        title: 'GGAL superó $8.000',
        body: 'Tu alerta de precio se activó con un cierre de $8.100.',
        type: EventType.ALERT_PRICE_ABOVE,
        metadata: { ticker: 'GGAL', currentValue: 8100, threshold: 8000 },
      },
      {
        title: 'Dólar MEP supera $1.500',
        body: 'El dólar MEP alcanzó $1.512 y activó la alerta.',
        type: EventType.ALERT_DOLLAR_ABOVE,
        metadata: { dollarType: 'MEP', currentValue: 1512, threshold: 1500 },
      },
      {
        title: 'Riesgo país por debajo de 500',
        body: 'El riesgo país bajó a 492 puntos.',
        type: EventType.ALERT_RISK_BELOW,
        metadata: { currentValue: 492, threshold: 500 },
      },
      {
        title: 'AAPL sube +3.4%',
        body: 'AAPL registró una suba diaria significativa.',
        type: EventType.ALERT_PCT_UP,
        metadata: { ticker: 'AAPL', currentValue: 3.4, threshold: 3 },
      },
      {
        title: 'AL30 cae -2.1%',
        body: 'AL30 retrocedió y quedó bajo tu umbral porcentual.',
        type: EventType.ALERT_PCT_DOWN,
        metadata: { ticker: 'AL30', currentValue: -2.1, threshold: -2 },
      },
    ];

    for (const item of notifications) {
      await this.notificationService.createNotification({
        userId,
        title: item.title,
        body: item.body,
        type: item.type,
        metadata: item.metadata,
      });
    }
  }
}
