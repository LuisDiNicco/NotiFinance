import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './application/AuthService';
import { USER_REPOSITORY } from './application/IUserRepository';
import { UserEntity } from './infrastructure/secondary-adapters/database/entities/UserEntity';
import { UserRepository } from './infrastructure/secondary-adapters/database/repositories/UserRepository';
import { AuthController } from './infrastructure/primary-adapters/http/controllers/AuthController';
import { JwtStrategy } from './infrastructure/secondary-adapters/security/JwtStrategy';
import { DemoSeedService } from './application/DemoSeedService';
import { DemoUsersCleanupJob } from './infrastructure/primary-adapters/jobs/DemoUsersCleanupJob';
import { PortfolioModule } from '../portfolio/portfolio.module';
import { WatchlistModule } from '../watchlist/watchlist.module';
import { AlertModule } from '../alert/alert.module';
import { NotificationModule } from '../notification/notification.module';
import { MarketDataModule } from '../market-data/market-data.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    PassportModule,
    PortfolioModule,
    WatchlistModule,
    AlertModule,
    NotificationModule,
    MarketDataModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const expiresInRaw = configService.get<string>(
          'auth.jwtExpiresIn',
          '15m',
        );
        const match = expiresInRaw
          .trim()
          .toLowerCase()
          .match(/^(\d+)(s|m|h|d)$/);
        const amount = Number(match?.[1] ?? 15);
        const unit = match?.[2] ?? 'm';
        const expiresInSeconds =
          unit === 's'
            ? amount
            : unit === 'm'
              ? amount * 60
              : unit === 'h'
                ? amount * 3600
                : amount * 86400;

        return {
          secret: configService.get<string>('auth.jwtSecret', 'secret'),
          signOptions: {
            expiresIn: expiresInSeconds,
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    DemoSeedService,
    DemoUsersCleanupJob,
    JwtStrategy,
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
