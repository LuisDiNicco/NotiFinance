import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { type IRiskProvider } from '../../../../application/IRiskProvider';
import { CountryRisk } from '../../../../domain/entities/CountryRisk';

interface RiskApiResponse {
    valor: number;
    fecha: string;
}

@Injectable()
export class RiskProviderClient implements IRiskProvider {
    private readonly httpClient: AxiosInstance;

    constructor(private readonly configService: ConfigService) {
        const baseURL = this.configService.get<string>('market.dolarApiUrl', 'https://dolarapi.com/v1');

        this.httpClient = axios.create({
            baseURL,
            timeout: 5000,
        });
    }

    public async fetchCountryRisk(): Promise<CountryRisk> {
        const response = await this.httpClient.get<RiskApiResponse>('/riesgo-pais');

        return new CountryRisk(
            Number(response.data.valor ?? 0),
            0,
            new Date(response.data.fecha),
        );
    }
}
