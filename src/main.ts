import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';
import { ValidationPipe } from '@nestjs/common';
import { CustomExceptionsFilter } from './shared/infrastructure/primary-adapters/http/filters/CustomExceptionsFilter';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = app.get(Logger);
  app.useLogger(logger);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );

  app.useGlobalFilters(new CustomExceptionsFilter());

  // Connect RabbitMQ Microservice for Consumers
  const configService = app.get(ConfigService);
  const rmqUrl = configService.get<string>('RABBITMQ_URL');

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rmqUrl as string],
      queue: 'notification_events',
      noAck: false, // Strict Acking required
      queueOptions: {
        durable: true,
      },
    },
  });

  await app.startAllMicroservices();

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
  logger.log(`Application is running proxy HTTP on port: ${port}`);
  logger.log(`RabbitMQ Microservice connected securely and polling from 'notification_events'`);
}
bootstrap();

