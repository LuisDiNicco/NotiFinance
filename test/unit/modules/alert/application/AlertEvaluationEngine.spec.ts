import { Test, TestingModule } from '@nestjs/testing';
import { AlertEvaluationEngine } from '../../../../../src/modules/alert/application/AlertEvaluationEngine';
import {
  ALERT_REPOSITORY,
  IAlertRepository,
} from '../../../../../src/modules/alert/application/IAlertRepository';
import { Alert } from '../../../../../src/modules/alert/domain/entities/Alert';
import { AlertCondition } from '../../../../../src/modules/alert/domain/enums/AlertCondition';
import { AlertStatus } from '../../../../../src/modules/alert/domain/enums/AlertStatus';
import { AlertType } from '../../../../../src/modules/alert/domain/enums/AlertType';
import { NotificationChannel } from '../../../../../src/modules/preferences/domain/enums/NotificationChannel';

describe('AlertEvaluationEngine', () => {
  let engine: AlertEvaluationEngine;
  let repository: jest.Mocked<IAlertRepository>;

  const buildAlert = (patch?: Partial<Alert>): Alert => {
    const alert = new Alert({
      userId: 'user-1',
      assetId: 'asset-1',
      alertType: AlertType.PRICE,
      condition: AlertCondition.ABOVE,
      threshold: 100,
      channels: [NotificationChannel.IN_APP],
      isRecurring: true,
      status: AlertStatus.ACTIVE,
    });

    if (patch) {
      Object.assign(alert, patch);
    }

    return alert;
  };

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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertEvaluationEngine,
        {
          provide: ALERT_REPOSITORY,
          useValue: repository,
        },
      ],
    }).compile();

    engine = module.get(AlertEvaluationEngine);
  });

  it('returns triggered alerts for asset updates', async () => {
    const alert = buildAlert();
    repository.findActiveByAssetId.mockResolvedValue([alert]);
    repository.save.mockImplementation(async (value) => value);

    const triggered = await engine.evaluateAlertsForAsset('asset-1', 110);

    expect(triggered).toHaveLength(1);
    expect(repository.save).toHaveBeenCalledTimes(1);
  });

  it('ignores alerts that cannot trigger', async () => {
    const alert = buildAlert({ status: AlertStatus.PAUSED });
    repository.findActiveByAssetId.mockResolvedValue([alert]);

    const triggered = await engine.evaluateAlertsForAsset('asset-1', 110);

    expect(triggered).toHaveLength(0);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('ignores alerts when condition is not met', async () => {
    const alert = buildAlert({
      condition: AlertCondition.BELOW,
      threshold: 80,
    });
    repository.findActiveByAssetId.mockResolvedValue([alert]);

    const triggered = await engine.evaluateAlertsForAsset('asset-1', 110);

    expect(triggered).toHaveLength(0);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('filters dollar alerts by period', async () => {
    const matching = buildAlert({
      alertType: AlertType.DOLLAR,
      period: 'MEP',
      assetId: null,
    });
    const nonMatching = buildAlert({
      alertType: AlertType.DOLLAR,
      period: 'CCL',
      assetId: null,
    });

    repository.findActiveByType.mockResolvedValue([matching, nonMatching]);
    repository.save.mockImplementation(async (value) => value);

    const triggered = await engine.evaluateAlertsForDollar('MEP', 120);

    expect(triggered).toHaveLength(1);
    expect(triggered[0]?.period).toBe('MEP');
  });

  it('evaluates risk alerts from type filter', async () => {
    const riskAlert = buildAlert({
      alertType: AlertType.RISK,
      assetId: null,
      threshold: 500,
      condition: AlertCondition.ABOVE,
    });

    repository.findActiveByType.mockResolvedValue([riskAlert]);
    repository.save.mockImplementation(async (value) => value);

    const triggered = await engine.evaluateAlertsForRisk(650);

    expect(triggered).toHaveLength(1);
  });
});
