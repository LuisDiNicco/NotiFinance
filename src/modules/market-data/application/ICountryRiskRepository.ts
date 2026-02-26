import { CountryRisk } from '../domain/entities/CountryRisk';

export const COUNTRY_RISK_REPOSITORY = 'ICountryRiskRepository';

export interface ICountryRiskRepository {
    save(risk: CountryRisk): Promise<void>;
    findLatest(): Promise<CountryRisk | null>;
}