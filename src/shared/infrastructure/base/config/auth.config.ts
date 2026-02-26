import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  jwtSecret: process.env['JWT_SECRET'] || 'change-me-access-secret',
  jwtExpiresIn: process.env['JWT_EXPIRES_IN'] || '15m',
  jwtRefreshSecret:
    process.env['JWT_REFRESH_SECRET'] || 'change-me-refresh-secret',
  jwtRefreshExpiresIn: process.env['JWT_REFRESH_EXPIRES_IN'] || '7d',
  loginMaxAttempts: Number(process.env['AUTH_LOGIN_MAX_ATTEMPTS'] || 5),
  loginLockoutMinutes: Number(process.env['AUTH_LOGIN_LOCKOUT_MINUTES'] || 15),
}));
