import {
  Controller,
  Get,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { timingSafeEqual } from 'node:crypto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ProviderHealthTracker } from '../../../../application/ProviderHealthTracker';

@ApiTags('Health')
@Controller('health/providers')
export class ProviderHealthController {
  constructor(
    private readonly providerHealthTracker: ProviderHealthTracker,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get provider health metrics and rolling status' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 401, description: 'Invalid monitoring API key' })
  public async getProviderHealth(
    @Headers('x-monitoring-api-key') monitoringApiKey?: string,
  ): Promise<{
    updatedAt: string;
    providers: Array<{
      providerName: string;
      status: 'SUCCESS' | 'FAILURE' | 'UNKNOWN';
      checks24h: number;
      uptime24h: number;
      errorRate1h: number;
      avgLatencyMs: number | null;
      lastCheckedAt: string | null;
      lastSuccessAt: string | null;
      lastFailureAt: string | null;
    }>;
  }> {
    this.assertMonitoringAccess(monitoringApiKey);

    const snapshot = await this.providerHealthTracker.getProviderHealth();

    return {
      updatedAt: snapshot.updatedAt.toISOString(),
      providers: snapshot.providers.map((provider) => ({
        providerName: provider.providerName,
        status: provider.status,
        checks24h: provider.checks24h,
        uptime24h: provider.uptime24h,
        errorRate1h: provider.errorRate1h,
        avgLatencyMs: provider.avgLatencyMs,
        lastCheckedAt: provider.lastCheckedAt?.toISOString() ?? null,
        lastSuccessAt: provider.lastSuccessAt?.toISOString() ?? null,
        lastFailureAt: provider.lastFailureAt?.toISOString() ?? null,
      })),
    };
  }

  private assertMonitoringAccess(providedApiKey?: string): void {
    const expectedApiKey = this.configService
      .get<string>('MONITORING_API_KEY', '')
      .trim();

    if (!expectedApiKey) {
      return;
    }

    const candidate = (providedApiKey ?? '').trim();
    if (!candidate) {
      throw new UnauthorizedException('Invalid monitoring API key');
    }

    const expectedBuffer = Buffer.from(expectedApiKey);
    const candidateBuffer = Buffer.from(candidate);

    if (expectedBuffer.length !== candidateBuffer.length) {
      throw new UnauthorizedException('Invalid monitoring API key');
    }

    if (!timingSafeEqual(expectedBuffer, candidateBuffer)) {
      throw new UnauthorizedException('Invalid monitoring API key');
    }
  }
}
