import { AssetsTable } from "@/components/assets/AssetsTable";
import { mockAssets } from "@/services/mockAssetsData";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

export default function AssetsPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Explorador de Activos</h1>
        <p className="text-muted-foreground">
          Buscá y analizá acciones, CEDEARs, bonos y fondos comunes de inversión.
        </p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all" asChild>
            <Link href="/assets">Todos</Link>
          </TabsTrigger>
          <TabsTrigger value="stocks" asChild>
            <Link href="/assets/acciones">Acciones</Link>
          </TabsTrigger>
          <TabsTrigger value="cedears" asChild>
            <Link href="/assets/cedears">CEDEARs</Link>
          </TabsTrigger>
          <TabsTrigger value="bonds" asChild>
            <Link href="/assets/bonos">Bonos</Link>
          </TabsTrigger>
          <TabsTrigger value="lecaps" asChild>
            <Link href="/assets/lecaps">LECAPs</Link>
          </TabsTrigger>
          <TabsTrigger value="ons" asChild>
            <Link href="/assets/ons">ONs</Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <AssetsTable initialData={mockAssets} />
    </main>
  );
}
