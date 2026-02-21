import { Controller, Post, Body } from '@nestjs/common';
import { TemplateCompilerService } from '../../../../application/TemplateCompilerService';
import { TemplateRequest } from './request/TemplateRequest';
import { NotificationTemplate } from '../../../../domain/entities/NotificationTemplate';

@Controller('templates')
export class TemplateController {
    constructor(private readonly templateService: TemplateCompilerService) { }

    @Post()
    async createOrUpdateTemplate(@Body() payload: TemplateRequest) {
        const template = new NotificationTemplate(
            payload.name,
            payload.eventType,
            payload.subjectTemplate,
            payload.bodyTemplate,
        );
        return this.templateService.saveTemplate(template);
    }

    @Post('test-compile')
    async testCompile(
        @Body('eventType') eventType: string,
        @Body('context') context: Record<string, unknown>,
    ) {
        return this.templateService.compileTemplate(eventType, context);
    }
}
