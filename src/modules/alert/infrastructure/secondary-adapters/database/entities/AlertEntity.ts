import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../../../../shared/infrastructure/base/database/BaseEntity';
import { AlertCondition } from '../../../../domain/enums/AlertCondition';
import { AlertStatus } from '../../../../domain/enums/AlertStatus';
import { AlertType } from '../../../../domain/enums/AlertType';

@Entity('alerts')
@Index('IDX_alerts_user_status', ['userId', 'status'])
@Index('IDX_alerts_asset_status', ['assetId', 'status'])
@Index('IDX_alerts_type_status', ['alertType', 'status'])
export class AlertEntity extends BaseEntity {
    @Column({ type: 'uuid' })
    userId!: string;

    @Column({ type: 'uuid', nullable: true })
    assetId!: string | null;

    @Column({ type: 'varchar', length: 30 })
    alertType!: AlertType;

    @Column({ type: 'varchar', length: 30 })
    condition!: AlertCondition;

    @Column({ type: 'numeric', precision: 18, scale: 6 })
    threshold!: number;

    @Column({ type: 'varchar', length: 50, nullable: true })
    period!: string | null;

    @Column({ type: 'simple-array' })
    channels!: string[];

    @Column({ type: 'boolean', default: true })
    isRecurring!: boolean;

    @Column({ type: 'varchar', length: 30, default: AlertStatus.ACTIVE })
    status!: AlertStatus;

    @Column({ type: 'timestamp', nullable: true })
    lastTriggeredAt!: Date | null;
}
