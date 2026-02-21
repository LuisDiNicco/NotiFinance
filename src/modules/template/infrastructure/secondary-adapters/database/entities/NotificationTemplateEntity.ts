import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('notification_templates')
export class NotificationTemplateEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 150 })
    name!: string;

    @Column({ type: 'varchar', length: 100, unique: true })
    eventType!: string;

    @Column({ type: 'text' })
    subjectTemplate!: string;

    @Column({ type: 'text' })
    bodyTemplate!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
