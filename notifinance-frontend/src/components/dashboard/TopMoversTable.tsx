"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TopMover } from "@/types/market";
import { formatCurrency, formatPercent } from "@/lib/format";
import { ArrowDownIcon, ArrowUpIcon, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface TopMoversTableProps {
  data: {
    acciones: { gainers: TopMover[]; losers: TopMover[] };
    cedears: { gainers: TopMover[]; losers: TopMover[] };
  };
}

export function TopMoversTable({ data }: TopMoversTableProps) {
  const [assetType, setAssetType] = useState<"acciones" | "cedears">("acciones");
  const [trendType, setTrendType] = useState<"gainers" | "losers">("gainers");

  const currentData = data[assetType][trendType];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Top Movers
          </CardTitle>
          <Tabs value={assetType} onValueChange={(v) => setAssetType(v as "acciones" | "cedears")} className="w-[200px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="acciones">Acciones</TabsTrigger>
              <TabsTrigger value="cedears">CEDEARs</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <Tabs value={trendType} onValueChange={(v) => setTrendType(v as "gainers" | "losers")} className="w-full mb-4">
          <TabsList className="grid w-full grid-cols-2 h-8">
            <TabsTrigger value="gainers" className="text-xs data-[state=active]:text-green-600">
              Mejores
            </TabsTrigger>
            <TabsTrigger value="losers" className="text-xs data-[state=active]:text-red-600">
              Peores
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="rounded-md border flex-1 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Activo</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead className="text-right">Var %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentData.map((item) => {
                const isPositive = item.variation > 0;
                const isNegative = item.variation < 0;
                const routePrefix = item.type === "STOCK" ? "acciones" : "cedears";

                return (
                  <TableRow key={item.symbol} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <Link href={`/assets/${routePrefix}/${item.symbol}`} className="block">
                        <div className="font-medium">{item.symbol}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[120px] sm:max-w-[200px]">
                          {item.name}
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(item.price)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div
                        className={cn(
                          "inline-flex items-center justify-end text-sm font-medium",
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
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
