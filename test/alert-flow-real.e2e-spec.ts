import { Test, TestingModule } from '@nestjs/testing';
import { RmqContext } from '@nestjs/microservices';
import { AlertEvaluationConsumer } from '../src/modules/alert/infrastructure/primary-adapters/message-brokers/consumers/AlertEvaluationConsumer';
import { EventConsumer } from '../src/modules/notification/infrastructure/primary-adapters/message-brokers/consumers/EventConsumer';
import { AlertEvaluationEngine } from '../src/modules/alert/application/AlertEvaluationEngine';
import {
  ALERT_REPOSITORY,
  IAlertRepository,
} from '../src/modules/alert/application/IAlertRepository';
import { AlertService } from '../src/modules/alert/application/AlertService';
import { Alert } from '../src/modules/alert/domain/entities/Alert';
import { AlertType } from '../src/modules/alert/domain/enums/AlertType';
import { AlertCondition } from '../src/modules/alert/domain/enums/AlertCondition';
import { AlertStatus } from '../src/modules/alert/domain/enums/AlertStatus';
import {
  EVENT_PUBLISHER,
  IEventPublisher,
} from '../src/modules/ingestion/application/IEventPublisher';
import { EventPayload } from '../src/modules/ingestion/domain/EventPayload';
import { EventType } from '../src/modules/ingestion/domain/enums/EventType';
import { DispatcherService } from '../src/modules/notification/application/services/DispatcherService';
import {
  CHANNEL_PROVIDERS,
  IChannelProvider,
} from '../src/modules/notification/application/services/IChannelProvider';
import { NotificationService } from '../src/modules/notification/application/services/NotificationService';
import {
  INotificationRepository,
  NOTIFICATION_REPOSITORY,
} from '../src/modules/notification/application/services/INotificationRepository';
import { Notification } from '../src/modules/notification/domain/entities/Notification';
import { InAppChannelAdapter } from '../src/modules/notification/infrastructure/secondary-adapters/workers/InAppChannelAdapter';
import { NotificationGateway } from '../src/modules/notification/infrastructure/secondary-adapters/websockets/NotificationGateway';
import { TemplateCompilerService } from '../src/modules/template/application/TemplateCompilerService';
import { PreferencesService } from '../src/modules/preferences/application/PreferencesService';
import { UserPreference } from '../src/modules/preferences/domain/entities/UserPreference';
import { NotificationChannel } from '../src/modules/preferences/domain/enums/NotificationChannel';
import { MarketDataService } from '../src/modules/market-data/application/MarketDataService';
import { Asset } from '../src/modules/market-data/domain/entities/Asset';
import { AssetType } from '../src/modules/market-data/domain/enums/AssetType';

interface RabbitMQMessage {
  payload: EventPayload;
  options?: {
    headers?: Record<string, unknown>;
  };
}

class InMemoryAlertRepository implements IAlertRepository {
  public alerts: Alert[] = [];

  public async findByUserIdPaginated(
    userId: string,
    page: number,
    limit: number,
  ): Promise<Alert[]> {
    const offset = Math.max(0, (page - 1) * limit);
    return this.alerts
      .filter((alert) => alert.userId === userId)
      .slice(offset, offset + limit);
  }

  public async findById(alertId: string): Promise<Alert | null> {
    return this.alerts.find((alert) => alert.id === alertId) ?? null;
  }

  public async countByUserId(userId: string): Promise<number> {
    return this.alerts.filter((alert) => alert.userId === userId).length;
  }

  public async findActiveByAssetId(assetId: string): Promise<Alert[]> {
    return this.alerts.filter(
      (alert) =>
        alert.assetId === assetId && alert.status === AlertStatus.ACTIVE,
    );
  }

  public async findActiveByType(alertType: AlertType): Promise<Alert[]> {
    return this.alerts.filter(
      (alert) =>
        alert.alertType === alertType && alert.status === AlertStatus.ACTIVE,
    );
  }

  public async countActiveByUserId(userId: string): Promise<number> {
    return this.alerts.filter(
      (alert) => alert.userId === userId && alert.status === AlertStatus.ACTIVE,
    ).length;
  }

