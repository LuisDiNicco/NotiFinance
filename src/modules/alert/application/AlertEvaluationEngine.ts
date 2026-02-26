import { Inject, Injectable } from '@nestjs/common';
import { ALERT_REPOSITORY, type IAlertRepository } from './IAlertRepository';
import { Alert } from '../domain/entities/Alert';
import { AlertType } from '../domain/enums/AlertType';

@Injectable()
export class AlertEvaluationEngine {
  constructor(
    @Inject(ALERT_REPOSITORY)
    private readonly alertRepository: IAlertRepository,
  ) {}

  public async evaluateAlertsForAsset(
    assetId: string,
    currentPrice: number,
  ): Promise<Alert[]> {
    const alerts = await this.alertRepository.findActiveByAssetId(assetId);
    return this.evaluateAndPersist(alerts, currentPrice);
  }

  public async evaluateAlertsForDollar(
    dollarType: string,
    currentPrice: number,
  ): Promise<Alert[]> {
    const alerts = await this.alertRepository.findActiveByType(
      AlertType.DOLLAR,
    );
    const scoped = alerts.filter(
      (alert) => !alert.period || alert.period === dollarType,
    );
    return this.evaluateAndPersist(scoped, currentPrice);
  }

  public async evaluateAlertsForRisk(currentValue: number): Promise<Alert[]> {
    const alerts = await this.alertRepository.findActiveByType(AlertType.RISK);
    return this.evaluateAndPersist(alerts, currentValue);
  }

  private async evaluateAndPersist(
    alerts: Alert[],
    currentValue: number,
  ): Promise<Alert[]> {
    const triggered: Alert[] = [];

    for (const alert of alerts) {
      if (!alert.canTrigger()) {
        continue;
      }

      if (!alert.evaluate(currentValue)) {
        continue;
      }

      alert.trigger();
      const saved = await this.alertRepository.save(alert);
      triggered.push(saved);
    }

    return triggered;
  }
}
