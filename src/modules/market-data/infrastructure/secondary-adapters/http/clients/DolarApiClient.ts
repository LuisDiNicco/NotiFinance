import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { type IDollarProvider } from '../../../../application/IDollarProvider';
import { DollarQuote } from '../../../../domain/entities/DollarQuote';
import { DollarType } from '../../../../domain/enums/DollarType';

interface DolarApiResponse {
    casa: string;
    compra: number;
    venta: number;
    fechaActualizacion: string;
}

@Injectable()
export class DolarApiClient implements IDollarProvider {
    private readonly logger = new Logger(DolarApiClient.name);
    private readonly httpClient: AxiosInstance;

    constructor(private readonly configService: ConfigService) {
        const baseURL = this.configService.get<string>('market.dolarApiUrl', 'https://dolarapi.com/v1');

        this.httpClient = axios.create({
            baseURL,
            timeout: 5000,
        });
    }

    public async fetchAllDollarQuotes(): Promise<DollarQuote[]> {
        const response = await this.httpClient.get<DolarApiResponse[]>('/dolares');

        return response.data
            .map((item) => this.toDollarQuote(item))
            .filter((quote): quote is DollarQuote => quote !== null);
    }

    private toDollarQuote(item: DolarApiResponse): DollarQuote | null {
        const type = this.toDollarType(item.casa);

        if (!type) {
            this.logger.debug(`Skipping unsupported dollar type: ${item.casa}`);
            return null;
        }

        return new DollarQuote(
            type,
            Number(item.compra ?? 0),
            Number(item.venta ?? 0),
            new Date(item.fechaActualizacion),
            'dolarapi.com',
        );
    }

    private toDollarType(casa: string): DollarType | null {
        switch (casa.toLowerCase()) {
            case 'oficial':
                return DollarType.OFICIAL;
            case 'blue':
                return DollarType.BLUE;
            case 'bolsa':
                return DollarType.MEP;
            case 'contadoconliqui':
                return DollarType.CCL;
            case 'tarjeta':
                return DollarType.TARJETA;
            case 'cripto':
                return DollarType.CRIPTO;
            default:
                return null;
        }
    }
}
