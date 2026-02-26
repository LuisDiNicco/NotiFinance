import { Test, TestingModule } from '@nestjs/testing';
import { AlertService } from '../../../../../src/modules/alert/application/AlertService';
import { ALERT_REPOSITORY, IAlertRepository } from '../../../../../src/modules/alert/application/IAlertRepository';
import { Alert } from '../../../../../src/modules/alert/domain/entities/Alert';
import { AlertCondition } from '../../../../../src/modules/alert/domain/enums/AlertCondition';
import { AlertType } from '../../../../../src/modules/alert/domain/enums/AlertType';
import { NotificationChannel } from '../../../../../src/modules/preferences/domain/enums/NotificationChannel';
import { MarketDataService } from '../../../../../src/modules/market-data/application/MarketDataService';
import { AlertLimitExceededError } from '../../../../../src/modules/alert/domain/errors/AlertLimitExceededError';

describe('AlertService', () => {
    let service: AlertService;
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
                AlertService,
                {
                    provide: ALERT_REPOSITORY,
                    useValue: repository,
                },
                {
                    provide: MarketDataService,
                    useValue: {
                        getAssets: jest.fn().mockResolvedValue([]),
                    },
                },
            ],
        }).compile();

        service = module.get(AlertService);
    });

    it('creates alert when user is below active limit', async () => {
        repository.countActiveByUserId.mockResolvedValue(1);

        const alert = new Alert({
            userId: 'user-1',
            alertType: AlertType.PRICE,
            condition: AlertCondition.ABOVE,
            threshold: 100,
            channels: [NotificationChannel.IN_APP],
            isRecurring: true,
        });
        repository.save.mockResolvedValue(alert);

        const saved = await service.createAlert('user-1', alert);
        expect(saved).toBe(alert);
    });

    it('throws when active alert limit is reached', async () => {
        repository.countActiveByUserId.mockResolvedValue(20);

        const alert = new Alert({
            userId: 'user-1',
            alertType: AlertType.PRICE,
            condition: AlertCondition.ABOVE,
            threshold: 100,
            channels: [NotificationChannel.IN_APP],
            isRecurring: true,
        });

        await expect(service.createAlert('user-1', alert)).rejects.toThrow(AlertLimitExceededError);
    });
});
