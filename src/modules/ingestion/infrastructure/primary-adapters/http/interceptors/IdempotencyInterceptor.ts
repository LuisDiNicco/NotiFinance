import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RedisService } from '../../../../../../shared/infrastructure/base/redis/redis.service';

type IdempotencyRequest = {
  body?: {
    eventId?: string;
  };
};

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  private readonly logger = new Logger(IdempotencyInterceptor.name);
  private readonly TTL_SECONDS = 60 * 60 * 24; // 24 hours

  constructor(private readonly redisService: RedisService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<IdempotencyRequest>();
    const eventId = request.body?.eventId;

    if (!eventId) {
      return next.handle();
    }

    const cacheKey = `idempotency:event:${eventId}`;
    const isNew = await this.redisService.setNx(
      cacheKey,
      'PROCESSING',
      this.TTL_SECONDS,
    );

    if (!isNew) {
      this.logger.log(
        `Duplicate event detected via idempotency key: ${eventId}. Skipping processing.`,
      );
      httpContext.getResponse<{ status(code: number): unknown }>().status(200);
      return of({
        message: 'Event already processed or processing',
        eventId,
      });
    }

    return next.handle().pipe(
      tap({
        error: (err: unknown) => {
          void this.redisService
            .delete(cacheKey)
            .catch((deleteError: unknown) => {
              this.logger.error(
                `Failed to release idempotency key after error for eventId ${eventId}`,
                deleteError,
              );
            });

          const statusCode =
            typeof (err as { status?: unknown })?.status === 'number'
              ? (err as { status: number }).status
              : 500;

          if (statusCode >= 500) {
            this.logger.error(
              `Error during intercepted request for eventId ${eventId}`,
              err,
            );
            return;
          }

          this.logger.warn(
            `Request failed (${statusCode}) for eventId ${eventId}. Idempotency key released for retry.`,
          );
        },
      }),
    );
  }
}
