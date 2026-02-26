import { Controller, Post, Body, Get, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TemplateCompilerService } from '../../../../application/TemplateCompilerService';
import { TemplateRequest } from './request/TemplateRequest';
import { NotificationTemplateResponse } from '../responses/NotificationTemplateResponse';
import { TestCompileRequest } from './request/TestCompileRequest';
import { TemplateListQueryRequest } from './request/TemplateListQueryRequest';
import { PaginatedTemplateResponse } from '../responses/PaginatedTemplateResponse';

@ApiTags('Templates')
@Controller('templates')
export class TemplateController {
    constructor(private readonly templateService: TemplateCompilerService) { }

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
        const paginated = await this.templateService.listTemplates(query.toPagination());
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
                body: { type: 'string', example: 'Precio actual 8100 por encima de 8000' },
            },
        },
    })
    @ApiResponse({ status: 400, description: 'Invalid payload' })
    @HttpCode(HttpStatus.OK)
    async testCompile(
        @Body() payload: TestCompileRequest,
    ) {
        return this.templateService.compileTemplate(payload.eventType, payload.context);
    }

    @Post()
    @ApiOperation({ summary: 'Create or update a notification template' })
    @ApiResponse({
        status: 201,
        description: 'Template saved successfully',
        type: NotificationTemplateResponse,
    })
    async createOrUpdateTemplate(@Body() payload: TemplateRequest): Promise<NotificationTemplateResponse> {
        const template = payload.toEntity();
        const saved = await this.templateService.saveTemplate(template);
        return NotificationTemplateResponse.fromEntity(saved);
    }
}
