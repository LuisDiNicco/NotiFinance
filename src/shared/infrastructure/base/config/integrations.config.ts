import { registerAs } from '@nestjs/config';

export default registerAs('integrations', () => ({
  rabbitmq: {
    url: process.env['RABBITMQ_URL'] || 'amqp://guest:guest@localhost:5672',
  },
  redis: {
    url: process.env['REDIS_URL'] || 'redis://localhost:6379',
  },
  database: {
    url:
      process.env['DATABASE_URL'] ||
      'postgres://postgres:postgres@localhost:5432/noticore',
    runMigrations: String(process.env['RUN_MIGRATIONS'] || 'true') === 'true',
  },
}));
