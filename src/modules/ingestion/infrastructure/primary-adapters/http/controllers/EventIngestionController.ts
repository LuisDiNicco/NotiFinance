import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseInterceptors,
  Logger,
} from '@nestjs/common';
import type { Request } from 'express';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EventPayloadRequest } from './request/EventPayloadRequest';
import { EventIngestionService } from '../../../../application/EventIngestionService';
import { IdempotencyInterceptor } from '../interceptors/IdempotencyInterceptor';

@ApiTags('Events')
@Controller('events')
export class EventIngestionController {
  private readonly logger = new Logger(EventIngestionController.name);

  constructor(private readonly ingestionService: EventIngestionService) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  @UseInterceptors(IdempotencyInterceptor)
  @ApiOperation({
    summary:
      'Ingest a business event and publish it for asynchronous processing',
  })
  @ApiResponse({
    status: 202,
    description: 'Event accepted for processing',
    schema: {
      example: {
        message: 'Event accepted for processing',
        eventId: '550e8400-e29b-41d4-a716-446655440000',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid payload' })
  async ingestEvent(
    @Body() payload: EventPayloadRequest,
    @Req() request: Request,
  ): Promise<{ message: string; eventId: string }> {
    const correlationId =
      (request.headers['x-correlation-id'] as string) ||
      'missing-correlation-id';

    this.logger.log(
      `Received incoming event HTTP request with ID: ${payload.eventId}`,
    );

    const entity = payload.toEntity();
    await this.ingestionService.processEvent(entity, correlationId);

    return {
      message: 'Event accepted for processing',
      eventId: payload.eventId,
    };
  }
}
