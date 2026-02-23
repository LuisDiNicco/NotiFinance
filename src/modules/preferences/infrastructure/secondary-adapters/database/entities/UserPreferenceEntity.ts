import { Entity, Column } from 'typeorm';
import { NotificationChannel } from '../../../../domain/enums/NotificationChannel';
import { BaseEntity } from '../../../../../../shared/infrastructure/base/database/BaseEntity';

@Entity('user_preferences')
export class UserPreferenceEntity extends BaseEntity {
    @Column({ type: 'varchar', length: 255, unique: true })
    userId!: string;

    @Column({ type: 'jsonb', default: [] })
    optInChannels!: NotificationChannel[];

    @Column({ type: 'jsonb', default: [] })
    disabledEventTypes!: string[];
}
