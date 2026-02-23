/**
 * Domain error thrown when a user's preferences are not found in the system.
 * This is a business logic error indicating the user has no notification preferences configured.
 */
export class PreferencesNotFoundError extends Error {
    constructor(userId: string) {
        super(`Preferences not found for user: ${userId}`);
        this.name = 'PreferencesNotFoundError';
    }
}
