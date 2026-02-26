import { Injectable } from '@nestjs/common';
import { type IAssetRepository } from '../../../../application/IAssetRepository';
import { Asset } from '../../../../domain/entities/Asset';
import { AssetType } from '../../../../domain/enums/AssetType';

@Injectable()
export class StaticAssetRepository implements IAssetRepository {
    private readonly assets: Asset[] = [
        new Asset('GGAL', 'Grupo Financiero Galicia', AssetType.STOCK, 'Financiero', 'GGAL.BA'),
        new Asset('YPFD', 'YPF', AssetType.STOCK, 'Energía', 'YPFD.BA'),
        new Asset('PAMP', 'Pampa Energía', AssetType.STOCK, 'Energía', 'PAMP.BA'),
        new Asset('AAPL', 'Apple (CEDEAR)', AssetType.CEDEAR, 'Tecnología', 'AAPL.BA'),
        new Asset('MSFT', 'Microsoft (CEDEAR)', AssetType.CEDEAR, 'Tecnología', 'MSFT.BA'),
        new Asset('AL30', 'Bonares 2030', AssetType.BOND, 'Renta Fija', 'AL30.BA'),
        new Asset('GD30', 'Globales 2030', AssetType.BOND, 'Renta Fija', 'GD30.BA'),
    ];

    public async findAll(type?: AssetType): Promise<Asset[]> {
        if (!type) {
            return this.assets;
        }

        return this.assets.filter((asset) => asset.assetType === type);
    }

    public async findByTicker(ticker: string): Promise<Asset | null> {
        const normalizedTicker = ticker.trim().toUpperCase();
        return this.assets.find((asset) => asset.ticker === normalizedTicker) ?? null;
    }

    public async search(query: string, limit: number): Promise<Asset[]> {
        const normalizedQuery = query.trim().toLowerCase();

        return this.assets
            .filter(
                (asset) =>
                    asset.ticker.toLowerCase().includes(normalizedQuery) ||
                    asset.name.toLowerCase().includes(normalizedQuery),
            )
            .slice(0, limit);
    }
}
