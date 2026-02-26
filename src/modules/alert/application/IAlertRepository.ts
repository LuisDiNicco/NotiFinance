import { Alert } from '../domain/entities/Alert';
import { AlertType } from '../domain/enums/AlertType';

export const ALERT_REPOSITORY = 'IAlertRepository';

export interface IAlertRepository {
  findByUserIdPaginated(
    userId: string,
    page: number,
    limit: number,
  ): Promise<Alert[]>;
  findById(alertId: string): Promise<Alert | null>;
  countByUserId(userId: string): Promise<number>;
  findActiveByAssetId(assetId: string): Promise<Alert[]>;
  findActiveByType(alertType: AlertType): Promise<Alert[]>;
  countActiveByUserId(userId: string): Promise<number>;
  save(alert: Alert): Promise<Alert>;
  delete(alertId: string): Promise<void>;
}
