"use client";

import { Holding } from "@/types/portfolio";
import { formatCurrency, formatPercent, formatNumber } from "@/lib/format";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface HoldingsTableProps {
  holdings: Holding[];
}

export function HoldingsTable({ holdings }: HoldingsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Activo</TableHead>
            <TableHead className="text-right">Cantidad</TableHead>
            <TableHead className="text-right">Precio Promedio</TableHead>
            <TableHead className="text-right">Precio Actual</TableHead>
            <TableHead className="text-right">Valor de Mercado</TableHead>
            <TableHead className="text-right">Rendimiento</TableHead>
            <TableHead className="text-right hidden md:table-cell">Peso</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {holdings.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                No hay activos en este portafolio.
              </TableCell>
            </TableRow>
          ) : (
            holdings.map((holding) => {
              const isPositive = holding.unrealizedPnl > 0;
              const isNegative = holding.unrealizedPnl < 0;

              return (
                <TableRow key={holding.assetId} className="group">
                  <TableCell>
                    <Link href={`/assets/${holding.ticker}`} className="flex flex-col">
                      <span className="font-medium group-hover:text-primary transition-colors">
                        {holding.ticker}
                      </span>
                      <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                        {holding.name}
                      </span>
                    </Link>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumber(holding.quantity)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatCurrency(holding.avgCostBasis)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(holding.currentPrice)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(holding.marketValue)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end">
                      <span
                        className={cn(
                          "inline-flex items-center font-medium",
                          isPositive ? "text-green-600" : isNegative ? "text-red-600" : "text-muted-foreground"
                        )}
                      >
                        {isPositive ? (
                          <ArrowUpIcon className="mr-1 h-3 w-3" />
                        ) : isNegative ? (
                          <ArrowDownIcon className="mr-1 h-3 w-3" />
                        ) : null}
                        {formatPercent(holding.unrealizedPnlPct)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatCurrency(holding.unrealizedPnl)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right hidden md:table-cell text-muted-foreground">
                    {formatNumber(holding.weight)}%
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
