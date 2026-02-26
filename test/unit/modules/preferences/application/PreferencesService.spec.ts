import { Test, TestingModule } from '@nestjs/testing';
import { PreferencesService } from '../../../../../src/modules/preferences/application/PreferencesService';
import {
  IPreferencesRepository,
  PREFERENCES_REPO,
} from '../../../../../src/modules/preferences/application/IPreferencesRepository';
import { NotificationChannel } from '../../../../../src/modules/preferences/domain/enums/NotificationChannel';
import { DigestFrequency } from '../../../../../src/modules/preferences/domain/enums/DigestFrequency';
import { UserPreference } from '../../../../../src/modules/preferences/domain/entities/UserPreference';
import { PreferencesNotFoundError } from '../../../../../src/modules/preferences/domain/errors/PreferencesNotFoundError';

describe('PreferencesService', () => {
  let service: PreferencesService;
  let repository: jest.Mocked<IPreferencesRepository>;

  beforeEach(async () => {
    repository = {
      findByUserId: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PreferencesService,
        {
          provide: PREFERENCES_REPO,
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<PreferencesService>(PreferencesService);
  });

  it('returns preferences when user exists', async () => {
    const preference = new UserPreference(
      'user-1',
      [NotificationChannel.EMAIL],
      [],
    );
    repository.findByUserId.mockResolvedValue(preference);

    const result = await service.getPreferences('user-1');

    expect(result).toBe(preference);
    expect(repository.findByUserId).toHaveBeenCalledWith('user-1');
  });

  it('throws PreferencesNotFoundError when user does not exist', async () => {
    repository.findByUserId.mockResolvedValue(null);

    await expect(service.getPreferences('missing-user')).rejects.toThrow(
      PreferencesNotFoundError,
    );
  });

  it('creates or updates preferences through repository', async () => {
    const savedPreference = new UserPreference(
      'user-2',
      [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
      ['alert.risk.above'],
      '22:00',
      '07:00',
      DigestFrequency.DAILY,
    );

    repository.save.mockResolvedValue(savedPreference);

    const result = await service.createOrUpdatePreferences(
      'user-2',
      [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
      ['alert.risk.above'],
      '22:00',
      '07:00',
      DigestFrequency.DAILY,
    );

    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-2',
        optInChannels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
        disabledEventTypes: ['alert.risk.above'],
        quietHoursStart: '22:00',
        quietHoursEnd: '07:00',
        digestFrequency: DigestFrequency.DAILY,
      }),
    );
    expect(result).toBe(savedPreference);
  });
});
