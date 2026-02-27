"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { MarketStatus } from "@/types/market";
import { Clock } from "lucide-react";

interface MarketStatusBadgeProps {
  status: MarketStatus;
}

export function MarketStatusBadge({ status }: MarketStatusBadgeProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const nextChangeDate = new Date(status.nextChange);
      const distance = formatDistanceToNow(nextChangeDate, { locale: es });
      setTimeRemaining(`${status.isOpen ? "Cierra" : "Abre"} en ${distance}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [status]);

  return (
    <div className="flex items-center gap-2">
      <Badge variant={status.isOpen ? "default" : "destructive"} className={status.isOpen ? "bg-green-600 hover:bg-green-700" : ""}>
        {status.isOpen ? "Mercado Abierto" : "Mercado Cerrado"}
      </Badge>
      <span className="text-xs text-muted-foreground flex items-center gap-1">
        <Clock className="h-3 w-3" />
        {timeRemaining}
      </span>
    </div>
  );
}
