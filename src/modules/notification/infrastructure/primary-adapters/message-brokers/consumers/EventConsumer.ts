import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { DispatcherService } from '../../../../application/services/DispatcherService';
import { EventPayload } from '../../../../../ingestion/domain/EventPayload';

interface RabbitMQMessage {
  payload: EventPayload;
  options?: {
    headers?: Record<string, unknown>;
  };
}

interface RmqChannelRef {
  ack(message: unknown): void;
  nack(message: unknown, allUpTo?: boolean, requeue?: boolean): void;
}

@Controller()
export class EventConsumer {
  private readonly logger = new Logger(EventConsumer.name);

  constructor(private readonly dispatcherService: DispatcherService) {}

  @EventPattern('alert.#')
  async handleIncomingEvent(
    @Payload() message: RabbitMQMessage,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    const channel = context.getChannelRef() as RmqChannelRef;
    const originalMsg = context.getMessage() as unknown;
    const correlationId =
      (message.options?.headers?.['x-correlation-id'] as string) ||
      'amqp-missing-id';
    const payload: EventPayload = message.payload;

    this.logger.log(
      `[Trace: ${correlationId}] Consuming RabbitMQ message for Event: ${payload?.eventId}`,
    );

    try {
      await this.dispatcherService.dispatchEvent(payload, correlationId);

      this.logger.log(
        `[Trace: ${correlationId}] Acknowledging task completion (Ack)`,
      );
      channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(
        `[Trace: ${correlationId}] Technical/Logical failure whilst dispatching event.`,
        error,
      );

      if (error instanceof Error && error.name === 'PreferencesNotFoundError') {
        this.logger.warn(
          `[Trace: ${correlationId}] Dropping message permanently due to Business Error: ${error.message}`,
        );
        channel.ack(originalMsg);
      } else {
        this.logger.warn(
          `[Trace: ${correlationId}] Unexpected error. Sending message to DLQ via Nack.`,
        );
        channel.nack(originalMsg, false, false);
      }
    }
  }
}
