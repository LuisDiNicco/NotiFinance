"use client";

import { useState } from "react";
import { useCreatePortfolio, usePortfolio } from "@/hooks/usePortfolio";
import { PortfolioSummary } from "@/components/portfolio/PortfolioSummary";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";

export default function PortfolioPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [portfolioName, setPortfolioName] = useState("");
  const [portfolioDescription, setPortfolioDescription] = useState("");
  const portfolioQuery = usePortfolio();
  const createPortfolioMutation = useCreatePortfolio();

  const portfolios = portfolioQuery.data ?? [];

  const highlightedPortfolio = portfolios[0] ?? null;

  const handleCreatePortfolio = async () => {
    const name = portfolioName.trim();
    if (!name) {
      toast.error("Ingresá un nombre para el portfolio");
      return;
    }

    try {
      await createPortfolioMutation.mutateAsync({
        name,
        description: portfolioDescription.trim() || undefined,
      });
      toast.success("Portfolio creado correctamente");
      setCreateDialogOpen(false);
      setPortfolioName("");
      setPortfolioDescription("");
    } catch {
      toast.error("No se pudo crear el portfolio");
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Mi Portafolio</h1>
          <p className="text-muted-foreground">
            Gestioná tus inversiones y analizá tus rendimientos.
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Crear portfolio
        </Button>
      </div>

      {portfolioQuery.isLoading ? (
        <div className="flex h-24 items-center justify-center rounded-md border text-sm text-muted-foreground">
          Cargando portfolios...
        </div>
      ) : portfolioQuery.isError ? (
        <div className="flex h-24 items-center justify-center rounded-md border text-sm text-destructive">
          No se pudieron cargar portfolios confiables. Reintentá en unos segundos.
        </div>
      ) : null}

      {highlightedPortfolio ? <PortfolioSummary portfolio={highlightedPortfolio} /> : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {portfolios.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              No tenés portfolios creados.
            </CardContent>
          </Card>
        ) : (
          portfolios.map((portfolio) => (
            <Card key={portfolio.id}>
              <CardHeader>
                <CardTitle>{portfolio.name}</CardTitle>
                <CardDescription>{portfolio.description ?? "Sin descripción"}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  Valor total: <span className="font-medium text-foreground">${portfolio.totalValue.toLocaleString("es-AR")}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  P&amp;L total: <span className="font-medium text-foreground">${portfolio.totalReturn.toLocaleString("es-AR")}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Variación: <span className="font-medium text-foreground">{portfolio.totalReturnPct.toFixed(2)}%</span>
                </div>
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/portfolio/${portfolio.id}`}>Ver detalle</Link>
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear portfolio</DialogTitle>
            <DialogDescription>Definí un nombre y descripción para tu nuevo portfolio.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="portfolio-name">Nombre</Label>
              <Input
                id="portfolio-name"
                placeholder="Ej: Largo plazo"
                value={portfolioName}
                onChange={(event) => setPortfolioName(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="portfolio-description">Descripción</Label>
              <Input
                id="portfolio-description"
                placeholder="Opcional"
                value={portfolioDescription}
                onChange={(event) => setPortfolioDescription(event.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreatePortfolio}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
