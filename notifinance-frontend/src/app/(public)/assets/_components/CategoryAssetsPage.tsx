import { AssetsTable } from "@/components/assets/AssetsTable";
import { mockAssets } from "@/services/mockAssetsData";

interface CategoryAssetsPageProps {
  title: string;
  types: string[];
}

export function CategoryAssetsPage({ title, types }: CategoryAssetsPageProps) {
  const filteredAssets = mockAssets.filter((asset) => types.includes(asset.type));

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">Listado de {title.toLowerCase()} disponibles.</p>
      </div>
      <AssetsTable initialData={filteredAssets} />
    </main>
  );
}
