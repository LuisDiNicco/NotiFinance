"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";

interface FavoriteButtonProps {
  initialFavorite?: boolean;
  onToggle?: (isFavorite: boolean) => void;
}

export function FavoriteButton({ initialFavorite = false, onToggle }: FavoriteButtonProps) {
  const { isAuthenticated } = useAuthStore();
  const [isFavorite, setIsFavorite] = useState(initialFavorite);

  const handleToggle = () => {
    if (!isAuthenticated) {
      toast.error("Inicia sesión para agregar favoritos");
      return;
    }

    const nextValue = !isFavorite;
    setIsFavorite(nextValue);
    onToggle?.(nextValue);
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      title={isAuthenticated ? "Agregar/Quitar de favoritos" : "Inicia sesión"}
      aria-label="favorite-toggle"
    >
      <Star className={cn("h-4 w-4", isFavorite ? "fill-yellow-400 text-yellow-500" : "text-muted-foreground")} />
    </Button>
  );
}
