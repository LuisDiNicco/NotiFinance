import { Test, TestingModule } from '@nestjs/testing';
import { DispatcherService } from './DispatcherService';
import { TemplateCompilerService } from '../../../template/application/TemplateCompilerService';
import { PreferencesService } from '../../../preferences/application/PreferencesService';
import { CHANNEL_PROVIDERS, IChannelProvider } from './IChannelProvider';
import { EventPayload, EventType } from '../../../../ingestion/domain/EventPayload';
import { NotificationChannel, UserPreference } from '../../../preferences/domain/entities/UserPreference';
import { NotFoundException } from '@nestjs/common';

describe('DispatcherService', () => {
    let dispatcher: DispatcherService;
    let templateService: jest.Mocked<TemplateCompilerService>;
    let preferencesService: jest.Mocked<PreferencesService>;
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

        mockEmailChannel = {
            channelType: NotificationChannel.EMAIL,
            send: jest.fn().mockResolvedValue(undefined),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DispatcherService,
                { provide: TemplateCompilerService, useValue: templateService },
                { provide: PreferencesService, useValue: preferencesService },
                { provide: CHANNEL_PROVIDERS, useValue: [mockEmailChannel] },
            ],
        }).compile();

        dispatcher = module.get<DispatcherService>(DispatcherService);
    });

    it('should be defined', () => {
        expect(dispatcher).toBeDefined();
    });

    it('should discard event if user preference is not found', async () => {
        const event = new EventPayload('ev-1', EventType.PAYMENT_SUCCESS, 'user-1', {});
        preferencesService.getPreferences.mockRejectedValue(new NotFoundException());

        await dispatcher.dispatchEvent(event, 'corr-id-1');

        expect(preferencesService.getPreferences).toHaveBeenCalledWith('user-1');
        expect(templateService.compileTemplate).not.toHaveBeenCalled();
        expect(mockEmailChannel.send).not.toHaveBeenCalled();
    });

    it('should compile template and dispatch to allowed channels', async () => {
        const event = new EventPayload('ev-2', EventType.PAYMENT_SUCCESS, 'user-2', { amount: 100 });
        const prefs = new UserPreference('user-2', [NotificationChannel.EMAIL], []);

        preferencesService.getPreferences.mockResolvedValue(prefs);
        templateService.compileTemplate.mockResolvedValue({
            subject: 'Payment Successful',
            body: 'You paid 100',
        });

        await dispatcher.dispatchEvent(event, 'corr-id-2');

        expect(templateService.compileTemplate).toHaveBeenCalledWith(EventType.PAYMENT_SUCCESS, { amount: 100 });
        expect(mockEmailChannel.send).toHaveBeenCalledWith('user-2', 'Payment Successful', 'You paid 100', 'corr-id-2');
    });

    it('should not dispatch to channels disabled by user preferences', async () => {
        const event = new EventPayload('ev-3', EventType.SECURITY_LOGIN_ALERT, 'user-3', {});

        // User optics INTO Email, but strictly DISABLES SECURITY_LOGIN_ALERT events globally
        const prefs = new UserPreference('user-3', [NotificationChannel.EMAIL], [EventType.SECURITY_LOGIN_ALERT]);

        preferencesService.getPreferences.mockResolvedValue(prefs);
        templateService.compileTemplate.mockResolvedValue({ subject: 'Alert', body: '...' });

        await dispatcher.dispatchEvent(event, 'corr-id-3');

        // It should compile template usually, but when iterating providers it skips email
        expect(mockEmailChannel.send).not.toHaveBeenCalled();
    });
});
