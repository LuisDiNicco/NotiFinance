"use client";

import { DollarPanel } from "@/components/dashboard/DollarPanel";
import { RiskCountryCard } from "@/components/dashboard/RiskCountryCard";
import { MarketStatusBadge } from "@/components/dashboard/MarketStatusBadge";
import { IndexCards } from "@/components/dashboard/IndexCards";
import { TopMoversTable } from "@/components/dashboard/TopMoversTable";
import { WatchlistWidget } from "@/components/dashboard/WatchlistWidget";
import { useAuthStore } from "@/stores/authStore";
import {
  mockDollarQuotes,
  mockCountryRisk,
  mockRiskHistory,
  mockIndices,
  mockTopMovers,
  mockMarketStatus,
} from "@/services/mockMarketData";

export default function DashboardPage() {
  const { isAuthenticated } = useAuthStore();

  // Mock watchlist data for authenticated users
  const mockWatchlist = isAuthenticated
    ? [
        { id: "1", symbol: "GGAL", name: "Grupo Financiero Galicia", price: 3500, variation: 5.2, type: "STOCK" as const },
        { id: "2", symbol: "AAPL", name: "Apple Inc", price: 14500, variation: 1.8, type: "CEDEAR" as const },
        { id: "3", symbol: "AL30", name: "Bono Rep. Argentina USD 2030", price: 55.2, variation: -0.5, type: "BOND" as const },
      ]
    : [];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Resumen del mercado financiero argentino
          </p>
        </div>
        <MarketStatusBadge status={mockMarketStatus} />
      </div>

      <DollarPanel initialData={mockDollarQuotes} />

      <IndexCards indices={mockIndices} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TopMoversTable data={mockTopMovers} />
        </div>
        <div className="flex flex-col gap-6">
          <RiskCountryCard initialData={mockCountryRisk} historyData={mockRiskHistory} />
          {isAuthenticated && <WatchlistWidget items={mockWatchlist} />}
        </div>
      </div>
    </main>
  );
}