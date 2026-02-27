import { notFound } from "next/navigation";
import { mockAssets, mockAssetHistory } from "@/services/mockAssetsData";
import { AssetDetailView } from "@/components/asset-detail/AssetDetailView";

interface AssetDetailPageProps {
  params: Promise<{ ticker: string }>;
}

export default async function AssetDetailPage({ params }: AssetDetailPageProps) {
  const { ticker } = await params;
  
  const asset = mockAssets.find((a) => a.symbol.toUpperCase() === ticker.toUpperCase());
  
  if (!asset) {
    notFound();
  }

  const relatedAssets = mockAssets.filter((item) => item.id !== asset.id && item.type === asset.type);

  return <AssetDetailView asset={asset} history={mockAssetHistory} relatedAssets={relatedAssets} />;
}
