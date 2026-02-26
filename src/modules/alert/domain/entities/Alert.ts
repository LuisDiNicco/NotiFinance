import { NotificationChannel } from '../../../preferences/domain/enums/NotificationChannel';
import { AlertCondition } from '../enums/AlertCondition';
import { AlertStatus } from '../enums/AlertStatus';
import { AlertType } from '../enums/AlertType';

export class Alert {
  public id?: string;
  public readonly userId: string;
  public readonly assetId: string | null;
  public readonly alertType: AlertType;
  public readonly condition: AlertCondition;
  public readonly threshold: number;
  public readonly period: string | null;
  public readonly channels: NotificationChannel[];
  public readonly isRecurring: boolean;
  public status: AlertStatus;
  public lastTriggeredAt: Date | null;

  constructor(params: {
    userId: string;
    assetId?: string | null;
    alertType: AlertType;
    condition: AlertCondition;
    threshold: number;
    period?: string | null;
    channels: NotificationChannel[];
    isRecurring: boolean;
    status?: AlertStatus;
    lastTriggeredAt?: Date | null;
  }) {
    this.userId = params.userId;
    this.assetId = params.assetId ?? null;
    this.alertType = params.alertType;
    this.condition = params.condition;
    this.threshold = params.threshold;
    this.period = params.period ?? null;
    this.channels = params.channels;
    this.isRecurring = params.isRecurring;
    this.status = params.status ?? AlertStatus.ACTIVE;
    this.lastTriggeredAt = params.lastTriggeredAt ?? null;
  }

  public evaluate(currentValue: number): boolean {
    switch (this.condition) {
      case AlertCondition.ABOVE:
      case AlertCondition.PCT_UP:
        return currentValue >= this.threshold;
      case AlertCondition.BELOW:
        return currentValue <= this.threshold;
      case AlertCondition.PCT_DOWN:
        return currentValue <= this.threshold;
      case AlertCondition.CROSSES:
        return currentValue >= this.threshold;
      default:
        return false;
    }
  }

  public canTrigger(now = new Date()): boolean {
    if (this.status !== AlertStatus.ACTIVE) {
      return false;
    }

    if (!this.isRecurring && this.lastTriggeredAt) {
      return false;
    }

    if (!this.lastTriggeredAt) {
      return true;
    }

    const cooldownMs = 60_000;
    return now.getTime() - this.lastTriggeredAt.getTime() >= cooldownMs;
  }

  public trigger(now = new Date()): void {
    this.lastTriggeredAt = now;
    if (!this.isRecurring) {
      this.status = AlertStatus.TRIGGERED;
    }
  }
}
