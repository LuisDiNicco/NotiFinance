import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: Number(process.env['PORT'] || 3000),
  cors: {
    origins: (process.env['CORS_ORIGIN'] || 'http://localhost:3000')
      .split(',')
      .map((origin) => origin.trim())
      .filter((origin) => origin.length > 0),
  },
  throttle: {
    ttl: Number(process.env['THROTTLE_TTL'] || 60),
    limit: Number(process.env['THROTTLE_LIMIT'] || 100),
    authenticatedLimit: Number(
      process.env['THROTTLE_AUTHENTICATED_LIMIT'] || 300,
    ),
  },
}));
