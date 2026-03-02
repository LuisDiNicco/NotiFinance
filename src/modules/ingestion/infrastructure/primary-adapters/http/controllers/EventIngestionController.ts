import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
  UseInterceptors,
} from '@nestjs/common';
import { timingSafeEqual } from 'node:crypto';
import type { Request } from 'express';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { EventPayloadRequest } from './request/EventPayloadRequest';
import { EventIngestionService } from '../../../../application/EventIngestionService';
import { IdempotencyInterceptor } from '../interceptors/IdempotencyInterceptor';

@ApiTags('Events')
@Controller('events')
export class EventIngestionController {
  private readonly logger = new Logger(EventIngestionController.name);

  constructor(
    private readonly ingestionService: EventIngestionService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  @UseInterceptors(IdempotencyInterceptor)
  @HttpCode(HttpStatus.ACCEPTED)
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
    this.assertIngestionApiAccess(request);

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

  private assertIngestionApiAccess(request: Request): void {
    const ingestionApiKey = this.configService
      .get<string>('EVENTS_INGESTION_API_KEY', '')
      .trim();

    if (!ingestionApiKey) {
      throw new ServiceUnavailableException(
        'Ingestion API key is not configured',
      );
    }

    const headerValue = request.headers['x-ingestion-api-key'];
    const providedApiKey =
      typeof headerValue === 'string' ? headerValue.trim() : '';

    if (!providedApiKey) {
      throw new UnauthorizedException('Invalid ingestion API key');
    }

    const expectedBuffer = Buffer.from(ingestionApiKey);
    const providedBuffer = Buffer.from(providedApiKey);

    if (expectedBuffer.length !== providedBuffer.length) {
      throw new UnauthorizedException('Invalid ingestion API key');
    }

    if (!timingSafeEqual(expectedBuffer, providedBuffer)) {
      throw new UnauthorizedException('Invalid ingestion API key');
    }
  }
}
