import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { type IAlertRepository } from '../../../../application/IAlertRepository';
import { Alert } from '../../../../domain/entities/Alert';
import { AlertStatus } from '../../../../domain/enums/AlertStatus';
import { AlertType } from '../../../../domain/enums/AlertType';
import { AlertEntity } from '../entities/AlertEntity';
import { AlertMapper } from '../maps/AlertMapper';

@Injectable()
export class TypeOrmAlertRepository implements IAlertRepository {
  constructor(
    @InjectRepository(AlertEntity)
    private readonly repository: Repository<AlertEntity>,
  ) {}

  public async findByUserIdPaginated(
    userId: string,
    page: number,
    limit: number,
  ): Promise<Alert[]> {
    const entities = await this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return entities.map((entity) => AlertMapper.toDomain(entity));
  }

  public async findById(alertId: string): Promise<Alert | null> {
    const entity = await this.repository.findOne({ where: { id: alertId } });
    return entity ? AlertMapper.toDomain(entity) : null;
  }

  public async countByUserId(userId: string): Promise<number> {
    return this.repository.count({ where: { userId } });
  }

  public async findActiveByAssetId(assetId: string): Promise<Alert[]> {
    const entities = await this.repository.find({
      where: { assetId, status: AlertStatus.ACTIVE },
    });

    return entities.map((entity) => AlertMapper.toDomain(entity));
  }

  public async findActiveByType(alertType: AlertType): Promise<Alert[]> {
    const entities = await this.repository.find({
      where: { alertType, status: AlertStatus.ACTIVE },
    });

    return entities.map((entity) => AlertMapper.toDomain(entity));
  }

  public async countActiveByUserId(userId: string): Promise<number> {
    return this.repository.count({
      where: {
        userId,
        status: AlertStatus.ACTIVE,
      },
    });
  }

  public async save(alert: Alert): Promise<Alert> {
    const entity = AlertMapper.toPersistence(alert);
    const saved = await this.repository.save(entity);
    return AlertMapper.toDomain(saved);
  }

  public async delete(alertId: string): Promise<void> {
    await this.repository.softDelete({ id: alertId });
  }
}
