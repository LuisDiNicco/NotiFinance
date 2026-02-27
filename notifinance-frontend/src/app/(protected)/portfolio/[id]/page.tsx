import { notFound } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockPortfolios, mockHoldings, mockPortfolioHistory, mockTrades } from "@/services/mockPortfolioData";
import { PortfolioSummary } from "@/components/portfolio/PortfolioSummary";
import { HoldingsTable } from "@/components/portfolio/HoldingsTable";
import { TradesHistory } from "@/components/portfolio/TradesHistory";
import { PerformanceChart } from "@/components/charts/PerformanceChart";
import { DonutChart } from "@/components/charts/DonutChart";

interface PortfolioDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PortfolioDetailPage({ params }: PortfolioDetailPageProps) {
  const { id } = await params;
  const portfolio = mockPortfolios.find((item) => item.id === id);

  if (!portfolio) {
    notFound();
  }

  const holdings = mockHoldings[id] ?? [];
  const trades = mockTrades[id] ?? [];

  const distributionByType = holdings.reduce<Record<string, number>>((acc, holding) => {
    acc[holding.type] = (acc[holding.type] ?? 0) + holding.weight;
    return acc;
  }, {});

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
          <HoldingsTable holdings={holdings} />
        </TabsContent>

        <TabsContent value="performance" className="mt-4">
          <PerformanceChart data={mockPortfolioHistory} />
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
