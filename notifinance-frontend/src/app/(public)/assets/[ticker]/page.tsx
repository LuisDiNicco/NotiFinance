"use client";

import { AssetDetailView } from "@/components/asset-detail/AssetDetailView";
import { useParams } from "next/navigation";
import { useAssetDetail } from "@/hooks/useAsset";

export default function AssetDetailPage() {
  const params = useParams<{ ticker: string }>();
  const ticker = params?.ticker ?? "";
  const { data, isLoading, isError } = useAssetDetail(ticker);

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 p-6">
        <h1 className="text-2xl font-bold tracking-tight">Cargando activo...</h1>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 p-6">
        <h1 className="text-2xl font-bold tracking-tight">Error al cargar datos</h1>
        <p className="text-destructive">No se pudo obtener información confiable para este activo.</p>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 p-6">
        <h1 className="text-2xl font-bold tracking-tight">Activo no encontrado</h1>
      </main>
    );
  }

  return <AssetDetailView asset={data.asset} history={data.history} relatedAssets={data.relatedAssets} />;
}
