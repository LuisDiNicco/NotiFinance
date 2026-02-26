import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../../../../shared/infrastructure/base/database/BaseEntity';

@Entity('users')
export class UserEntity extends BaseEntity {
    @Column({ type: 'varchar', length: 255, unique: true })
    email!: string;

    @Column({ type: 'varchar', length: 255 })
    passwordHash!: string;

    @Column({ type: 'varchar', length: 120 })
    displayName!: string;

    @Column({ type: 'boolean', default: false })
    isDemo!: boolean;
}
