import { Asset } from "@/types/market";
import { AssetActions } from "@/components/assets/AssetActions";

interface AssetHeaderProps {
  asset: Asset;
}

export function AssetHeader({ asset }: AssetHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">{asset.symbol}</h1>
          <span className="px-2 py-1 rounded-md bg-muted text-xs font-medium">{asset.type}</span>
        </div>
        <p className="text-muted-foreground text-lg">{asset.name}</p>
      </div>
      <AssetActions asset={asset} />
    </div>
  );
}
