import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import type { Request, Response } from 'express';

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RequestLoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const method = request.method;
    const url = request.originalUrl || request.url;
    const correlationId =
      (request.headers['x-correlation-id'] as string | undefined) ||
      'missing-correlation-id';
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - start;
          this.logger.log(
            `[Trace: ${correlationId}] ${method} ${url} -> ${response.statusCode} (${duration}ms)`,
          );
        },
        error: (error) => {
          const duration = Date.now() - start;
          const statusCode =
            typeof (error as { status?: unknown })?.status === 'number'
              ? (error as { status: number }).status
              : 500;

          this.logger.error(
            `[Trace: ${correlationId}] ${method} ${url} -> ${statusCode} (${duration}ms)`,
          );
        },
      }),
    );
  }
}
