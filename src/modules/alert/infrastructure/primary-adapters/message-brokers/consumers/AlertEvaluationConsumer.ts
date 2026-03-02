import { Controller, Inject, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { randomUUID } from 'node:crypto';
import { AlertEvaluationEngine } from '../../../../application/AlertEvaluationEngine';
import {
  EVENT_PUBLISHER,
  type IEventPublisher,
} from '../../../../../ingestion/application/IEventPublisher';
import { EventPayload } from '../../../../../ingestion/domain/EventPayload';
import { EventType } from '../../../../../ingestion/domain/enums/EventType';
import { Alert } from '../../../../domain/entities/Alert';
import { AlertCondition } from '../../../../domain/enums/AlertCondition';
import { AlertType } from '../../../../domain/enums/AlertType';

interface RabbitMQMessage {
  payload: EventPayload;
  options?: {
    headers?: Record<string, unknown>;
  };
}

interface RmqChannelRef {
  ack(message: unknown): void;
  nack?(message: unknown, allUpTo?: boolean, requeue?: boolean): void;
}

@Controller()
export class AlertEvaluationConsumer {
  private readonly logger = new Logger(AlertEvaluationConsumer.name);

  constructor(
    private readonly evaluationEngine: AlertEvaluationEngine,
    @Inject(EVENT_PUBLISHER)
    private readonly eventPublisher: IEventPublisher,
  ) {}

  @EventPattern('market.quote.updated')
  public async onQuoteUpdated(
    @Payload() message: RabbitMQMessage,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    await this.evaluateAndPublish('QUOTE', message, context);
  }

  @EventPattern('market.dollar.updated')
  public async onDollarUpdated(
    @Payload() message: RabbitMQMessage,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    await this.evaluateAndPublish('DOLLAR', message, context);
  }

  @EventPattern('market.risk.updated')
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
    const startedAt = Date.now();
    const channel = context.getChannelRef() as RmqChannelRef;
    const originalMsg = context.getMessage() as unknown;
    const correlationId =
      (message.options?.headers?.['x-correlation-id'] as string) ||
      'amqp-missing-id';
    const metadata = message.payload?.metadata ?? {};

    try {
      let evaluatedCount = 0;
      let triggered = [] as Awaited<
        ReturnType<AlertEvaluationEngine['evaluateAlertsForRisk']>
      >;

      if (source === 'QUOTE') {
        const assetId = metadata['assetId'];
        const closePrice = metadata['closePrice'];
        if (typeof assetId === 'string' && typeof closePrice === 'number') {
          const result = await this.evaluateAssetAlertsWithStats(
            assetId,
            closePrice,
          );
          triggered = result.triggeredAlerts;
          evaluatedCount = result.evaluatedCount;
        }
      }

      if (source === 'DOLLAR') {
        const currentPrice = metadata['currentPrice'];
        const dollarType = metadata['dollarType'];
        if (typeof currentPrice === 'number') {
          const result = await this.evaluateDollarAlertsWithStats(
            typeof dollarType === 'string' ? dollarType : 'ANY',
            currentPrice,
          );
          triggered = result.triggeredAlerts;
          evaluatedCount = result.evaluatedCount;
        }
      }

      if (source === 'RISK') {
        const value = metadata['value'];
        if (typeof value === 'number') {
          const result = await this.evaluateRiskAlertsWithStats(value);
          triggered = result.triggeredAlerts;
          evaluatedCount = result.evaluatedCount;
        }
      }

      let publishedCount = 0;

      for (const alert of triggered) {
        const alertEventType = this.resolveAlertEventType(
          alert.alertType,
          alert.condition,
        );
        if (!alertEventType) {
          this.logger.warn(
            `[Trace: ${correlationId}] Unsupported alert mapping for type=${alert.alertType} condition=${alert.condition}`,
          );
          continue;
        }

        const currentValue =
          source === 'QUOTE'
            ? metadata['closePrice']
            : source === 'DOLLAR'
              ? metadata['currentPrice']
              : metadata['value'];

        const event = new EventPayload(
          randomUUID(),
          alertEventType,
          alert.userId,
          {
            alertId: alert.id,
            userId: alert.userId,
            assetId: alert.assetId,
            alertType: alert.alertType,
            condition: alert.condition,
            threshold: alert.threshold,
            currentValue,
            source,
            sourceMetadata: metadata,
          },
        );

        await this.eventPublisher.publishEvent(event, correlationId);
        publishedCount += 1;
      }

      const durationMs = Date.now() - startedAt;
      this.logger.log(
        `[Trace: ${correlationId}] Alert evaluation cycle completed (source=${source}, evaluated=${evaluatedCount}, triggered=${triggered.length}, published=${publishedCount}, durationMs=${durationMs})`,
      );

      channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(
        `[Trace: ${correlationId}] Alert evaluation failed after ${Date.now() - startedAt}ms`,
        error,
      );

      if (typeof channel.nack === 'function') {
        channel.nack(originalMsg, false, false);
        return;
      }

      channel.ack(originalMsg);
    }
  }

  private async evaluateAssetAlertsWithStats(
    assetId: string,
    currentPrice: number,
  ): Promise<{ evaluatedCount: number; triggeredAlerts: Alert[] }> {
    const engine = this.evaluationEngine as AlertEvaluationEngine & {
      evaluateAlertsForAssetWithStats?: (
        localAssetId: string,
        localCurrentPrice: number,
      ) => Promise<{ evaluatedCount: number; triggeredAlerts: Alert[] }>;
    };

    if (typeof engine.evaluateAlertsForAssetWithStats === 'function') {
      return engine.evaluateAlertsForAssetWithStats(assetId, currentPrice);
    }

    const triggeredAlerts = await this.evaluationEngine.evaluateAlertsForAsset(
      assetId,
      currentPrice,
    );

    return {
      evaluatedCount: triggeredAlerts.length,
      triggeredAlerts,
    };
  }

  private async evaluateDollarAlertsWithStats(
    dollarType: string,
    currentPrice: number,
  ): Promise<{ evaluatedCount: number; triggeredAlerts: Alert[] }> {
    const engine = this.evaluationEngine as AlertEvaluationEngine & {
      evaluateAlertsForDollarWithStats?: (
        localDollarType: string,
        localCurrentPrice: number,
      ) => Promise<{ evaluatedCount: number; triggeredAlerts: Alert[] }>;
    };

    if (typeof engine.evaluateAlertsForDollarWithStats === 'function') {
      return engine.evaluateAlertsForDollarWithStats(dollarType, currentPrice);
    }

    const triggeredAlerts = await this.evaluationEngine.evaluateAlertsForDollar(
      dollarType,
      currentPrice,
    );

    return {
      evaluatedCount: triggeredAlerts.length,
      triggeredAlerts,
    };
  }

  private async evaluateRiskAlertsWithStats(
    currentValue: number,
  ): Promise<{ evaluatedCount: number; triggeredAlerts: Alert[] }> {
    const engine = this.evaluationEngine as AlertEvaluationEngine & {
      evaluateAlertsForRiskWithStats?: (
        localCurrentValue: number,
      ) => Promise<{ evaluatedCount: number; triggeredAlerts: Alert[] }>;
    };

    if (typeof engine.evaluateAlertsForRiskWithStats === 'function') {
      return engine.evaluateAlertsForRiskWithStats(currentValue);
    }

    const triggeredAlerts =
      await this.evaluationEngine.evaluateAlertsForRisk(currentValue);

    return {
      evaluatedCount: triggeredAlerts.length,
      triggeredAlerts,
    };
  }

  private resolveAlertEventType(
    alertType: AlertType,
    condition: AlertCondition,
  ): EventType | null {
    if (alertType === AlertType.PRICE) {
      if (condition === AlertCondition.BELOW) {
        return EventType.ALERT_PRICE_BELOW;
      }

      if (condition === AlertCondition.PCT_UP) {
        return EventType.ALERT_PCT_UP;
      }

      if (condition === AlertCondition.PCT_DOWN) {
        return EventType.ALERT_PCT_DOWN;
      }

      return EventType.ALERT_PRICE_ABOVE;
    }

    if (alertType === AlertType.DOLLAR) {
      if (condition === AlertCondition.BELOW) {
        return EventType.ALERT_DOLLAR_BELOW;
      }

      return EventType.ALERT_DOLLAR_ABOVE;
    }

    if (alertType === AlertType.RISK) {
      if (condition === AlertCondition.BELOW) {
        return EventType.ALERT_RISK_BELOW;
      }

      return EventType.ALERT_RISK_ABOVE;
    }

    if (condition === AlertCondition.PCT_UP) {
      return EventType.ALERT_PCT_UP;
    }

    if (condition === AlertCondition.PCT_DOWN) {
      return EventType.ALERT_PCT_DOWN;
    }

    return null;
  }
}
