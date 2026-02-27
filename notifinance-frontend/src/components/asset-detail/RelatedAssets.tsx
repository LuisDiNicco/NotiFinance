import Link from "next/link";
import { Asset } from "@/types/market";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercent } from "@/lib/format";

interface RelatedAssetsProps {
  assets: Asset[];
}

export function RelatedAssets({ assets }: RelatedAssetsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activos Relacionados</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {assets.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay activos relacionados.</p>
        ) : (
          assets.slice(0, 4).map((asset) => (
            <Link key={asset.id} href={`/assets/${asset.symbol}`} className="flex items-center justify-between rounded border p-2 hover:bg-muted/50">
              <div>
                <p className="font-medium text-sm">{asset.symbol}</p>
                <p className="text-xs text-muted-foreground">{asset.name}</p>
              </div>
              <div className="text-right text-sm">
                <p>{formatCurrency(asset.price)}</p>
                <p className="text-muted-foreground">{formatPercent(asset.variation)}</p>
              </div>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}
