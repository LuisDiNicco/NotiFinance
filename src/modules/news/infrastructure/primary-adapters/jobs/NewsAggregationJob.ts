import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { FetchLatestNewsUseCase } from '../../../application/FetchLatestNewsUseCase';
import { NewsGateway } from '../../secondary-adapters/websockets/NewsGateway';

@Injectable()
export class NewsAggregationJob implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NewsAggregationJob.name);
  private readonly jobName = 'news-aggregation';

  constructor(
    private readonly configService: ConfigService,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly fetchLatestNewsUseCase: FetchLatestNewsUseCase,
    private readonly newsGateway: NewsGateway,
  ) {}

  onModuleInit(): void {
    const cronExpression = this.configService.get<string>(
      'market.newsAggregationCron',
      '*/30 * * * *',
    );

    const job = new CronJob(cronExpression, () => {
      void this.handle();
    });

    this.schedulerRegistry.addCronJob(this.jobName, job);
    job.start();
    this.logger.log(`Registered news aggregation cron job (${cronExpression})`);
  }

  onModuleDestroy(): void {
    const job = this.schedulerRegistry.doesExist('cron', this.jobName)
      ? this.schedulerRegistry.getCronJob(this.jobName)
      : null;

    if (!job) {
      return;
    }

    void job.stop();
    this.schedulerRegistry.deleteCronJob(this.jobName);
  }

  public async handle(): Promise<void> {
    const startedAt = Date.now();

    try {
      const result = await this.fetchLatestNewsUseCase.execute();
      if (result.insertedArticles.length > 0) {
        this.newsGateway.emitLatest(result.insertedArticles);
      }

      this.logger.log(
        `News aggregation finished in ${Date.now() - startedAt}ms (fetched=${result.fetchedCount}, inserted=${result.insertedCount}, deleted=${result.deletedCount})`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown';
      this.logger.error(
        `News aggregation failed after ${Date.now() - startedAt}ms: ${message}`,
      );
    }
  }
}
