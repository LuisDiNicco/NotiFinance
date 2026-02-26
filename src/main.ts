import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';
import { ValidationPipe } from '@nestjs/common';
import { CustomExceptionsFilter } from './shared/infrastructure/primary-adapters/http/filters/CustomExceptionsFilter';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { RequestLoggingInterceptor } from './shared/infrastructure/primary-adapters/http/interceptors/RequestLoggingInterceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = app.get(Logger);
  const configService = app.get(ConfigService);
  app.useLogger(logger);

  // Security headers
  app.use(helmet());

  // CORS configuration
  const corsOrigins = configService.get<string[]>('app.cors.origins', ['http://localhost:3000']);
  app.enableCors({
    origin: corsOrigins,
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
  app.useGlobalInterceptors(new RequestLoggingInterceptor());

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
  const rmqUrl = configService.get<string>('integrations.rabbitmq.url');

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rmqUrl as string],
      queue: 'notification_events',
      noAck: false, // Strict Acking required
      queueOptions: {
        durable: true,
        arguments: {
          'x-dead-letter-exchange': '',
          'x-dead-letter-routing-key': 'notification_events.dlq',
        },
      },
    },
  });

  await app.startAllMicroservices();

  const port = configService.get<number>('app.port', 3000);
  await app.listen(port);
  logger.log(`Application is running on http://localhost:${port}`);
  logger.log(`API Documentation available at http://localhost:${port}/api`);
  logger.log(`RabbitMQ Microservice connected and polling from 'notification_events'`);
}
bootstrap();

