import { UserPreference } from '../../../../../../src/modules/preferences/domain/entities/UserPreference';
import { NotificationChannel } from '../../../../../../src/modules/preferences/domain/enums/NotificationChannel';

describe('UserPreference', () => {
    it('allows delivery when event is enabled and channel is opted in', () => {
        const preference = new UserPreference(
            'user-1',
            [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
            [],
        );

        expect(
            preference.canReceiveEventVia('payment.success', NotificationChannel.EMAIL),
        ).toBe(true);
    });

    it('blocks delivery when event type is disabled', () => {
        const preference = new UserPreference(
            'user-1',
            [NotificationChannel.EMAIL],
            ['security.login_alert'],
        );

        expect(
            preference.canReceiveEventVia('security.login_alert', NotificationChannel.EMAIL),
        ).toBe(false);
    });

    it('blocks delivery when channel is not opted in', () => {
        const preference = new UserPreference('user-1', [NotificationChannel.IN_APP], []);

        expect(
            preference.canReceiveEventVia('payment.success', NotificationChannel.EMAIL),
        ).toBe(false);
    });
});
