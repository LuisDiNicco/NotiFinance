import { Test, TestingModule } from '@nestjs/testing';
import { AlertEvaluationEngine } from '../../../../../src/modules/alert/application/AlertEvaluationEngine';
import { ALERT_REPOSITORY, IAlertRepository } from '../../../../../src/modules/alert/application/IAlertRepository';
import { Alert } from '../../../../../src/modules/alert/domain/entities/Alert';
import { AlertCondition } from '../../../../../src/modules/alert/domain/enums/AlertCondition';
import { AlertType } from '../../../../../src/modules/alert/domain/enums/AlertType';
import { NotificationChannel } from '../../../../../src/modules/preferences/domain/enums/NotificationChannel';

describe('AlertEvaluationEngine', () => {
    let engine: AlertEvaluationEngine;
    let repository: jest.Mocked<IAlertRepository>;

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
        const alert = new Alert({
            userId: 'user-1',
            assetId: 'asset-1',
            alertType: AlertType.PRICE,
            condition: AlertCondition.ABOVE,
            threshold: 100,
            channels: [NotificationChannel.IN_APP],
            isRecurring: true,
        });

        repository.findActiveByAssetId.mockResolvedValue([alert]);
        repository.save.mockImplementation(async (value) => value);

        const triggered = await engine.evaluateAlertsForAsset('asset-1', 110);

        expect(triggered).toHaveLength(1);
        expect(repository.save).toHaveBeenCalledTimes(1);
    });
});
