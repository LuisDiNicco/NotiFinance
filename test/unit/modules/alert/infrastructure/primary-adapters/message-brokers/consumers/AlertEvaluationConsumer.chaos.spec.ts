import { RmqContext } from '@nestjs/microservices';
import { AlertEvaluationConsumer } from 'src/modules/alert/infrastructure/primary-adapters/message-brokers/consumers/AlertEvaluationConsumer';
import { AlertEvaluationEngine } from 'src/modules/alert/application/AlertEvaluationEngine';
import { IEventPublisher } from 'src/modules/ingestion/application/IEventPublisher';
import { EventPayload } from 'src/modules/ingestion/domain/EventPayload';
import { EventType } from 'src/modules/ingestion/domain/enums/EventType';
import { Alert } from 'src/modules/alert/domain/entities/Alert';
import { AlertCondition } from 'src/modules/alert/domain/enums/AlertCondition';
import { AlertType } from 'src/modules/alert/domain/enums/AlertType';
import { NotificationChannel } from 'src/modules/preferences/domain/enums/NotificationChannel';

interface RabbitMQMessage {
  payload: EventPayload;
  options?: {
    headers?: Record<string, unknown>;
  };
}

describe('AlertEvaluationConsumer chaos paths', () => {
  const buildContext = (withNack = true) => {
    const channel = {
      ack: jest.fn(),
      nack: withNack ? jest.fn() : undefined,
    };

    const context = {
      getChannelRef: () => channel,
      getMessage: () => ({
        fields: {},
        properties: {},
        content: Buffer.from(''),
      }),
    } as unknown as RmqContext;

    return { channel, context };
  };

  const buildAlert = () => {
    const alert = new Alert({
      userId: 'user-1',
      assetId: 'asset-ggal',
      alertType: AlertType.PRICE,
      condition: AlertCondition.ABOVE,
      threshold: 8000,
      channels: [NotificationChannel.IN_APP],
      isRecurring: true,
    });
    alert.id = 'alert-1';
    return alert;
  };

  const buildQuoteMessage = (): RabbitMQMessage => ({
    payload: new EventPayload(
      'event-1',
      EventType.MARKET_QUOTE_UPDATED,
      'market-system',
      {
        assetId: 'asset-ggal',
        closePrice: 8100,
      },
    ),
    options: {
      headers: {
        'x-correlation-id': 'corr-chaos-1',
      },
    },
  });

  it('acks message on successful publish', async () => {
    const evaluationEngine = {
      evaluateAlertsForAsset: jest.fn().mockResolvedValue([buildAlert()]),
      evaluateAlertsForDollar: jest.fn(),
      evaluateAlertsForRisk: jest.fn(),
    } as unknown as AlertEvaluationEngine;

    const eventPublisher: IEventPublisher = {
      publishEvent: jest.fn().mockResolvedValue(undefined),
    };

    const consumer = new AlertEvaluationConsumer(
      evaluationEngine,
      eventPublisher,
    );
    const { channel, context } = buildContext();

    await consumer.onQuoteUpdated(buildQuoteMessage(), context);

    expect(channel.ack).toHaveBeenCalledTimes(1);
    expect(channel.nack).not.toHaveBeenCalled();
  });

  it('nacks message when publish fails and nack is available', async () => {
    const evaluationEngine = {
      evaluateAlertsForAsset: jest.fn().mockResolvedValue([buildAlert()]),
      evaluateAlertsForDollar: jest.fn(),
      evaluateAlertsForRisk: jest.fn(),
    } as unknown as AlertEvaluationEngine;

    const eventPublisher: IEventPublisher = {
      publishEvent: jest.fn().mockRejectedValue(new Error('broker down')),
    };

    const consumer = new AlertEvaluationConsumer(
      evaluationEngine,
      eventPublisher,
    );
    const { channel, context } = buildContext(true);

    await consumer.onQuoteUpdated(buildQuoteMessage(), context);

    expect(channel.nack).toHaveBeenCalledTimes(1);
    expect(channel.ack).not.toHaveBeenCalled();
  });

  it('falls back to ack when publish fails and nack is unavailable', async () => {
    const evaluationEngine = {
      evaluateAlertsForAsset: jest.fn().mockResolvedValue([buildAlert()]),
      evaluateAlertsForDollar: jest.fn(),
      evaluateAlertsForRisk: jest.fn(),
    } as unknown as AlertEvaluationEngine;

    const eventPublisher: IEventPublisher = {
      publishEvent: jest.fn().mockRejectedValue(new Error('broker down')),
    };

    const consumer = new AlertEvaluationConsumer(
      evaluationEngine,
      eventPublisher,
    );
    const { channel, context } = buildContext(false);

    await consumer.onQuoteUpdated(buildQuoteMessage(), context);

    expect(channel.ack).toHaveBeenCalledTimes(1);
  });
});
