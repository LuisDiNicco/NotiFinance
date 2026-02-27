import { AssetsTable } from "@/components/assets/AssetsTable";
import { mockAssets } from "@/services/mockAssetsData";

export default function AssetsPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Explorador de Activos</h1>
        <p className="text-muted-foreground">
          Buscá y analizá acciones, CEDEARs, bonos y fondos comunes de inversión.
        </p>
      </div>
      
      <AssetsTable initialData={mockAssets} />
    </main>
  );
}
