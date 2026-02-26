import { Alert } from '../../../../../../src/modules/alert/domain/entities/Alert';
import { AlertCondition } from '../../../../../../src/modules/alert/domain/enums/AlertCondition';
import { AlertStatus } from '../../../../../../src/modules/alert/domain/enums/AlertStatus';
import { AlertType } from '../../../../../../src/modules/alert/domain/enums/AlertType';
import { NotificationChannel } from '../../../../../../src/modules/preferences/domain/enums/NotificationChannel';

describe('Alert entity', () => {
  it('evaluates ABOVE condition correctly', () => {
    const alert = new Alert({
      userId: 'user-1',
      alertType: AlertType.PRICE,
      condition: AlertCondition.ABOVE,
      threshold: 100,
      channels: [NotificationChannel.IN_APP],
      isRecurring: true,
    });

    expect(alert.evaluate(110)).toBe(true);
    expect(alert.evaluate(90)).toBe(false);
  });

  it('marks non recurring alert as triggered', () => {
    const alert = new Alert({
      userId: 'user-1',
      alertType: AlertType.PRICE,
      condition: AlertCondition.ABOVE,
      threshold: 100,
      channels: [NotificationChannel.IN_APP],
      isRecurring: false,
      status: AlertStatus.ACTIVE,
    });

    alert.trigger(new Date('2026-01-01T00:00:00.000Z'));

    expect(alert.status).toBe(AlertStatus.TRIGGERED);
    expect(alert.lastTriggeredAt?.toISOString()).toBe(
      '2026-01-01T00:00:00.000Z',
    );
  });
});
