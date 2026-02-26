import { NotificationChannel } from '../../../../../preferences/domain/enums/NotificationChannel';
import { Alert } from '../../../../domain/entities/Alert';
import { AlertEntity } from '../entities/AlertEntity';

export class AlertMapper {
  public static toDomain(entity: AlertEntity): Alert {
    const alert = new Alert({
      userId: entity.userId,
      assetId: entity.assetId,
      alertType: entity.alertType,
      condition: entity.condition,
      threshold: Number(entity.threshold),
      period: entity.period,
      channels: entity.channels as NotificationChannel[],
      isRecurring: entity.isRecurring,
      status: entity.status,
      lastTriggeredAt: entity.lastTriggeredAt,
    });

    alert.id = entity.id;
    return alert;
  }

  public static toPersistence(domain: Alert): AlertEntity {
    const entity = new AlertEntity();
    if (domain.id) {
      entity.id = domain.id;
    }

    entity.userId = domain.userId;
    entity.assetId = domain.assetId;
    entity.alertType = domain.alertType;
    entity.condition = domain.condition;
    entity.threshold = domain.threshold;
    entity.period = domain.period;
    entity.channels = domain.channels;
    entity.isRecurring = domain.isRecurring;
    entity.status = domain.status;
    entity.lastTriggeredAt = domain.lastTriggeredAt;

    return entity;
  }
}
