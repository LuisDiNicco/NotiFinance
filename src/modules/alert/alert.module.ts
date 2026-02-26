import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertService } from './application/AlertService';
import { AlertEvaluationEngine } from './application/AlertEvaluationEngine';
import { ALERT_REPOSITORY } from './application/IAlertRepository';
import { AlertController } from './infrastructure/primary-adapters/http/controllers/AlertController';
import { AlertEvaluationConsumer } from './infrastructure/primary-adapters/message-brokers/consumers/AlertEvaluationConsumer';
import { AlertEntity } from './infrastructure/secondary-adapters/database/entities/AlertEntity';
import { TypeOrmAlertRepository } from './infrastructure/secondary-adapters/database/repositories/TypeOrmAlertRepository';
import { IngestionModule } from '../ingestion/ingestion.module';
import { MarketDataModule } from '../market-data/market-data.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AlertEntity]),
    IngestionModule,
    MarketDataModule,
  ],
  controllers: [AlertController, AlertEvaluationConsumer],
  providers: [
    AlertService,
    AlertEvaluationEngine,
    {
      provide: ALERT_REPOSITORY,
      useClass: TypeOrmAlertRepository,
    },
  ],
  exports: [AlertService, AlertEvaluationEngine],
})
export class AlertModule {}
