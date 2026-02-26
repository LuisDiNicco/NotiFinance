import { Test, TestingModule } from '@nestjs/testing';
import { EventIngestionService } from '../../../../../src/modules/ingestion/application/EventIngestionService';
import {
    EVENT_PUBLISHER,
    IEventPublisher,
} from '../../../../../src/modules/ingestion/application/IEventPublisher';
import { EventPayload } from '../../../../../src/modules/ingestion/domain/EventPayload';
import { EventType } from '../../../../../src/modules/ingestion/domain/enums/EventType';

describe('EventIngestionService', () => {
    let service: EventIngestionService;
    let publisher: jest.Mocked<IEventPublisher>;

    beforeEach(async () => {
        publisher = {
            publishEvent: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EventIngestionService,
                {
                    provide: EVENT_PUBLISHER,
                    useValue: publisher,
                },
            ],
        }).compile();

        service = module.get<EventIngestionService>(EventIngestionService);
    });

    it('publishes incoming event with correlation id', async () => {
        const event = new EventPayload('ev-100', EventType.PAYMENT_SUCCESS, 'user-1', {
            amount: 100,
        });

        await service.processEvent(event, 'corr-100');

        expect(publisher.publishEvent).toHaveBeenCalledWith(event, 'corr-100');
    });

    it('propagates publisher errors', async () => {
        const event = new EventPayload('ev-101', EventType.PAYMENT_SUCCESS, 'user-1', {});
        publisher.publishEvent.mockRejectedValue(new Error('broker unavailable'));

        await expect(service.processEvent(event, 'corr-101')).rejects.toThrow(
            'broker unavailable',
        );
    });
});
