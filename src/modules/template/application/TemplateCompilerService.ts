import { Inject, Injectable } from '@nestjs/common';
import type { ITemplateRepository } from './ITemplateRepository';
import { TEMPLATE_REPO } from './ITemplateRepository';
import { PaginatedRequest, PaginatedResponse } from './ITemplateRepository';
import { NotificationTemplate } from '../domain/entities/NotificationTemplate';
import { TemplateNotFoundError } from '../domain/errors/TemplateNotFoundError';

export interface CompiledTemplate {
  subject: string;
  body: string;
}

@Injectable()
export class TemplateCompilerService {
  constructor(
    @Inject(TEMPLATE_REPO) private readonly repo: ITemplateRepository,
  ) {}

  public async compileTemplate(
    eventType: string,
    context: Record<string, unknown>,
  ): Promise<CompiledTemplate> {
    const template = await this.repo.findByEventType(eventType);

    if (!template) {
      throw new TemplateNotFoundError(eventType);
    }

    return {
      subject: this.render(template.subjectTemplate, context),
      body: this.render(template.bodyTemplate, context),
    };
  }

  public async saveTemplate(
    template: NotificationTemplate,
  ): Promise<NotificationTemplate> {
    return this.repo.save(template);
  }

  public async listTemplates(
    request: PaginatedRequest,
  ): Promise<PaginatedResponse<NotificationTemplate>> {
    return this.repo.findPaginated(request);
  }

  private render(tpl: string, data: Record<string, unknown>): string {
    return tpl.replace(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g, (_, key: string) => {
      const value = key.split('.').reduce((o: unknown, i: string): unknown => {
        if (o !== null && o !== undefined && typeof o === 'object') {
          return (o as Record<string, unknown>)[i];
        }
        return undefined;
      }, data);

      if (value == null) {
        return '';
      }

      if (
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean' ||
        typeof value === 'bigint'
      ) {
        return String(value);
      }

      if (value instanceof Date) {
        return value.toISOString();
      }

      return '';
    });
  }
}
