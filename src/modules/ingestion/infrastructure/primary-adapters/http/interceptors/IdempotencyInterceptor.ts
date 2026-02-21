import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
    Logger,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RedisService } from '../../../../../../shared/infrastructure/base/redis/redis.service';

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
    private readonly logger = new Logger(IdempotencyInterceptor.name);
    private readonly TTL_SECONDS = 60 * 60 * 24; // 24 hours

    constructor(private readonly redisService: RedisService) { }

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
        const request = context.switchToHttp().getRequest();
        const eventId = request.body?.eventId;

        if (!eventId) {
            // Let validation pipe catch the missing eventId later
            return next.handle();
        }

        const cacheKey = `idempotency:event:${eventId}`;
        const isNew = await this.redisService.setNx(cacheKey, 'PROCESSING', this.TTL_SECONDS);

        if (!isNew) {
            this.logger.log(`Duplicate event detected via idempotency key: ${eventId}. Skiping processing.`);
            // Return 200 OK immediately for duplicate webhook
            const response = context.switchToHttp().getResponse();
            response.status(200);
            return of({
                message: 'Event already processed or processing',
                eventId,
            });
        }

        return next.handle().pipe(
            tap({
                error: async (err) => {
                    // If something fails significantly before RabbitMQ, we could
                    // consider deleting the key so it can be retried.
                    // For now, let's keep it to strictly avoid duplicate firing
                    this.logger.error(`Error during intercepted request for eventId ${eventId}`, err);
                },
            }),
        );
    }
}
