import { Catch, ExceptionFilter, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class CustomExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(CustomExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        // Ensure process does not crash on RabbitMQ Nacks if this filter is used globally
        if (!response.status) {
            this.logger.error('Exception caught in non-HTTP context', exception);
            return;
        }

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let body: any = { code: 'INTERNAL_ERROR', message: 'Internal server error' };

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exResponse = exception.getResponse();

            if (typeof exResponse === 'object' && exResponse !== null) {
                // Class validator format
                if ('message' in exResponse && Array.isArray((exResponse as any).message)) {
                    body = {
                        code: 'VALIDATION_ERROR',
                        message: 'Input validation failed',
                        errors: (exResponse as any).message
                    };
                } else {
                    body = exResponse;
                }
            } else {
                body = { code: 'HTTP_ERROR', message: exception.message };
            }
        } else if (exception instanceof Error) {
            status = this.mapErrorToStatus(exception);
            body = { code: exception.name, message: exception.message };
        }

        this.logger.error(`[${status}] ${body.code} - ${body.message}`, exception instanceof Error ? exception.stack : exception);
        response.status(status).json(body);
    }

    private mapErrorToStatus(error: Error): number {
        const statusMap = new Map([
            ['EntityNotFound', HttpStatus.NOT_FOUND],
            ['ValidationError', HttpStatus.BAD_REQUEST],
            ['InvalidStateTransitionError', HttpStatus.CONFLICT],
            ['AuditPointLockedError', HttpStatus.CONFLICT],
        ]);
        return statusMap.get(error.name) || HttpStatus.INTERNAL_SERVER_ERROR;
    }
}
