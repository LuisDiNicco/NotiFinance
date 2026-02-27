import { mockPortfolios, mockHoldings, mockTrades, mockPortfolioHistory } from "@/services/mockPortfolioData";
import { PortfolioSummary } from "@/components/portfolio/PortfolioSummary";
import { HoldingsTable } from "@/components/portfolio/HoldingsTable";
import { TradesHistory } from "@/components/portfolio/TradesHistory";
import { PortfolioChart } from "@/components/portfolio/PortfolioChart";
import { AddTradeModal } from "@/components/portfolio/AddTradeModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function PortfolioPage() {
  // In a real app, we would fetch the user's portfolios and select the active one
  const activePortfolio = mockPortfolios[0];
  const holdings = mockHoldings[activePortfolio.id] || [];
  const trades = mockTrades[activePortfolio.id] || [];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Mi Portafolio</h1>
          <p className="text-muted-foreground">
            Gestioná tus inversiones y analizá tus rendimientos.
          </p>
        </div>
        
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <Select defaultValue={activePortfolio.id}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Seleccionar portafolio" />
            </SelectTrigger>
            <SelectContent>
              {mockPortfolios.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <AddTradeModal portfolioId={activePortfolio.id} />
        </div>
      </div>

      <PortfolioSummary portfolio={activePortfolio} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PortfolioChart data={mockPortfolioHistory} />
        </div>
        
        <div className="bg-muted/50 rounded-xl p-6 flex flex-col justify-center items-center text-center border border-dashed">
          <h3 className="font-medium mb-2">Distribución de Activos</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Próximamente: Gráfico de torta con la distribución por tipo de activo y sector.
          </p>
          <div className="w-32 h-32 rounded-full border-4 border-primary/20 border-t-primary animate-spin-slow"></div>
        </div>
      </div>

      <Tabs defaultValue="holdings" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="holdings">Tenencias</TabsTrigger>
          <TabsTrigger value="trades">Historial de Operaciones</TabsTrigger>
        </TabsList>
        <TabsContent value="holdings" className="mt-4">
          <HoldingsTable holdings={holdings} />
        </TabsContent>
        <TabsContent value="trades" className="mt-4">
          <TradesHistory trades={trades} />
        </TabsContent>
      </Tabs>
    </main>
  );
}
