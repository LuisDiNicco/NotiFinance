import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { NotificationChannel } from '../../../../domain/entities/UserPreference';

@Entity('user_preferences')
export class UserPreferenceEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 255, unique: true })
    userId!: string;

    @Column({ type: 'jsonb', default: [] })
    optInChannels!: NotificationChannel[];

    @Column({ type: 'jsonb', default: [] })
    disabledEventTypes!: string[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
