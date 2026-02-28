"use client";

import { DollarPanel } from "@/components/dashboard/DollarPanel";
import { RiskCountryCard } from "@/components/dashboard/RiskCountryCard";
import { MarketStatusBadge } from "@/components/dashboard/MarketStatusBadge";
import { IndexCards } from "@/components/dashboard/IndexCards";
import { TopMoversTable } from "@/components/dashboard/TopMoversTable";
import { WatchlistWidget } from "@/components/dashboard/WatchlistWidget";
import { useAuthStore } from "@/stores/authStore";
import { useDashboardData } from "@/hooks/useMarketData";
import { useWatchlist } from "@/hooks/useWatchlist";

export default function DashboardPage() {
  const { isAuthenticated } = useAuthStore();
  const { data, isLoading } = useDashboardData();
  const { data: watchlistData } = useWatchlist(isAuthenticated);

  const watchlist = isAuthenticated ? (watchlistData ?? []) : [];

  const dashboardData = data;

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 p-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Cargando datos de mercado en tiempo real...</p>
      </main>
    );
  }

  if (!dashboardData) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 p-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Todavía no hay datos de mercado disponibles.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Resumen del mercado financiero argentino
          </p>
        </div>
        <MarketStatusBadge status={dashboardData.marketStatus} />
      </div>

      <DollarPanel initialData={dashboardData.dollarQuotes} />

      <IndexCards indices={dashboardData.indices} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TopMoversTable data={dashboardData.topMovers} />
        </div>
        <div className="flex flex-col gap-6">
          <RiskCountryCard initialData={dashboardData.countryRisk} historyData={dashboardData.riskHistory} />
          {isAuthenticated && <WatchlistWidget items={watchlist} />}
        </div>
      </div>
    </main>
  );
}