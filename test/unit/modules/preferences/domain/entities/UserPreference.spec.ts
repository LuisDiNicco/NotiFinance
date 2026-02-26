import { UserPreference } from '../../../../../../src/modules/preferences/domain/entities/UserPreference';
import { NotificationChannel } from '../../../../../../src/modules/preferences/domain/enums/NotificationChannel';
import { DigestFrequency } from '../../../../../../src/modules/preferences/domain/enums/DigestFrequency';

describe('UserPreference', () => {
  it('allows delivery when event is enabled and channel is opted in', () => {
    const preference = new UserPreference(
      'user-1',
      [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
      [],
    );

    expect(
      preference.canReceiveEventVia(
        'alert.price.above',
        NotificationChannel.EMAIL,
      ),
    ).toBe(true);
  });

  it('blocks delivery when event type is disabled', () => {
    const preference = new UserPreference(
      'user-1',
      [NotificationChannel.EMAIL],
      ['alert.risk.above'],
    );

    expect(
      preference.canReceiveEventVia(
        'alert.risk.above',
        NotificationChannel.EMAIL,
      ),
    ).toBe(false);
  });

  it('blocks delivery when channel is not opted in', () => {
    const preference = new UserPreference(
      'user-1',
      [NotificationChannel.IN_APP],
      [],
    );

    expect(
      preference.canReceiveEventVia(
        'alert.price.above',
        NotificationChannel.EMAIL,
      ),
    ).toBe(false);
  });

  it('blocks delivery during quiet hours in standard range', () => {
    const preference = new UserPreference(
      'user-1',
      [NotificationChannel.EMAIL],
      [],
      '09:00',
      '18:00',
      DigestFrequency.REALTIME,
    );

    const insideQuietHours = new Date(2024, 0, 1, 10, 30, 0);

    expect(
      preference.canReceiveEventVia(
        'alert.price.above',
        NotificationChannel.EMAIL,
        insideQuietHours,
      ),
    ).toBe(false);
  });

  it('blocks delivery during overnight quiet hours range', () => {
    const preference = new UserPreference(
      'user-1',
      [NotificationChannel.EMAIL],
      [],
      '22:00',
      '07:00',
      DigestFrequency.REALTIME,
    );

    const insideQuietHours = new Date(2024, 0, 1, 23, 0, 0);

    expect(
      preference.canReceiveEventVia(
        'alert.price.above',
        NotificationChannel.EMAIL,
        insideQuietHours,
      ),
    ).toBe(false);
  });
});
