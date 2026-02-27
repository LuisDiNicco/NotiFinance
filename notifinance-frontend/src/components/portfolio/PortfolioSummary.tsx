"use client";

import { Portfolio } from "@/types/portfolio";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercent } from "@/lib/format";
import { ArrowDownIcon, ArrowUpIcon, Briefcase, TrendingUp, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface PortfolioSummaryProps {
  portfolio: Portfolio;
}

export function PortfolioSummary({ portfolio }: PortfolioSummaryProps) {
  const isTotalPositive = portfolio.totalReturn >= 0;
  const isDailyPositive = portfolio.dailyReturn >= 0;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(portfolio.totalValue)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Actualizado al cierre de mercado
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Rendimiento Total</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(portfolio.totalReturn)}</div>
          <div
            className={cn(
              "flex items-center text-xs font-medium mt-1",
              isTotalPositive ? "text-green-600" : "text-red-600"
            )}
          >
            {isTotalPositive ? (
              <ArrowUpIcon className="mr-1 h-3 w-3" />
            ) : (
              <ArrowDownIcon className="mr-1 h-3 w-3" />
            )}
            {formatPercent(portfolio.totalReturnPct)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Rendimiento Diario</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(portfolio.dailyReturn)}</div>
          <div
            className={cn(
              "flex items-center text-xs font-medium mt-1",
              isDailyPositive ? "text-green-600" : "text-red-600"
            )}
          >
            {isDailyPositive ? (
              <ArrowUpIcon className="mr-1 h-3 w-3" />
            ) : (
              <ArrowDownIcon className="mr-1 h-3 w-3" />
            )}
            {formatPercent(portfolio.dailyReturnPct)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
