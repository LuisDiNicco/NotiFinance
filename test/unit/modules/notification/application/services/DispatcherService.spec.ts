import { Test, TestingModule } from '@nestjs/testing';
import { DispatcherService } from '../../../../../../src/modules/notification/application/services/DispatcherService';
import { TemplateCompilerService } from '../../../../../../src/modules/template/application/TemplateCompilerService';
import { PreferencesService } from '../../../../../../src/modules/preferences/application/PreferencesService';
import {
  CHANNEL_PROVIDERS,
  IChannelProvider,
} from '../../../../../../src/modules/notification/application/services/IChannelProvider';
import { EventPayload } from '../../../../../../src/modules/ingestion/domain/EventPayload';
import { EventType } from '../../../../../../src/modules/ingestion/domain/enums/EventType';
import { NotificationChannel } from '../../../../../../src/modules/preferences/domain/enums/NotificationChannel';
import { UserPreference } from '../../../../../../src/modules/preferences/domain/entities/UserPreference';
import { PreferencesNotFoundError } from '../../../../../../src/modules/preferences/domain/errors/PreferencesNotFoundError';
import { NotificationService } from '../../../../../../src/modules/notification/application/services/NotificationService';
import { Notification } from '../../../../../../src/modules/notification/domain/entities/Notification';

describe('DispatcherService', () => {
  let dispatcher: DispatcherService;
  let templateService: jest.Mocked<TemplateCompilerService>;
  let preferencesService: jest.Mocked<PreferencesService>;
  let notificationService: jest.Mocked<NotificationService>;
  let mockEmailChannel: jest.Mocked<IChannelProvider>;

  beforeEach(async () => {
    templateService = {
      compileTemplate: jest.fn(),
      saveTemplate: jest.fn(),
    } as unknown as jest.Mocked<TemplateCompilerService>;

    preferencesService = {
      getPreferences: jest.fn(),
      createOrUpdatePreferences: jest.fn(),
    } as unknown as jest.Mocked<PreferencesService>;

    notificationService = {
      getUserNotifications: jest.fn(),
      getUserNotificationsTotal: jest.fn(),
      getUnreadCount: jest.fn(),
      createNotification: jest.fn(),
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
      deleteNotification: jest.fn(),
    } as unknown as jest.Mocked<NotificationService>;

    mockEmailChannel = {
      channelType: NotificationChannel.EMAIL,
      send: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DispatcherService,
        { provide: TemplateCompilerService, useValue: templateService },
        { provide: PreferencesService, useValue: preferencesService },
        { provide: NotificationService, useValue: notificationService },
        { provide: CHANNEL_PROVIDERS, useValue: [mockEmailChannel] },
      ],
    }).compile();

    dispatcher = module.get<DispatcherService>(DispatcherService);
  });

  it('should be defined', () => {
    expect(dispatcher).toBeDefined();
  });

  it('should discard event if user preference is not found', async () => {
    const event = new EventPayload(
      'ev-1',
      EventType.ALERT_PRICE_ABOVE,
      'user-1',
      {},
    );
    preferencesService.getPreferences.mockRejectedValue(
      new PreferencesNotFoundError('user-1'),
    );

    await dispatcher.dispatchEvent(event, 'corr-id-1');

    expect(preferencesService.getPreferences).toHaveBeenCalledWith('user-1');
    expect(templateService.compileTemplate).not.toHaveBeenCalled();
    expect(mockEmailChannel.send).not.toHaveBeenCalled();
  });

  it('should compile template and dispatch to allowed channels', async () => {
    const event = new EventPayload(
      'ev-2',
      EventType.ALERT_PRICE_ABOVE,
      'user-2',
      { amount: 100 },
    );
    const prefs = new UserPreference('user-2', [NotificationChannel.EMAIL], []);

    preferencesService.getPreferences.mockResolvedValue(prefs);
    templateService.compileTemplate.mockResolvedValue({
      subject: 'Payment Successful',
      body: 'You paid 100',
    });
    const persisted = new Notification({
      userId: 'user-2',
      alertId: null,
      title: 'Payment Successful',
      body: 'You paid 100',
      type: EventType.ALERT_PRICE_ABOVE,
      metadata: { amount: 100 },
      isRead: false,
    });
    persisted.id = 'notif-1';
    notificationService.createNotification.mockResolvedValue(persisted);

    await dispatcher.dispatchEvent(event, 'corr-id-2');

    expect(templateService.compileTemplate).toHaveBeenCalledWith(
      EventType.ALERT_PRICE_ABOVE,
      { amount: 100 },
    );
    expect(mockEmailChannel.send).toHaveBeenCalledWith(
      'user-2',
      {
        id: 'notif-1',
        title: 'Payment Successful',
        body: 'You paid 100',
        type: EventType.ALERT_PRICE_ABOVE,
        metadata: { amount: 100 },
        createdAt: expect.any(String),
      },
      'corr-id-2',
    );
  });

  it('should not dispatch to channels disabled by user preferences', async () => {
    const event = new EventPayload(
      'ev-3',
      EventType.ALERT_RISK_ABOVE,
      'user-3',
      {},
    );

    // User optics INTO Email, but strictly DISABLES ALERT_RISK_ABOVE events globally
    const prefs = new UserPreference(
      'user-3',
      [NotificationChannel.EMAIL],
      [EventType.ALERT_RISK_ABOVE],
    );

    preferencesService.getPreferences.mockResolvedValue(prefs);
    templateService.compileTemplate.mockResolvedValue({
      subject: 'Alert',
      body: '...',
    });
    const persisted = new Notification({
      userId: 'user-3',
      alertId: null,
      title: 'Alert',
      body: '...',
      type: EventType.ALERT_RISK_ABOVE,
      metadata: {},
      isRead: false,
    });
    persisted.id = 'notif-2';
    notificationService.createNotification.mockResolvedValue(persisted);

    await dispatcher.dispatchEvent(event, 'corr-id-3');

    // It should compile template usually, but when iterating providers it skips email
    expect(mockEmailChannel.send).not.toHaveBeenCalled();
  });
});
