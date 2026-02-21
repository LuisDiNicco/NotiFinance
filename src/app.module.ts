import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { validate } from './shared/infrastructure/base/config/env.validation';
import { LoggerConfigModule } from './shared/infrastructure/base/logger/LoggerConfigModule';
import { getDatabaseConfig } from './shared/infrastructure/base/config/database.config';
import { RedisModule } from './shared/infrastructure/base/redis/redis.module';
import { IngestionModule } from './modules/ingestion/ingestion.module';
import { PreferencesModule } from './modules/preferences/preferences.module';
import { TemplateModule } from './modules/template/template.module';
import { NotificationModule } from './modules/notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate,
      isGlobal: true,
    }),
    LoggerConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getDatabaseConfig,
    }),
    RedisModule,
    IngestionModule,
    PreferencesModule,
    TemplateModule,
    NotificationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
