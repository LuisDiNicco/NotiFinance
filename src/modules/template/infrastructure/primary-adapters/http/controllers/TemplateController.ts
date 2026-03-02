import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  HttpCode,
  HttpStatus,
  Headers,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { timingSafeEqual } from 'node:crypto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { TemplateCompilerService } from '../../../../application/TemplateCompilerService';
import { TemplateRequest } from './request/TemplateRequest';
import { NotificationTemplateResponse } from '../responses/NotificationTemplateResponse';
import { TestCompileRequest } from './request/TestCompileRequest';
import { TemplateListQueryRequest } from './request/TemplateListQueryRequest';
import { PaginatedTemplateResponse } from '../responses/PaginatedTemplateResponse';

@ApiTags('Templates')
@Controller('templates')
export class TemplateController {
  constructor(
    private readonly templateService: TemplateCompilerService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List templates using paginated response format' })
  @ApiResponse({
    status: 200,
    description: 'Templates retrieved successfully',
    type: PaginatedTemplateResponse,
  })
  async listTemplates(
    @Query() query: TemplateListQueryRequest,
  ): Promise<PaginatedTemplateResponse> {
    const paginated = await this.templateService.listTemplates(
      query.toPagination(),
    );
    return PaginatedTemplateResponse.fromPaginated(paginated);
  }

  @Post('test-compile')
  @ApiOperation({ summary: 'Test template compilation with sample context' })
  @ApiResponse({
    status: 200,
    description: 'Template compiled successfully',
    schema: {
      properties: {
        subject: { type: 'string', example: 'GGAL superó el umbral' },
        body: {
          type: 'string',
          example: 'Precio actual 8100 por encima de 8000',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid payload' })
  @ApiResponse({ status: 401, description: 'Invalid template admin API key' })
  @HttpCode(HttpStatus.OK)
  async testCompile(
    @Headers('x-template-admin-key') templateAdminKey: string | undefined,
    @Body() payload: TestCompileRequest,
  ) {
    this.assertTemplateAdminAccess(templateAdminKey);

    return this.templateService.compileTemplate(
      payload.eventType,
      payload.context,
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create or update a notification template' })
  @ApiResponse({
    status: 201,
    description: 'Template saved successfully',
    type: NotificationTemplateResponse,
  })
  @ApiResponse({ status: 401, description: 'Invalid template admin API key' })
  async createOrUpdateTemplate(
    @Headers('x-template-admin-key') templateAdminKey: string | undefined,
    @Body() payload: TemplateRequest,
  ): Promise<NotificationTemplateResponse> {
    this.assertTemplateAdminAccess(templateAdminKey);

    const template = payload.toEntity();
    const saved = await this.templateService.saveTemplate(template);
    return NotificationTemplateResponse.fromEntity(saved);
  }

  private assertTemplateAdminAccess(providedApiKey?: string): void {
    const expectedApiKey = this.configService
      .get<string>('TEMPLATE_ADMIN_API_KEY', '')
      .trim();

    if (!expectedApiKey) {
      throw new ServiceUnavailableException(
        'Template admin API key is not configured',
      );
    }

    const candidate = (providedApiKey ?? '').trim();
    if (!candidate) {
      throw new UnauthorizedException('Invalid template admin API key');
    }

    const expectedBuffer = Buffer.from(expectedApiKey);
    const candidateBuffer = Buffer.from(candidate);

    if (expectedBuffer.length !== candidateBuffer.length) {
      throw new UnauthorizedException('Invalid template admin API key');
    }

    if (!timingSafeEqual(expectedBuffer, candidateBuffer)) {
      throw new UnauthorizedException('Invalid template admin API key');
    }
  }
}
