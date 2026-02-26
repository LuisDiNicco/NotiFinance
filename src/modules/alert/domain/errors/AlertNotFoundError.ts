export class AlertNotFoundError extends Error {
    constructor(alertId: string) {
        super(`Alert ${alertId} not found`);
        this.name = 'AlertNotFoundError';
    }
}
