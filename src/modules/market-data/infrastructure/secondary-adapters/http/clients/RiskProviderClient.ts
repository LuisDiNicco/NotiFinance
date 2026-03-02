import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { type IRiskProvider } from '../../../../application/IRiskProvider';
import { ProviderHealthTracker } from '../../../../application/ProviderHealthTracker';
import { CountryRisk } from '../../../../domain/entities/CountryRisk';

interface RiskApiResponse {
  valor: number;
  fecha: string;
}

interface ArgentinaDatosRiskApiResponse {
  valor: number;
  fecha: string;
}

interface AmbitoRiskApiResponse {
  ultimo: string;
  fecha: string;
  variacion?: string;
}

@Injectable()
export class RiskProviderClient implements IRiskProvider {
  private readonly logger = new Logger(RiskProviderClient.name);
  private readonly httpClient: AxiosInstance;

  constructor(
    private readonly configService: ConfigService,
    private readonly providerHealthTracker: ProviderHealthTracker,
  ) {
    const baseURL = this.configService.get<string>(
      'market.dolarApiUrl',
      'https://dolarapi.com/v1',
    );

    this.httpClient = axios.create({
      baseURL,
      timeout: 5000,
    });
  }

  public async fetchCountryRisk(): Promise<CountryRisk> {
    try {
      const response = await this.providerHealthTracker.track(
        'api.argentinadatos.com',
        '/v1/finanzas/indices/riesgo-pais/ultimo',
        () =>
          axios.get<ArgentinaDatosRiskApiResponse>(
            'https://api.argentinadatos.com/v1/finanzas/indices/riesgo-pais/ultimo',
            {
              timeout: 5000,
            },
          ),
      );

      return new CountryRisk(
        Number(response.data.valor ?? 0),
        0,
        this.parseDate(response.data.fecha),
      );
    } catch {
      this.logger.warn('ArgentinaDatos risk provider failed, trying DolarApi');

      try {
        const fallback = await this.providerHealthTracker.track(
          'dolarapi.com',
          '/riesgo-pais',
          () => this.httpClient.get<RiskApiResponse>('/riesgo-pais'),
        );

        return new CountryRisk(
          Number(fallback.data.valor ?? 0),
          0,
          this.parseDate(fallback.data.fecha),
        );
      } catch {
        this.logger.warn(
          'DolarApi risk provider failed, trying Ambito fallback endpoint',
        );

        const fallback = await this.providerHealthTracker.track(
          'mercados.ambito.com',
          '/riesgopais/variacion-ultimo',
          () =>
            axios.get<AmbitoRiskApiResponse>(
              'https://mercados.ambito.com/riesgopais/variacion-ultimo',
              {
                timeout: 5000,
              },
            ),
        );

        return new CountryRisk(
          this.parseNumber(fallback.data.ultimo),
          this.parsePercentage(fallback.data.variacion),
          this.parseAmbitoDate(fallback.data.fecha),
        );
      }
    }
  }

  private parseNumber(value: string): number {
    return (
      Number((value ?? '0').replace('.', '').replace(',', '.').trim()) || 0
    );
  }

  private parsePercentage(value?: string): number {
    if (!value) {
      return 0;
    }

    return this.parseNumber(value.replace('%', ''));
  }

  private parseAmbitoDate(value: string): Date {
    const [day, month, year] = value.split('-').map((part) => Number(part));

    if (!day || !month || !year) {
      return new Date();
    }

    return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  }

  private parseDate(value?: string): Date {
    if (!value) {
      return new Date();
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return new Date();
    }

    return parsed;
  }
}
