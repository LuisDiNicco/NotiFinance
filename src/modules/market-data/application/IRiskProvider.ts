import { CountryRisk } from '../domain/entities/CountryRisk';

export const RISK_PROVIDER = 'IRiskProvider';

export interface IRiskProvider {
    fetchCountryRisk(): Promise<CountryRisk>;
}