  public async save(alert: Alert): Promise<Alert> {
    if (!alert.id) {
      alert.id = `alert-${this.alerts.length + 1}`;
      this.alerts.push(alert);
      return alert;
    }

    const index = this.alerts.findIndex((item) => item.id === alert.id);
    if (index >= 0) {
      this.alerts[index] = alert;
    } else {
      this.alerts.push(alert);
    }

    return alert;
  }

  public async delete(alertId: string): Promise<void> {
    this.alerts = this.alerts.filter((alert) => alert.id !== alertId);
  }
}

class InMemoryNotificationRepository implements INotificationRepository {
  public notifications: Notification[] = [];

  public async findByUserPaginated(
    userId: string,
    unreadOnly: boolean,
    page: number,
    limit: number,
  ): Promise<Notification[]> {
    const offset = Math.max(0, (page - 1) * limit);
    const filtered = this.notifications.filter(
      (notification) =>
        notification.userId === userId &&
        (!unreadOnly || notification.isRead === false),
    );

    return filtered.slice(offset, offset + limit);
  }

  public async countByUser(
    userId: string,
    unreadOnly: boolean,
  ): Promise<number> {
    return this.notifications.filter(
      (notification) =>
        notification.userId === userId &&
        (!unreadOnly || notification.isRead === false),
    ).length;
  }

  public async countUnread(userId: string): Promise<number> {
    return this.notifications.filter(
      (notification) => notification.userId === userId && !notification.isRead,
    ).length;
  }

  public async findById(notificationId: string): Promise<Notification | null> {
    return (
      this.notifications.find(
        (notification) => notification.id === notificationId,
      ) ?? null
    );
  }

  public async save(notification: Notification): Promise<Notification> {
    if (!notification.id) {
      notification.id = `notif-${this.notifications.length + 1}`;
    }

    const index = this.notifications.findIndex(
      (item) => item.id === notification.id,
    );
    const saved = new Notification({
      userId: notification.userId,
      alertId: notification.alertId,
      title: notification.title,
      body: notification.body,
      type: notification.type,
      metadata: notification.metadata,
      isRead: notification.isRead,
      readAt: notification.readAt,
      createdAt: notification.createdAt ?? new Date(),
    });
    saved.id = notification.id;

    if (index >= 0) {
      this.notifications[index] = saved;
    } else {
      this.notifications.push(saved);
    }

    return saved;
  }

  public async markAllAsRead(userId: string): Promise<number> {
    let updated = 0;

    this.notifications = this.notifications.map((notification) => {
      if (notification.userId !== userId || notification.isRead) {
        return notification;
      }

      notification.markAsRead();
      updated += 1;
      return notification;
    });

    return updated;
  }

  public async delete(notificationId: string): Promise<void> {
    this.notifications = this.notifications.filter(
      (notification) => notification.id !== notificationId,
    );
  }
}

