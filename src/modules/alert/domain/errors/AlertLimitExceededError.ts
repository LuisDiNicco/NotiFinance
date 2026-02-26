export class AlertLimitExceededError extends Error {
    constructor(maxAlerts: number) {
        super(`Active alerts limit exceeded. Maximum allowed is ${maxAlerts}`);
        this.name = 'AlertLimitExceededError';
    }
}
