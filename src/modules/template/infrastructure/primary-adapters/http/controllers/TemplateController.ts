import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TemplateCompilerService } from '../../../../application/TemplateCompilerService';
import { TemplateRequest } from './request/TemplateRequest';
import { NotificationTemplateResponse } from '../responses/NotificationTemplateResponse';

@ApiTags('templates')
@Controller('templates')
export class TemplateController {
    constructor(private readonly templateService: TemplateCompilerService) { }

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

    @Post('test-compile')
    @ApiOperation({ summary: 'Test template compilation with sample context' })
    @ApiResponse({
        status: 200,
        description: 'Template compiled successfully',
        schema: {
            properties: {
                subject: { type: 'string', example: 'Payment Successful' },
                body: { type: 'string', example: 'Thank you for your payment' },
            },
        },
    })
    async testCompile(
        @Body('eventType') eventType: string,
        @Body('context') context: Record<string, unknown>,
    ) {
        return this.templateService.compileTemplate(eventType, context);
    }
}
