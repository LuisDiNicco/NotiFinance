interface AssetDetailPageProps {
  params: Promise<{ ticker: string }>;
}

export default async function AssetDetailPage({ params }: AssetDetailPageProps) {
  const { ticker } = await params;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">Detalle de {ticker}</h1>
    </main>
  );
}
