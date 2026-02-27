"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WatchlistItem } from "@/types/market";
import { formatCurrency, formatPercent } from "@/lib/format";
import { ArrowDownIcon, ArrowUpIcon, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";

interface WatchlistWidgetProps {
  items: WatchlistItem[];
}

export function WatchlistWidget({ items }: WatchlistWidgetProps) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
          Mi Watchlist
        </CardTitle>
        <Button variant="ghost" size="sm" asChild className="text-xs">
          <Link href="/watchlist">Ver todos</Link>
        </Button>
      </CardHeader>
      <CardContent className="flex-1">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3 py-8">
            <div className="rounded-full bg-muted p-3">
              <Star className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Tu watchlist está vacía</p>
              <p className="text-xs text-muted-foreground">
                Agrega activos para seguirlos de cerca
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/assets">Explorar activos</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {items.slice(0, 5).map((item) => {
              const isPositive = item.variation > 0;
              const isNegative = item.variation < 0;
              const routePrefix = item.type === "STOCK" ? "acciones" : item.type === "CEDEAR" ? "cedears" : "bonos";

              return (
                <Link
                  key={item.id}
                  href={`/assets/${routePrefix}/${item.symbol}`}
                  className="flex items-center justify-between p-2 -mx-2 rounded-md hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{item.symbol}</span>
                      <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                        {item.name}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-medium text-sm">{formatCurrency(item.price)}</span>
                    <div
                      className={cn(
                        "flex items-center text-xs font-medium",
                        isPositive ? "text-green-600" : isNegative ? "text-red-600" : "text-muted-foreground"
                      )}
                    >
                      {isPositive ? (
                        <ArrowUpIcon className="mr-1 h-3 w-3" />
                      ) : isNegative ? (
                        <ArrowDownIcon className="mr-1 h-3 w-3" />
                      ) : null}
                      {formatPercent(Math.abs(item.variation))}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
