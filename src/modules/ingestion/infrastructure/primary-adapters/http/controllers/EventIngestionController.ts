import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseInterceptors, Logger } from '@nestjs/common';
import type { Request } from 'express';
import { EventPayloadRequest } from './request/EventPayloadRequest';
import { EventIngestionService } from '../../../../application/EventIngestionService';
import { IdempotencyInterceptor } from '../interceptors/IdempotencyInterceptor';

@Controller('events')
export class EventIngestionController {
    private readonly logger = new Logger(EventIngestionController.name);

    constructor(private readonly ingestionService: EventIngestionService) { }

    @Post()
    @HttpCode(HttpStatus.ACCEPTED)
    @UseInterceptors(IdempotencyInterceptor)
    async ingestEvent(
        @Body() payload: EventPayloadRequest,
        @Req() request: Request,
    ): Promise<{ message: string; eventId: string }> {
        const correlationId = (request.headers['x-correlation-id'] as string) || 'missing-correlation-id';

        this.logger.log(`Received incoming event HTTP request with ID: ${payload.eventId}`);

        const entity = payload.toEntity();
        await this.ingestionService.processEvent(entity, correlationId);

        return {
            message: 'Event accepted for processing',
            eventId: payload.eventId,
        };
    }
}
