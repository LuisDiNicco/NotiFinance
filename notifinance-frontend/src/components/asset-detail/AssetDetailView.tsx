"use client";

import { useMemo, useState } from "react";
import { Asset } from "@/types/market";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PeriodSelector, type ChartPeriod } from "@/components/charts/PeriodSelector";
import { TechnicalIndicators } from "@/components/asset-detail/TechnicalIndicators";
import { AssetHeader } from "@/components/asset-detail/AssetHeader";
import { AssetStatsPanel } from "@/components/asset-detail/AssetStatsPanel";
import { RelatedAssets } from "@/components/asset-detail/RelatedAssets";
import { AssetChart } from "@/components/assets/AssetChart";
import { formatCurrency, formatPercent } from "@/lib/format";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AssetDetailViewProps {
  asset: Asset;
  history: { time: string; value: number }[];
  relatedAssets: Asset[];
}

export function AssetDetailView({ asset, history, relatedAssets }: AssetDetailViewProps) {
  const [period, setPeriod] = useState<ChartPeriod>("1M");
  const [activeIndicators, setActiveIndicators] = useState<string[]>([]);

  const isPositive = asset.variation > 0;
  const isNegative = asset.variation < 0;

  const historyByPeriod = useMemo(() => {
    const map: Record<ChartPeriod, number> = {
      "1D": 1,
      "5D": 5,
      "1M": 30,
      "3M": 60,
      "6M": 90,
      "1Y": 120,
      "5Y": 180,
      "MAX": history.length,
    };

    return history.slice(-map[period]);
  }, [history, period]);

  const handleToggleIndicator = (key: string, active: boolean) => {
    setActiveIndicators((current) => {
      if (active) return [...new Set([...current, key])];
      return current.filter((value) => value !== key);
    });
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 p-6">
      <AssetHeader asset={asset} />

      <div className="flex flex-col gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Período del gráfico</CardTitle>
          </CardHeader>
          <CardContent>
            <PeriodSelector value={period} onChange={setPeriod} />
          </CardContent>
        </Card>
        <TechnicalIndicators activeIndicators={activeIndicators} onToggle={handleToggleIndicator} />
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
                {isPositive ? <ArrowUpIcon className="mr-1 h-5 w-5" /> : null}
                {isNegative ? <ArrowDownIcon className="mr-1 h-5 w-5" /> : null}
                {formatPercent(asset.variation)}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mt-4">
              <AssetChart data={historyByPeriod} isPositive={isPositive} />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <AssetStatsPanel asset={asset} />
          <RelatedAssets assets={relatedAssets} />
        </div>
      </div>
    </main>
  );
}
