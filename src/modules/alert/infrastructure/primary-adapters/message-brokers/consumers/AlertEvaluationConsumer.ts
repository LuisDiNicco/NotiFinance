import { Controller, Inject, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { randomUUID } from 'node:crypto';
import { AlertEvaluationEngine } from '../../../../application/AlertEvaluationEngine';
import { EVENT_PUBLISHER, type IEventPublisher } from '../../../../../ingestion/application/IEventPublisher';
import { EventPayload } from '../../../../../ingestion/domain/EventPayload';
import { EventType } from '../../../../../ingestion/domain/enums/EventType';

interface RabbitMQMessage {
    payload: EventPayload;
    options?: {
        headers?: Record<string, unknown>;
    };
}

@Controller()
export class AlertEvaluationConsumer {
    private readonly logger = new Logger(AlertEvaluationConsumer.name);

    constructor(
        private readonly evaluationEngine: AlertEvaluationEngine,
        @Inject(EVENT_PUBLISHER)
        private readonly eventPublisher: IEventPublisher,
    ) { }

    @EventPattern('notification.market.quote.updated')
    public async onQuoteUpdated(
        @Payload() message: RabbitMQMessage,
        @Ctx() context: RmqContext,
    ): Promise<void> {
        await this.evaluateAndPublish('QUOTE', message, context);
    }

    @EventPattern('notification.market.dollar.updated')
    public async onDollarUpdated(
        @Payload() message: RabbitMQMessage,
        @Ctx() context: RmqContext,
    ): Promise<void> {
        await this.evaluateAndPublish('DOLLAR', message, context);
    }

    @EventPattern('notification.market.risk.updated')
    public async onRiskUpdated(
        @Payload() message: RabbitMQMessage,
        @Ctx() context: RmqContext,
    ): Promise<void> {
        await this.evaluateAndPublish('RISK', message, context);
    }

    private async evaluateAndPublish(
        source: 'QUOTE' | 'DOLLAR' | 'RISK',
        message: RabbitMQMessage,
        context: RmqContext,
    ): Promise<void> {
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();
        const correlationId = (message.options?.headers?.['x-correlation-id'] as string) || 'amqp-missing-id';
        const metadata = message.payload?.metadata ?? {};

        try {
            let triggered = [] as Awaited<ReturnType<AlertEvaluationEngine['evaluateAlertsForRisk']>>;

            if (source === 'QUOTE') {
                const assetId = metadata['assetId'];
                const closePrice = metadata['closePrice'];
                if (typeof assetId === 'string' && typeof closePrice === 'number') {
                    triggered = await this.evaluationEngine.evaluateAlertsForAsset(assetId, closePrice);
                }
            }

            if (source === 'DOLLAR') {
                const currentPrice = metadata['currentPrice'];
                const dollarType = metadata['dollarType'];
                if (typeof currentPrice === 'number') {
                    triggered = await this.evaluationEngine.evaluateAlertsForDollar(
                        typeof dollarType === 'string' ? dollarType : 'ANY',
                        currentPrice,
                    );
                }
            }

            if (source === 'RISK') {
                const value = metadata['value'];
                if (typeof value === 'number') {
                    triggered = await this.evaluationEngine.evaluateAlertsForRisk(value);
                }
            }

            for (const alert of triggered) {
                const event = new EventPayload(
                    randomUUID(),
                    EventType.ALERT_TRIGGERED,
                    alert.userId,
                    {
                        alertId: alert.id,
                        userId: alert.userId,
                        assetId: alert.assetId,
                        alertType: alert.alertType,
                        condition: alert.condition,
                        threshold: alert.threshold,
                        source,
                        sourceMetadata: metadata,
                    },
                );

                await this.eventPublisher.publishEvent(event, correlationId);
            }

            channel.ack(originalMsg);
        } catch (error) {
            this.logger.error(`[Trace: ${correlationId}] Alert evaluation failed`, error);
            channel.ack(originalMsg);
        }
    }
}
