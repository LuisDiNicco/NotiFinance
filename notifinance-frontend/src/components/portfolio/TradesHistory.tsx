"use client";

import { Trade } from "@/types/portfolio";
import { formatCurrency, formatNumber, formatDate } from "@/lib/format";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface TradesHistoryProps {
  trades: Trade[];
}

export function TradesHistory({ trades }: TradesHistoryProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Activo</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead className="text-right">Cantidad</TableHead>
            <TableHead className="text-right">Precio</TableHead>
            <TableHead className="text-right">Comisión</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trades.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                No hay operaciones registradas.
              </TableCell>
            </TableRow>
          ) : (
            trades.map((trade) => {
              const isBuy = trade.tradeType === "BUY";
              const total = trade.quantity * trade.pricePerUnit + (trade.commission || 0);

              return (
                <TableRow key={trade.id}>
                  <TableCell className="text-muted-foreground">
                    {formatDate(trade.executedAt)}
                  </TableCell>
                  <TableCell className="font-medium">{trade.ticker}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "px-2 py-1 rounded-md text-xs font-medium",
                        isBuy
                          ? "bg-green-500/10 text-green-600"
                          : "bg-red-500/10 text-red-600"
                      )}
                    >
                      {isBuy ? "COMPRA" : "VENTA"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumber(trade.quantity)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(trade.pricePerUnit)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {trade.commission ? formatCurrency(trade.commission) : "-"}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(total)}
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
