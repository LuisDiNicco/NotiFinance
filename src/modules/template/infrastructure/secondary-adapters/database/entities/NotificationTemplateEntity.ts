import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../../../../shared/infrastructure/base/database/BaseEntity';

@Entity('notification_templates')
export class NotificationTemplateEntity extends BaseEntity {
    @Column({ type: 'varchar', length: 150 })
    name!: string;

    @Column({ type: 'varchar', length: 100, unique: true })
    eventType!: string;

    @Column({ type: 'text' })
    subjectTemplate!: string;

    @Column({ type: 'text' })
    bodyTemplate!: string;
}
