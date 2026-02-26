export class Notification {
    public id?: string;
    public readonly userId: string;
    public readonly alertId: string | null;
    public readonly title: string;
    public readonly body: string;
    public readonly type: string;
    public readonly metadata: Record<string, unknown>;
    public isRead: boolean;
    public readAt: Date | null;
    public readonly createdAt: Date | undefined;

    constructor(params: {
        userId: string;
        alertId?: string | null;
        title: string;
        body: string;
        type: string;
        metadata?: Record<string, unknown>;
        isRead?: boolean;
        readAt?: Date | null;
        createdAt?: Date;
    }) {
        this.userId = params.userId;
        this.alertId = params.alertId ?? null;
        this.title = params.title;
        this.body = params.body;
        this.type = params.type;
        this.metadata = params.metadata ?? {};
        this.isRead = params.isRead ?? false;
        this.readAt = params.readAt ?? null;
        this.createdAt = params.createdAt;
    }

    public markAsRead(): void {
        this.isRead = true;
        this.readAt = new Date();
    }
}
