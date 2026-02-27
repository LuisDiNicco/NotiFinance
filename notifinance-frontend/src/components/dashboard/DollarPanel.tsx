"use client";

import { useEffect, useState } from "react";
import { DollarCard } from "./DollarCard";
import { DollarQuote } from "@/types/market";
import { Skeleton } from "@/components/ui/skeleton";
import { useSocketContext } from "@/providers/SocketProvider";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Clock } from "lucide-react";

interface DollarPanelProps {
  initialData: DollarQuote[];
}

export function DollarPanel({ initialData }: DollarPanelProps) {
  const [quotes, setQuotes] = useState<DollarQuote[]>(initialData);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [timeAgo, setTimeAgo] = useState<string>("justo ahora");
  const { marketSocket } = useSocketContext();
  const [isConnected, setIsConnected] = useState(marketSocket?.connected ?? false);

  useEffect(() => {
    if (!marketSocket) return;

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    marketSocket.on("connect", onConnect);
    marketSocket.on("disconnect", onDisconnect);

    const handleDollarUpdate = (data: DollarQuote[]) => {
      setQuotes(data);
      setLastUpdated(new Date());
    };

    marketSocket.on("market:dollar", handleDollarUpdate);

    return () => {
      marketSocket.off("connect", onConnect);
      marketSocket.off("disconnect", onDisconnect);
      marketSocket.off("market:dollar", handleDollarUpdate);
    };
  }, [marketSocket]);

  useEffect(() => {
    const updateTimeAgo = () => {
      setTimeAgo(formatDistanceToNow(lastUpdated, { addSuffix: true, locale: es }));
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 60000);

    return () => clearInterval(interval);
  }, [lastUpdated]);

  if (!quotes || quotes.length === 0) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[100px] w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold tracking-tight">Cotizaciones del Dólar</h2>
        <div className="flex items-center text-xs text-muted-foreground">
          <Clock className="mr-1 h-3 w-3" />
          Actualizado {timeAgo}
          {isConnected && <span className="ml-2 flex h-2 w-2 rounded-full bg-green-500" title="Conectado en tiempo real" />}
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {quotes.map((quote) => (
          <DollarCard key={quote.type} quote={quote} />
        ))}
      </div>
    </div>
  );
}
