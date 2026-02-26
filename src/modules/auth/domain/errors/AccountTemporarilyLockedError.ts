export class AccountTemporarilyLockedError extends Error {
  constructor() {
    super('Too many failed login attempts. Please try again later.');
    this.name = 'AccountTemporarilyLockedError';
  }
}
