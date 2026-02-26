import { NotificationChannel } from '../enums/NotificationChannel';
import { DigestFrequency } from '../enums/DigestFrequency';

export class UserPreference {
    public id?: string;
    public userId: string;
    public optInChannels: NotificationChannel[];
    public disabledEventTypes: string[];
    public quietHoursStart: string | null;
    public quietHoursEnd: string | null;
    public digestFrequency: DigestFrequency;

    constructor(
        userId: string,
        optInChannels: NotificationChannel[],
        disabledEventTypes: string[] = [],
        quietHoursStart: string | null = null,
        quietHoursEnd: string | null = null,
        digestFrequency: DigestFrequency = DigestFrequency.REALTIME,
    ) {
        this.userId = userId;
        this.optInChannels = optInChannels;
        this.disabledEventTypes = disabledEventTypes;
        this.quietHoursStart = quietHoursStart;
        this.quietHoursEnd = quietHoursEnd;
        this.digestFrequency = digestFrequency;
    }

    public canReceiveEventVia(eventType: string, channel: NotificationChannel, at: Date = new Date()): boolean {
        if (this.disabledEventTypes.includes(eventType)) {
            return false;
        }

        if (!this.optInChannels.includes(channel)) {
            return false;
        }

        if (this.isInsideQuietHours(at)) {
            return false;
        }

        return true;
    }

    private isInsideQuietHours(at: Date): boolean {
        if (!this.quietHoursStart || !this.quietHoursEnd) {
            return false;
        }

        const nowMinutes = at.getHours() * 60 + at.getMinutes();
        const start = this.parseTimeToMinutes(this.quietHoursStart);
        const end = this.parseTimeToMinutes(this.quietHoursEnd);

        if (start === null || end === null) {
            return false;
        }

        if (start === end) {
            return true;
        }

        if (start < end) {
            return nowMinutes >= start && nowMinutes < end;
        }

        return nowMinutes >= start || nowMinutes < end;
    }

    private parseTimeToMinutes(value: string): number | null {
        const match = value.match(/^(\d{2}):(\d{2})$/);
        if (!match) {
            return null;
        }

        const hours = Number(match[1]);
        const minutes = Number(match[2]);

        if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
            return null;
        }

        return hours * 60 + minutes;
    }
}
