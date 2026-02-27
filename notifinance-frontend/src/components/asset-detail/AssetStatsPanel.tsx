import { Asset } from "@/types/market";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatNumber } from "@/lib/format";

interface AssetStatsPanelProps {
  asset: Asset;
}

export function AssetStatsPanel({ asset }: AssetStatsPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Información del Activo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <span className="text-muted-foreground">Sector</span>
          <span className="font-medium">{asset.sector || "-"}</span>
        </div>
        <div className="flex justify-between items-center border-b pb-2">
          <span className="text-muted-foreground">Volumen</span>
          <span className="font-medium">{asset.volume ? formatNumber(asset.volume) : "-"}</span>
        </div>
        <div className="flex justify-between items-center border-b pb-2">
          <span className="text-muted-foreground">Market Cap</span>
          <span className="font-medium">{asset.marketCap ? formatCurrency(asset.marketCap) : "-"}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Moneda</span>
          <span className="font-medium">{asset.currency}</span>
        </div>
      </CardContent>
    </Card>
  );
}
