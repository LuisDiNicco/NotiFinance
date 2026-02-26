import { Test, TestingModule } from '@nestjs/testing';
import { AlertService } from '../../../../../src/modules/alert/application/AlertService';
import {
  ALERT_REPOSITORY,
  IAlertRepository,
} from '../../../../../src/modules/alert/application/IAlertRepository';
import { Alert } from '../../../../../src/modules/alert/domain/entities/Alert';
import { AlertCondition } from '../../../../../src/modules/alert/domain/enums/AlertCondition';
import { AlertType } from '../../../../../src/modules/alert/domain/enums/AlertType';
import { AlertStatus } from '../../../../../src/modules/alert/domain/enums/AlertStatus';
import { NotificationChannel } from '../../../../../src/modules/preferences/domain/enums/NotificationChannel';
import { MarketDataService } from '../../../../../src/modules/market-data/application/MarketDataService';
import { AlertLimitExceededError } from '../../../../../src/modules/alert/domain/errors/AlertLimitExceededError';
import { AlertNotFoundError } from '../../../../../src/modules/alert/domain/errors/AlertNotFoundError';
import { Asset } from '../../../../../src/modules/market-data/domain/entities/Asset';
import { AssetType } from '../../../../../src/modules/market-data/domain/enums/AssetType';
import { AssetNotFoundError } from '../../../../../src/modules/market-data/domain/errors/AssetNotFoundError';

describe('AlertService', () => {
  let service: AlertService;
  let repository: jest.Mocked<IAlertRepository>;
  let marketDataService: jest.Mocked<MarketDataService>;

  const buildAlert = () =>
    new Alert({
      userId: 'user-1',
      assetId: 'asset-1',
      alertType: AlertType.PRICE,
      condition: AlertCondition.ABOVE,
      threshold: 100,
      channels: [NotificationChannel.IN_APP],
      isRecurring: true,
    });

  beforeEach(async () => {
    repository = {
      findByUserIdPaginated: jest.fn(),
      findById: jest.fn(),
      findActiveByAssetId: jest.fn(),
      findActiveByType: jest.fn(),
      countActiveByUserId: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    marketDataService = {
      getAssets: jest.fn(),
    } as unknown as jest.Mocked<MarketDataService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertService,
        {
          provide: ALERT_REPOSITORY,
          useValue: repository,
        },
        {
          provide: MarketDataService,
          useValue: marketDataService,
        },
      ],
    }).compile();

    service = module.get(AlertService);
  });

  it('creates alert when user is below active limit', async () => {
    repository.countActiveByUserId.mockResolvedValue(1);
    const asset = new Asset(
      'GGAL',
      'Galicia',
      AssetType.STOCK,
      'Fin',
      'GGAL.BA',
    );
    asset.id = 'asset-1';
    marketDataService.getAssets.mockResolvedValue([asset]);

    const alert = buildAlert();
    repository.save.mockImplementation(async (value) => value);

    const saved = await service.createAlert('user-1', alert);

    expect(saved.assetId).toBe('asset-1');
    expect(repository.save).toHaveBeenCalledTimes(1);
  });

  it('throws when active alert limit is reached', async () => {
    repository.countActiveByUserId.mockResolvedValue(20);

    await expect(service.createAlert('user-1', buildAlert())).rejects.toThrow(
      AlertLimitExceededError,
    );
  });

  it('throws when referenced asset does not exist', async () => {
    repository.countActiveByUserId.mockResolvedValue(0);
    marketDataService.getAssets.mockResolvedValue([]);

    await expect(service.createAlert('user-1', buildAlert())).rejects.toThrow(
      AssetNotFoundError,
    );
  });

  it('returns paginated user alerts', async () => {
    const alert = buildAlert();
    repository.findByUserIdPaginated.mockResolvedValue([alert]);

    const result = await service.getUserAlerts('user-1', 2, 10);

    expect(result).toEqual([alert]);
    expect(repository.findByUserIdPaginated).toHaveBeenCalledWith(
      'user-1',
      2,
      10,
    );
  });

  it('updates alert when owned by user', async () => {
    const existing = buildAlert();
    existing.id = 'alert-1';
    repository.findById.mockResolvedValue(existing);
    repository.save.mockImplementation(async (value) => value);

    const updated = await service.updateAlert('user-1', 'alert-1', {
      threshold: 150,
      status: AlertStatus.PAUSED,
    });

    expect(updated.threshold).toBe(150);
    expect(updated.status).toBe(AlertStatus.PAUSED);
  });

  it('throws AlertNotFoundError when updating alert from another user', async () => {
    const existing = buildAlert();
    existing.id = 'alert-1';
    Object.assign(existing, { userId: 'user-2' });
    repository.findById.mockResolvedValue(existing);

    await expect(
      service.updateAlert('user-1', 'alert-1', { threshold: 150 }),
    ).rejects.toThrow(AlertNotFoundError);
  });

  it('changes status via update path', async () => {
    const existing = buildAlert();
    existing.id = 'alert-1';
    repository.findById.mockResolvedValue(existing);
    repository.save.mockImplementation(async (value) => value);

    const updated = await service.changeStatus(
      'user-1',
      'alert-1',
      AlertStatus.PAUSED,
    );

    expect(updated.status).toBe(AlertStatus.PAUSED);
  });

  it('deletes alert when owned by user', async () => {
    const existing = buildAlert();
    existing.id = 'alert-1';
    repository.findById.mockResolvedValue(existing);

    await service.deleteAlert('user-1', 'alert-1');

    expect(repository.delete).toHaveBeenCalledWith('alert-1');
  });

  it('throws AlertNotFoundError when deleting missing or foreign alert', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(service.deleteAlert('user-1', 'missing')).rejects.toThrow(
      AlertNotFoundError,
    );
  });
});
