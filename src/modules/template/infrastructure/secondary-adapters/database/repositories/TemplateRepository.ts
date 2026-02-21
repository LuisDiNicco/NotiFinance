import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ITemplateRepository } from '../../../../application/ITemplateRepository';
import { NotificationTemplate } from '../../../../domain/entities/NotificationTemplate';
import { NotificationTemplateEntity } from '../entities/NotificationTemplateEntity';

@Injectable()
export class TemplateRepository implements ITemplateRepository {
    constructor(
        @InjectRepository(NotificationTemplateEntity)
        private readonly repo: Repository<NotificationTemplateEntity>,
    ) { }

    async findByEventType(eventType: string): Promise<NotificationTemplate | null> {
        const entity = await this.repo.findOne({ where: { eventType } });
        if (!entity) return null;

        const domain = new NotificationTemplate(
            entity.name,
            entity.eventType,
            entity.subjectTemplate,
            entity.bodyTemplate,
        );
        domain.id = entity.id;
        return domain;
    }

    async save(template: NotificationTemplate): Promise<NotificationTemplate> {
        let entity = await this.repo.findOne({ where: { eventType: template.eventType } });

        if (!entity) {
            entity = this.repo.create({
                name: template.name,
                eventType: template.eventType,
                subjectTemplate: template.subjectTemplate,
                bodyTemplate: template.bodyTemplate,
            });
        } else {
            entity.name = template.name;
            entity.subjectTemplate = template.subjectTemplate;
            entity.bodyTemplate = template.bodyTemplate;
        }

        const saved = await this.repo.save(entity);
        const domain = new NotificationTemplate(saved.name, saved.eventType, saved.subjectTemplate, saved.bodyTemplate);
        domain.id = saved.id;
        return domain;
    }
}
