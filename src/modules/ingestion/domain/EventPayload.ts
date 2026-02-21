export enum EventType {
    PAYMENT_SUCCESS = 'payment.success',
    SECURITY_LOGIN_ALERT = 'security.login_alert',
    MARKETING_PROMO = 'marketing.promo',
    TRANSFER_RECEIVED = 'transfer.received',
}

export class EventPayload {
    constructor(
        public readonly eventId: string,
        public readonly eventType: EventType,
        public readonly recipientId: string,
        public readonly metadata: Record<string, unknown>,
    ) { }
}
