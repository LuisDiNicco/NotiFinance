import { Inject, Injectable } from '@nestjs/common';
import { ALERT_REPOSITORY, type IAlertRepository } from './IAlertRepository';
import { Alert } from '../domain/entities/Alert';
import { AlertStatus } from '../domain/enums/AlertStatus';
import { AlertNotFoundError } from '../domain/errors/AlertNotFoundError';
import { AlertLimitExceededError } from '../domain/errors/AlertLimitExceededError';
import { MarketDataService } from '../../market-data/application/MarketDataService';
import { AssetNotFoundError } from '../../market-data/domain/errors/AssetNotFoundError';

@Injectable()
export class AlertService {
  private static readonly MAX_ACTIVE_ALERTS = 20;

  constructor(
    @Inject(ALERT_REPOSITORY)
    private readonly alertRepository: IAlertRepository,
    private readonly marketDataService: MarketDataService,
  ) {}

  public async createAlert(userId: string, alert: Alert): Promise<Alert> {
    const activeCount = await this.alertRepository.countActiveByUserId(userId);
    if (activeCount >= AlertService.MAX_ACTIVE_ALERTS) {
      throw new AlertLimitExceededError(AlertService.MAX_ACTIVE_ALERTS);
    }

    if (alert.assetId) {
      const asset = await this.marketDataService.getAssets();
      const exists = asset.some((item) => item.id === alert.assetId);
      if (!exists) {
        throw new AssetNotFoundError(alert.assetId);
      }
    }

    const toSave = new Alert({
      userId,
      assetId: alert.assetId,
      alertType: alert.alertType,
      condition: alert.condition,
      threshold: alert.threshold,
      period: alert.period,
      channels: alert.channels,
      isRecurring: alert.isRecurring,
      status: alert.status,
      lastTriggeredAt: alert.lastTriggeredAt,
    });

    return this.alertRepository.save(toSave);
  }

  public async getUserAlerts(
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<Alert[]> {
    return this.alertRepository.findByUserIdPaginated(userId, page, limit);
  }

  public async updateAlert(
    userId: string,
    alertId: string,
    patch: Partial<Alert>,
  ): Promise<Alert> {
    const existing = await this.alertRepository.findById(alertId);

    if (!existing || existing.userId !== userId) {
      throw new AlertNotFoundError(alertId);
    }

    const merged = new Alert({
      userId: existing.userId,
      assetId: patch.assetId ?? existing.assetId,
      alertType: patch.alertType ?? existing.alertType,
      condition: patch.condition ?? existing.condition,
      threshold: patch.threshold ?? existing.threshold,
      period: patch.period ?? existing.period,
      channels: patch.channels ?? existing.channels,
      isRecurring: patch.isRecurring ?? existing.isRecurring,
      status: patch.status ?? existing.status,
      lastTriggeredAt: patch.lastTriggeredAt ?? existing.lastTriggeredAt,
    });

    if (existing.id) {
      merged.id = existing.id;
    }
    return this.alertRepository.save(merged);
  }

  public async changeStatus(
    userId: string,
    alertId: string,
    status: AlertStatus,
  ): Promise<Alert> {
    return this.updateAlert(userId, alertId, { status });
  }

  public async deleteAlert(userId: string, alertId: string): Promise<void> {
    const existing = await this.alertRepository.findById(alertId);

    if (!existing || existing.userId !== userId) {
      throw new AlertNotFoundError(alertId);
    }

    await this.alertRepository.delete(alertId);
  }
}
