import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';
import { ValidationPipe } from '@nestjs/common';
import { CustomExceptionsFilter } from './shared/infrastructure/primary-adapters/http/filters/CustomExceptionsFilter';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = app.get(Logger);
  app.useLogger(logger);

  // Security headers
  app.use(helmet());

  // CORS configuration
  app.enableCors({
    origin: process.env['CORS_ORIGIN']?.split(',') || ['http://localhost:3000'],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization,X-Correlation-ID',
  });

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new CustomExceptionsFilter());

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('Notification Core API')
    .setDescription('Notification management system with multi-channel delivery')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

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
  logger.log(`Application is running on http://localhost:${port}`);
  logger.log(`API Documentation available at http://localhost:${port}/api`);
  logger.log(`RabbitMQ Microservice connected and polling from 'notification_events'`);
}
bootstrap();

