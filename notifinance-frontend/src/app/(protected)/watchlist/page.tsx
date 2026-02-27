"use client";

import { useEffect, useMemo, useState } from "react";
import { mockWatchlist } from "@/services/mockMarketData";
import { WatchlistItem } from "@/types/market";
import { useAddWatchlistItem, useRemoveWatchlistItem, useWatchlist } from "@/hooks/useWatchlist";
import { formatCurrency, formatPercent } from "@/lib/format";
import { ArrowDownIcon, ArrowUpIcon, Trash2, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";
import { useSocket } from "@/hooks/useSocket";

export default function WatchlistPage() {
  const [fallbackItems, setFallbackItems] = useState<WatchlistItem[]>(mockWatchlist);
  const [searchTerm, setSearchTerm] = useState("");
  const [newTicker, setNewTicker] = useState("");
  const { marketSocket } = useSocket();
  const watchlistQuery = useWatchlist();
  const addWatchlistItemMutation = useAddWatchlistItem();
  const removeWatchlistItemMutation = useRemoveWatchlistItem();

  const usingFallback = watchlistQuery.isError;
  const [livePrices, setLivePrices] = useState<Record<string, { price: number; variation: number }>>({});

  const items = useMemo(() => {
    const base = usingFallback ? fallbackItems : (watchlistQuery.data ?? []);

    return base.map((item) => {
      const liveData = livePrices[item.symbol];
      return liveData
        ? { ...item, price: liveData.price, variation: liveData.variation }
        : item;
    });
  }, [fallbackItems, livePrices, usingFallback, watchlistQuery.data]);

  useEffect(() => {
    const handleQuote = (payload: { ticker: string; priceArs: number; changePct: number }) => {
      setLivePrices((prev) => ({
        ...prev,
        [payload.ticker]: {
          price: payload.priceArs,
          variation: payload.changePct,
        },
      }));
    };

    marketSocket.on("market:quote", handleQuote);
    return () => {
      marketSocket.off("market:quote", handleQuote);
    };
  }, [marketSocket]);

  const handleRemove = async (item: WatchlistItem) => {
    if (usingFallback) {
      setFallbackItems((prev) => prev.filter((entry) => entry.id !== item.id));
      toast.success("Activo eliminado de favoritos");
      return;
    }

    try {
      await removeWatchlistItemMutation.mutateAsync(item.symbol);
      toast.success("Activo eliminado de favoritos");
    } catch {
      toast.error("No se pudo eliminar el activo de favoritos");
    }
  };

  const handleAddTicker = async () => {
    const ticker = newTicker.trim().toUpperCase();
    if (!ticker) {
      return;
    }

    if (usingFallback) {
      const exists = fallbackItems.some((item) => item.symbol === ticker);
      if (exists) {
        toast.error("Ese activo ya está en tu watchlist");
        return;
      }

      setFallbackItems((prev) => [
        {
          id: `local-${ticker}`,
          symbol: ticker,
          name: ticker,
          type: "STOCK",
          price: 0,
          variation: 0,
        },
        ...prev,
      ]);
      setNewTicker("");
      toast.success("Activo agregado a favoritos");
      return;
    }

    try {
      await addWatchlistItemMutation.mutateAsync(ticker);
      setNewTicker("");
      toast.success("Activo agregado a favoritos");
    } catch {
      toast.error("No se pudo agregar el activo. Verificá el ticker.");
    }
  };

  const filteredItems = items.filter(
    (item) =>
      item.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Watchlist</h1>
          <p className="text-muted-foreground">
            Seguí de cerca tus activos favoritos
          </p>
        </div>
        <Button asChild>
          <Link href="/assets">
            <Plus className="mr-2 h-4 w-4" />
            Agregar Activo
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar en favoritos..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          placeholder="Agregar ticker (ej: GGAL)"
          value={newTicker}
          onChange={(e) => setNewTicker(e.target.value)}
          className="sm:max-w-xs"
        />
        <Button type="button" variant="secondary" onClick={handleAddTicker}>
          <Plus className="mr-2 h-4 w-4" />
          Agregar
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        {watchlistQuery.isLoading && !usingFallback ? (
          <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
            Cargando watchlist...
          </div>
        ) : null}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Activo</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Precio</TableHead>
              <TableHead className="text-right">Variación</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <p className="text-muted-foreground">No tenés favoritos.</p>
                      <Button variant="link" asChild>
                        <Link href="/assets">Explorar activos →</Link>
                      </Button>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No se encontraron resultados.</p>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{item.symbol}</span>
                      <span className="text-xs text-muted-foreground">
                        {item.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {item.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(item.price)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div
                      className={cn(
                        "flex items-center justify-end gap-1 text-sm font-medium",
                        item.variation > 0
                          ? "text-emerald-600 dark:text-emerald-500"
                          : item.variation < 0
                          ? "text-red-600 dark:text-red-500"
                          : "text-muted-foreground"
                      )}
                    >
                      {item.variation > 0 ? (
                        <ArrowUpIcon className="h-3 w-3" />
                      ) : item.variation < 0 ? (
                        <ArrowDownIcon className="h-3 w-3" />
                      ) : null}
                      {formatPercent(Math.abs(item.variation))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemove(item)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Eliminar</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
