import { Asset } from '../domain/entities/Asset';
import { AssetType } from '../domain/enums/AssetType';

export const ASSET_REPOSITORY = 'IAssetRepository';

export interface IAssetRepository {
    findAll(type?: AssetType): Promise<Asset[]>;
    findByTicker(ticker: string): Promise<Asset | null>;
    search(query: string, limit: number): Promise<Asset[]>;
}
