export const LOGIN_ATTEMPT_STORE = 'LOGIN_ATTEMPT_STORE';

export interface ILoginAttemptStore {
  isLoginLocked(email: string): Promise<boolean>;
  registerFailedAttempt(params: {
    email: string;
    lockoutSeconds: number;
    maxFailedLoginAttempts: number;
  }): Promise<void>;
  clearFailedLoginState(email: string): Promise<void>;
}
