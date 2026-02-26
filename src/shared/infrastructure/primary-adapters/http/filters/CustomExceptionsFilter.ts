import { Catch, ExceptionFilter, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';

interface ErrorResponse {
    code: string;
    message: string;
    errors?: unknown;
}

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
        let body: ErrorResponse = { code: 'INTERNAL_ERROR', message: 'Internal server error' };

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exResponse = exception.getResponse();

            if (typeof exResponse === 'object' && exResponse !== null) {
                // Class validator format
                const exResponseObj = exResponse as Record<string, unknown>;
                if ('message' in exResponseObj && Array.isArray(exResponseObj['message'])) {
                    body = {
                        code: 'VALIDATION_ERROR',
                        message: 'Input validation failed',
                        errors: exResponseObj['message']
                    };
                } else if (typeof exResponseObj === 'object' && 'code' in exResponseObj && 'message' in exResponseObj) {
                    body = {
                        code: String(exResponseObj['code']),
                        message: String(exResponseObj['message']),
                        errors: exResponseObj['errors'],
                    };
                } else {
                    body = { code: 'HTTP_ERROR', message: String(exResponseObj) };
                }
            } else {
                body = { code: 'HTTP_ERROR', message: exception.message };
            }
        } else if (exception instanceof Error) {
            status = this.mapErrorToStatus(exception);
            body = { code: exception.name, message: exception.message };
        }

        this.logger.error(
            `[${status}] ${body.code} - ${body.message}`,
            exception instanceof Error ? exception.stack : exception
        );
        response.status(status).json(body);
    }

    private mapErrorToStatus(error: Error): number {
        const statusMap = new Map([
            ['InvalidCredentialsError', HttpStatus.UNAUTHORIZED],
            ['EmailAlreadyExistsError', HttpStatus.CONFLICT],
            ['PreferencesNotFoundError', HttpStatus.NOT_FOUND],
            ['TemplateNotFoundError', HttpStatus.NOT_FOUND],
            ['AssetNotFoundError', HttpStatus.NOT_FOUND],
            ['AlertNotFoundError', HttpStatus.NOT_FOUND],
            ['AlertLimitExceededError', HttpStatus.CONFLICT],
            ['PortfolioNotFoundError', HttpStatus.NOT_FOUND],
            ['InsufficientHoldingsError', HttpStatus.CONFLICT],
            ['EntityNotFound', HttpStatus.NOT_FOUND],
            ['ValidationError', HttpStatus.BAD_REQUEST],
            ['InvalidStateTransitionError', HttpStatus.CONFLICT],
            ['AuditPointLockedError', HttpStatus.CONFLICT],
        ]);
        return statusMap.get(error.name) || HttpStatus.INTERNAL_SERVER_ERROR;
    }
}
