import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPreferenceEntity } from './infrastructure/secondary-adapters/database/entities/UserPreferenceEntity';
import { PreferencesController } from './infrastructure/primary-adapters/http/controllers/PreferencesController';
import { PreferencesService } from './application/PreferencesService';
import { PreferencesRepository } from './infrastructure/secondary-adapters/database/repositories/PreferencesRepository';
import { PREFERENCES_REPO } from './application/IPreferencesRepository';

@Module({
  imports: [TypeOrmModule.forFeature([UserPreferenceEntity])],
  controllers: [PreferencesController],
  providers: [
    PreferencesService,
    {
      provide: PREFERENCES_REPO,
      useClass: PreferencesRepository,
    },
  ],
  exports: [PreferencesService],
})
export class PreferencesModule {}
