"use client";

import { useState } from "react";
import { Asset } from "@/types/market";
import { Button } from "@/components/ui/button";
import { Bell, Star, StarOff } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";

interface AssetActionsProps {
  asset: Asset;
}

export function AssetActions({ asset }: AssetActionsProps) {
  const { isAuthenticated } = useAuthStore();
  const [isWatchlisted, setIsWatchlisted] = useState(false);

  const handleToggleWatchlist = () => {
    if (!isAuthenticated) {
      toast.error("Debes iniciar sesión para agregar a tu watchlist");
      return;
    }
    
    setIsWatchlisted(!isWatchlisted);
    if (!isWatchlisted) {
      toast.success(`${asset.symbol} agregado a tu watchlist`);
    } else {
      toast.info(`${asset.symbol} removido de tu watchlist`);
    }
  };

  const handleCreateAlert = () => {
    if (!isAuthenticated) {
      toast.error("Debes iniciar sesión para crear alertas");
      return;
    }
    
    toast.success(`Redirigiendo para crear alerta de ${asset.symbol}...`);
    // In a real app, this would open a modal or redirect to the alerts page
  };

  return (
    <div className="flex gap-2">
      <Button 
        variant={isWatchlisted ? "secondary" : "outline"} 
        size="sm" 
        onClick={handleToggleWatchlist}
        className="gap-2"
      >
        {isWatchlisted ? (
          <>
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>En Watchlist</span>
          </>
        ) : (
          <>
            <StarOff className="h-4 w-4" />
            <span>Agregar a Watchlist</span>
          </>
        )}
      </Button>
      
      <Button 
        variant="default" 
        size="sm" 
        onClick={handleCreateAlert}
        className="gap-2"
      >
        <Bell className="h-4 w-4" />
        <span>Crear Alerta</span>
      </Button>
    </div>
  );
}
