import { notFound } from "next/navigation";
import { mockAssets, mockAssetHistory } from "@/services/mockAssetsData";
import { formatCurrency, formatPercent, formatNumber } from "@/lib/format";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { AssetChart } from "@/components/assets/AssetChart";
import { AssetActions } from "@/components/assets/AssetActions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AssetDetailPageProps {
  params: Promise<{ ticker: string }>;
}

export default async function AssetDetailPage({ params }: AssetDetailPageProps) {
  const { ticker } = await params;
  
  const asset = mockAssets.find((a) => a.symbol.toUpperCase() === ticker.toUpperCase());
  
  if (!asset) {
    notFound();
  }

  const isPositive = asset.variation > 0;
  const isNegative = asset.variation < 0;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{asset.symbol}</h1>
            <span className="px-2 py-1 rounded-md bg-muted text-xs font-medium">
              {asset.type}
            </span>
          </div>
          <p className="text-muted-foreground text-lg">{asset.name}</p>
        </div>
        
        <AssetActions asset={asset} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm text-muted-foreground">Precio Actual</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">{formatCurrency(asset.price)}</span>
                  <span className="text-sm text-muted-foreground">{asset.currency}</span>
                </div>
              </div>
              <div
                className={cn(
                  "flex items-center text-lg font-medium px-3 py-1 rounded-md",
                  isPositive ? "bg-green-500/10 text-green-600" : isNegative ? "bg-red-500/10 text-red-600" : "bg-muted text-muted-foreground"
                )}
              >
                {isPositive ? (
                  <ArrowUpIcon className="mr-1 h-5 w-5" />
                ) : isNegative ? (
                  <ArrowDownIcon className="mr-1 h-5 w-5" />
                ) : null}
                {formatPercent(asset.variation)}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mt-4">
              <AssetChart data={mockAssetHistory} isPositive={isPositive} />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
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
        </div>
      </div>
    </main>
  );
}