describe('Alert flow with realistic cycle (e2e)', () => {
  let alertService: AlertService;
  let alertConsumer: AlertEvaluationConsumer;
  let eventConsumer: EventConsumer;
  let notificationService: NotificationService;

  let alertRepository: InMemoryAlertRepository;
  let notificationRepository: InMemoryNotificationRepository;
  let eventPublisher: jest.Mocked<IEventPublisher>;
  let notificationGateway: {
    emitNotification: jest.Mock;
    emitNotificationCount: jest.Mock;
  };

  const buildRmqContext = () => {
    const channel = {
      ack: jest.fn(),
      nack: jest.fn(),
    };

    return {
      channel,
      context: {
        getChannelRef: () => channel,
        getMessage: () => ({
          fields: {},
          properties: {},
          content: Buffer.from(''),
        }),
      } as unknown as RmqContext,
    };
  };

  beforeEach(async () => {
    alertRepository = new InMemoryAlertRepository();
    notificationRepository = new InMemoryNotificationRepository();

    eventPublisher = {
      publishEvent: jest.fn().mockResolvedValue(undefined),
    };

    const marketAsset = new Asset(
      'GGAL',
      'Grupo Financiero Galicia',
      AssetType.STOCK,
      'Financiero',
      'GGAL.BA',
    );
    marketAsset.id = 'asset-ggal';

    const marketDataService = {
      getAssets: jest.fn().mockResolvedValue([marketAsset]),
    } as unknown as MarketDataService;

    const templateService = {
      compileTemplate: jest.fn().mockResolvedValue({
        subject: 'GGAL superó umbral',
        body: 'Precio actual: 8100',
      }),
      saveTemplate: jest.fn(),
      listTemplates: jest.fn(),
    } as unknown as TemplateCompilerService;

    const preferencesService = {
      getPreferences: jest
        .fn()
        .mockResolvedValue(
          new UserPreference('user-1', [NotificationChannel.IN_APP]),
        ),
      createOrUpdatePreferences: jest.fn(),
    } as unknown as PreferencesService;

    notificationGateway = {
      emitNotification: jest.fn(),
      emitNotificationCount: jest.fn(),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AlertEvaluationConsumer, EventConsumer],
      providers: [
        AlertService,
        AlertEvaluationEngine,
        DispatcherService,
        NotificationService,
        InAppChannelAdapter,
        {
          provide: ALERT_REPOSITORY,
          useValue: alertRepository,
        },
        {
          provide: NOTIFICATION_REPOSITORY,
          useValue: notificationRepository,
        },
        {
          provide: EVENT_PUBLISHER,
          useValue: eventPublisher,
        },
        {
          provide: MarketDataService,
          useValue: marketDataService,
        },
        {
          provide: TemplateCompilerService,
          useValue: templateService,
        },
        {
          provide: PreferencesService,
          useValue: preferencesService,
        },
        {
          provide: NotificationGateway,
          useValue: notificationGateway,
        },
        {
          provide: CHANNEL_PROVIDERS,
          useFactory: (
            inAppChannelAdapter: InAppChannelAdapter,
          ): IChannelProvider[] => [inAppChannelAdapter],
          inject: [InAppChannelAdapter],
        },
      ],
    }).compile();

    alertService = moduleRef.get(AlertService);
    alertConsumer = moduleRef.get(AlertEvaluationConsumer);
    eventConsumer = moduleRef.get(EventConsumer);
    notificationService = moduleRef.get(NotificationService);
  });

  it('creates a realistic price alert and validates market->alert->notification flow', async () => {
    const createdAlert = await alertService.createAlert(
      'user-1',
      new Alert({
        userId: 'user-1',
        assetId: 'asset-ggal',
        alertType: AlertType.PRICE,
        condition: AlertCondition.ABOVE,
        threshold: 8000,
        channels: [NotificationChannel.IN_APP],
        isRecurring: true,
      }),
    );

    expect(createdAlert.id).toBeDefined();

    const marketEvent = new EventPayload(
      'ev-market-1',
      EventType.MARKET_QUOTE_UPDATED,
      'system-market',
      {
        assetId: 'asset-ggal',
        ticker: 'GGAL',
        closePrice: 8100,
        changePct: 2.3,
      },
    );

    const marketMessage: RabbitMQMessage = {
      payload: marketEvent,
      options: {
        headers: {
          'x-correlation-id': 'corr-real-flow-1',
        },
      },
    };

    const alertContext = buildRmqContext();
    await alertConsumer.onQuoteUpdated(marketMessage, alertContext.context);

    expect(eventPublisher.publishEvent).toHaveBeenCalledTimes(1);
    const publishedEvent = eventPublisher.publishEvent.mock
      .calls[0]?.[0] as EventPayload;
    expect(publishedEvent.eventType).toBe(EventType.ALERT_PRICE_ABOVE);

    const alertMessage: RabbitMQMessage = {
      payload: publishedEvent,
      options: {
        headers: {
          'x-correlation-id': 'corr-real-flow-1',
        },
      },
    };

    const notificationContext = buildRmqContext();
    await eventConsumer.handleIncomingEvent(
      alertMessage,
      notificationContext.context,
    );

    const totalNotifications =
      await notificationService.getUserNotificationsTotal('user-1', false);
    expect(totalNotifications).toBe(1);
    expect(notificationGateway.emitNotification).toHaveBeenCalledTimes(1);
    expect(notificationGateway.emitNotificationCount).toHaveBeenCalledTimes(1);
    expect(alertContext.channel.ack).toHaveBeenCalledTimes(1);
    expect(notificationContext.channel.ack).toHaveBeenCalledTimes(1);
  });
});
