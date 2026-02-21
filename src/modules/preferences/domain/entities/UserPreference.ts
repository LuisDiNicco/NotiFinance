export enum NotificationChannel {
    EMAIL = 'EMAIL',
    SMS = 'SMS',
    PUSH = 'PUSH',
    IN_APP = 'IN_APP',
}

export class UserPreference {
    public id?: string;
    public userId: string;
    public optInChannels: NotificationChannel[];
    public disabledEventTypes: string[];

    constructor(
        userId: string,
        optInChannels: NotificationChannel[],
        disabledEventTypes: string[] = [],
    ) {
        this.userId = userId;
        this.optInChannels = optInChannels;
        this.disabledEventTypes = disabledEventTypes;
    }

    public canReceiveEventVia(eventType: string, channel: NotificationChannel): boolean {
        if (this.disabledEventTypes.includes(eventType)) {
            return false;
        }
        return this.optInChannels.includes(channel);
    }
}
