import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ITemplateRepository } from '../../../../application/ITemplateRepository';
import { NotificationTemplate } from '../../../../domain/entities/NotificationTemplate';
import { NotificationTemplateEntity } from '../entities/NotificationTemplateEntity';
import { NotificationTemplateMapper } from '../maps/NotificationTemplateMapper';

@Injectable()
export class TemplateRepository implements ITemplateRepository {
    constructor(
        @InjectRepository(NotificationTemplateEntity)
        private readonly repo: Repository<NotificationTemplateEntity>,
    ) { }

    async findByEventType(eventType: string): Promise<NotificationTemplate | null> {
        const entity = await this.repo.findOne({ where: { eventType } });
        if (!entity) return null;

        return NotificationTemplateMapper.toDomain(entity);
    }

    async save(template: NotificationTemplate): Promise<NotificationTemplate> {
        let entity = await this.repo.findOne({ where: { eventType: template.eventType } });

        const persistenceData = NotificationTemplateMapper.toPersistence(template);

        if (!entity) {
            entity = this.repo.create(persistenceData);
        } else {
            entity.name = persistenceData.name;
            entity.subjectTemplate = persistenceData.subjectTemplate;
            entity.bodyTemplate = persistenceData.bodyTemplate;
        }

        const saved = await this.repo.save(entity);
        return NotificationTemplateMapper.toDomain(saved);
    }
}
