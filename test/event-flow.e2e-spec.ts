import { Test, TestingModule } from '@nestjs/testing';
import { RmqContext } from '@nestjs/microservices';
import { AlertEvaluationConsumer } from '../src/modules/alert/infrastructure/primary-adapters/message-brokers/consumers/AlertEvaluationConsumer';
import { EventConsumer } from '../src/modules/notification/infrastructure/primary-adapters/message-brokers/consumers/EventConsumer';
import { AlertEvaluationEngine } from '../src/modules/alert/application/AlertEvaluationEngine';
import {
  EVENT_PUBLISHER,
  IEventPublisher,
} from '../src/modules/ingestion/application/IEventPublisher';
import { EventPayload } from '../src/modules/ingestion/domain/EventPayload';
import { EventType } from '../src/modules/ingestion/domain/enums/EventType';
import { Alert } from '../src/modules/alert/domain/entities/Alert';
import { AlertType } from '../src/modules/alert/domain/enums/AlertType';
import { AlertCondition } from '../src/modules/alert/domain/enums/AlertCondition';
import { NotificationChannel } from '../src/modules/preferences/domain/enums/NotificationChannel';
import { DispatcherService } from '../src/modules/notification/application/services/DispatcherService';
import { TemplateCompilerService } from '../src/modules/template/application/TemplateCompilerService';
import { PreferencesService } from '../src/modules/preferences/application/PreferencesService';
import { NotificationService } from '../src/modules/notification/application/services/NotificationService';
import {
  CHANNEL_PROVIDERS,
  IChannelProvider,
} from '../src/modules/notification/application/services/IChannelProvider';
import { UserPreference } from '../src/modules/preferences/domain/entities/UserPreference';
import { Notification } from '../src/modules/notification/domain/entities/Notification';

interface RabbitMQMessage {
  payload: EventPayload;
  options?: {
    headers?: Record<string, unknown>;
  };
}

describe('Market -> Alert -> Notification flow (integration)', () => {
  let alertConsumer: AlertEvaluationConsumer;
  let eventConsumer: EventConsumer;

  let alertEvaluationEngine: jest.Mocked<AlertEvaluationEngine>;
  let eventPublisher: jest.Mocked<IEventPublisher>;
  let templateService: jest.Mocked<TemplateCompilerService>;
  let preferencesService: jest.Mocked<PreferencesService>;
  let notificationService: jest.Mocked<NotificationService>;
  let emailChannel: jest.Mocked<IChannelProvider>;

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
    alertEvaluationEngine = {
      evaluateAlertsForAsset: jest.fn(),
      evaluateAlertsForDollar: jest.fn(),
      evaluateAlertsForRisk: jest.fn(),
    } as unknown as jest.Mocked<AlertEvaluationEngine>;

    eventPublisher = {
      publishEvent: jest.fn(),
    };

    templateService = {
      compileTemplate: jest.fn(),
      saveTemplate: jest.fn(),
      listTemplates: jest.fn(),
    } as unknown as jest.Mocked<TemplateCompilerService>;

    preferencesService = {
      getPreferences: jest.fn(),
      createOrUpdatePreferences: jest.fn(),
    } as unknown as jest.Mocked<PreferencesService>;

    notificationService = {
      createNotification: jest.fn(),
      getUserNotifications: jest.fn(),
      getUnreadCount: jest.fn(),
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
      deleteNotification: jest.fn(),
    } as unknown as jest.Mocked<NotificationService>;

    emailChannel = {
      channelType: NotificationChannel.EMAIL,
      send: jest.fn().mockResolvedValue(undefined),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AlertEvaluationConsumer, EventConsumer],
      providers: [
        DispatcherService,
        {
          provide: AlertEvaluationEngine,
          useValue: alertEvaluationEngine,
        },
        {
          provide: EVENT_PUBLISHER,
          useValue: eventPublisher,
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
          provide: NotificationService,
          useValue: notificationService,
        },
        {
          provide: CHANNEL_PROVIDERS,
          useValue: [emailChannel],
        },
      ],
    }).compile();

    alertConsumer = moduleRef.get(AlertEvaluationConsumer);
    eventConsumer = moduleRef.get(EventConsumer);

    preferencesService.getPreferences.mockResolvedValue(
      new UserPreference('user-1', [NotificationChannel.EMAIL], []),
    );
    templateService.compileTemplate.mockResolvedValue({
      subject: 'GGAL superó el umbral',
      body: 'Precio actual: 8100',
    });
    const notification = new Notification({
      userId: 'user-1',
      alertId: 'alert-1',
      title: 'GGAL superó el umbral',
      body: 'Precio actual: 8100',
      type: EventType.ALERT_PRICE_ABOVE,
      metadata: {},
    });
    notification.id = 'notif-1';

    notificationService.createNotification.mockResolvedValue(notification);
  });

  it('publishes market event, evaluates alert and dispatches notification', async () => {
    const alert = new Alert({
      userId: 'user-1',
      assetId: 'asset-ggal',
      alertType: AlertType.PRICE,
      condition: AlertCondition.ABOVE,
      threshold: 8000,
      channels: [NotificationChannel.EMAIL],
      isRecurring: true,
    });
    alert.id = 'alert-1';

    alertEvaluationEngine.evaluateAlertsForAsset.mockResolvedValue([alert]);

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
          'x-correlation-id': 'corr-flow-1',
        },
      },
    };

    const alertContext = buildRmqContext();
    await alertConsumer.onQuoteUpdated(marketMessage, alertContext.context);

    expect(eventPublisher.publishEvent).toHaveBeenCalledTimes(1);
    const publishedEvent = eventPublisher.publishEvent.mock
      .calls[0]?.[0] as EventPayload;
    const publishedCorrelationId =
      eventPublisher.publishEvent.mock.calls[0]?.[1];

    expect(publishedCorrelationId).toBe('corr-flow-1');
    expect(publishedEvent.eventType).toBe(EventType.ALERT_PRICE_ABOVE);
    expect(publishedEvent.recipientId).toBe('user-1');

    const alertMessage: RabbitMQMessage = {
      payload: publishedEvent,
      options: {
        headers: {
          'x-correlation-id': 'corr-flow-1',
        },
      },
    };

    const notificationContext = buildRmqContext();
    await eventConsumer.handleIncomingEvent(
      alertMessage,
      notificationContext.context,
    );

    expect(templateService.compileTemplate).toHaveBeenCalledWith(
      EventType.ALERT_PRICE_ABOVE,
      expect.objectContaining({
        alertId: 'alert-1',
        threshold: 8000,
        currentValue: 8100,
      }),
    );
    expect(notificationService.createNotification).toHaveBeenCalledTimes(1);
    expect(emailChannel.send).toHaveBeenCalledWith(
      'user-1',
      'GGAL superó el umbral',
      'Precio actual: 8100',
      'corr-flow-1',
    );
    expect(alertContext.channel.ack).toHaveBeenCalledTimes(1);
    expect(notificationContext.channel.ack).toHaveBeenCalledTimes(1);
  });
});
