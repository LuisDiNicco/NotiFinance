"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarQuote } from "@/types/market";
import { formatCurrency, formatPercent } from "@/lib/format";
import { ArrowDownIcon, ArrowUpIcon, MinusIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DollarCardProps {
  quote: DollarQuote;
}

export function DollarCard({ quote }: DollarCardProps) {
  // Calculate variation based on spread or mock it if not available
  const variation = quote.spread ? (quote.spread / (quote.buyPrice || 1)) * 100 : 0;
  const isPositive = variation > 0;
  const isNegative = variation < 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Dólar {quote.type}</CardTitle>
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
          ) : (
            <MinusIcon className="mr-1 h-3 w-3" />
          )}
          {formatPercent(Math.abs(variation))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-end">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Compra</span>
            <span className="text-lg font-bold">{quote.buyPrice ? formatCurrency(quote.buyPrice) : "-"}</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-xs text-muted-foreground">Venta</span>
            <span className="text-lg font-bold">{quote.sellPrice ? formatCurrency(quote.sellPrice) : "-"}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
