import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { type INotificationRepository } from '../../../../application/services/INotificationRepository';
import { Notification } from '../../../../domain/entities/Notification';
import { NotificationEntity } from '../entities/NotificationEntity';
import { NotificationMapper } from '../maps/NotificationMapper';

@Injectable()
export class TypeOrmNotificationRepository implements INotificationRepository {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly repository: Repository<NotificationEntity>,
  ) {}

  public async findByUserPaginated(
    userId: string,
    unreadOnly: boolean,
    page: number,
    limit: number,
  ): Promise<Notification[]> {
    const entities = await this.repository.find({
      where: unreadOnly ? { userId, isRead: false } : { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return entities.map((entity) => NotificationMapper.toDomain(entity));
  }

  public async countUnread(userId: string): Promise<number> {
    return this.repository.count({ where: { userId, isRead: false } });
  }

  public async countByUser(
    userId: string,
    unreadOnly: boolean,
  ): Promise<number> {
    return this.repository.count({
      where: unreadOnly ? { userId, isRead: false } : { userId },
    });
  }

  public async findById(notificationId: string): Promise<Notification | null> {
    const entity = await this.repository.findOne({
      where: { id: notificationId },
    });
    return entity ? NotificationMapper.toDomain(entity) : null;
  }

  public async save(notification: Notification): Promise<Notification> {
    const entity = NotificationMapper.toPersistence(notification);
    const saved = await this.repository.save(entity);
    return NotificationMapper.toDomain(saved);
  }

  public async markAllAsRead(userId: string): Promise<number> {
    const result = await this.repository
      .createQueryBuilder()
      .update(NotificationEntity)
      .set({ isRead: true, readAt: new Date() })
      .where('"userId" = :userId', { userId })
      .andWhere('"isRead" = false')
      .execute();

    return result.affected ?? 0;
  }

  public async delete(notificationId: string): Promise<void> {
    await this.repository.softDelete({ id: notificationId });
  }
}
