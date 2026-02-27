"use client";

import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockPortfolios, mockHoldings, mockPortfolioHistory, mockTrades } from "@/services/mockPortfolioData";
import { PortfolioSummary } from "@/components/portfolio/PortfolioSummary";
import { HoldingsTable } from "@/components/portfolio/HoldingsTable";
import { TradesHistory } from "@/components/portfolio/TradesHistory";
import { PerformanceChart } from "@/components/charts/PerformanceChart";
import { DonutChart } from "@/components/charts/DonutChart";
import {
  usePortfolio,
  usePortfolioDistribution,
  usePortfolioHoldings,
  usePortfolioPerformance,
  usePortfolioTrades,
  useRecordTrade,
} from "@/hooks/usePortfolio";
import { AddTradeModal } from "@/components/portfolio/AddTradeModal";
import { Button } from "@/components/ui/button";

interface PortfolioDetailClientProps {
  portfolioId: string;
}

export function PortfolioDetailClient({ portfolioId }: PortfolioDetailClientProps) {
  const [performancePeriod, setPerformancePeriod] = useState("3M");

  const portfolioQuery = usePortfolio();
  const holdingsQuery = usePortfolioHoldings(portfolioId);
  const tradesQuery = usePortfolioTrades(portfolioId);
  const performanceQuery = usePortfolioPerformance(portfolioId, performancePeriod);
  const distributionQuery = usePortfolioDistribution(portfolioId);
  const recordTradeMutation = useRecordTrade(portfolioId);

  const usingFallback =
    portfolioQuery.isError ||
    holdingsQuery.isError ||
    tradesQuery.isError ||
    performanceQuery.isError ||
    distributionQuery.isError;

  const portfolio = usingFallback
    ? mockPortfolios.find((item) => item.id === portfolioId)
    : (portfolioQuery.data ?? []).find((item) => item.id === portfolioId);

  const holdings = useMemo(
    () => (usingFallback ? (mockHoldings[portfolioId] ?? []) : (holdingsQuery.data ?? [])),
    [holdingsQuery.data, portfolioId, usingFallback],
  );
  const trades = useMemo(
    () => (usingFallback ? (mockTrades[portfolioId] ?? []) : (tradesQuery.data ?? [])),
    [portfolioId, tradesQuery.data, usingFallback],
  );
  const performanceData = useMemo(
    () => (usingFallback ? mockPortfolioHistory : (performanceQuery.data ?? [])),
    [performanceQuery.data, usingFallback],
  );

  const distributionByType = useMemo(() => {
    if (!usingFallback && distributionQuery.data) {
      return distributionQuery.data.byType.reduce<Record<string, number>>((acc, item) => {
        acc[item.type] = item.weight;
        return acc;
      }, {});
    }

    return holdings.reduce<Record<string, number>>((acc, holding) => {
      acc[holding.type] = (acc[holding.type] ?? 0) + holding.weight;
      return acc;
    }, {});
  }, [distributionQuery.data, holdings, usingFallback]);

  if (!portfolio) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center p-6">
        <div className="rounded-md border px-4 py-3 text-sm text-muted-foreground">
          Portfolio no encontrado.
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{portfolio.name}</h1>
        <p className="text-muted-foreground">{portfolio.description ?? "Detalle del portfolio"}</p>
      </div>

      <PortfolioSummary portfolio={portfolio} />

      <Tabs defaultValue="holdings" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="holdings">Tenencias</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="distribution">Distribución</TabsTrigger>
          <TabsTrigger value="trades">Operaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="holdings" className="mt-4">
          <div className="mb-3 flex justify-end">
            <AddTradeModal
              portfolioId={portfolioId}
              onSubmitTrade={async (trade) => {
                if (usingFallback) {
                  return;
                }

                await recordTradeMutation.mutateAsync({
                  ticker: trade.ticker,
                  tradeType: trade.tradeType,
                  quantity: trade.quantity,
                  pricePerUnit: trade.pricePerUnit,
                  currency: "ARS",
                  commission: trade.commission,
                  executedAt: trade.executedAt,
                });
              }}
            />
          </div>
          <HoldingsTable holdings={holdings} />
        </TabsContent>

        <TabsContent value="performance" className="mt-4">
          <div className="mb-3 flex flex-wrap gap-2">
            {[
              { label: "1M", value: "1M" },
              { label: "3M", value: "3M" },
              { label: "6M", value: "6M" },
              { label: "1Y", value: "1Y" },
              { label: "ALL", value: "ALL" },
            ].map((period) => (
              <Button
                key={period.value}
                size="sm"
                variant={performancePeriod === period.value ? "default" : "outline"}
                onClick={() => setPerformancePeriod(period.value)}
              >
                {period.label}
              </Button>
            ))}
          </div>
          <PerformanceChart data={performanceData} />
          <p className="mt-3 text-sm text-muted-foreground">Benchmark overlay: Merval y Dólar MEP (modo mock).</p>
        </TabsContent>

        <TabsContent value="distribution" className="mt-4">
          <DonutChart
            title="Distribución por tipo"
            data={Object.entries(distributionByType).map(([label, value]) => ({ label, value }))}
          />
        </TabsContent>

        <TabsContent value="trades" className="mt-4">
          <TradesHistory trades={trades} />
        </TabsContent>
      </Tabs>
    </main>
  );
}
