import { Inject, Injectable } from '@nestjs/common';
import {
  NewsListResponse,
  NEWS_REPOSITORY,
  type INewsRepository,
} from './INewsRepository';

@Injectable()
export class GetNewsByTickerUseCase {
  constructor(
    @Inject(NEWS_REPOSITORY)
    private readonly newsRepository: INewsRepository,
  ) {}

  public async execute(request: {
    ticker?: string;
    page: number;
    limit: number;
  }): Promise<NewsListResponse> {
    const ticker = request.ticker?.trim();

    return this.newsRepository.findLatest({
      ...(ticker ? { ticker } : {}),
      page: request.page,
      limit: request.limit,
    });
  }
}
