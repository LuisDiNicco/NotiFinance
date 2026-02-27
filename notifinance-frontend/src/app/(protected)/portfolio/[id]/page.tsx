import { PortfolioDetailClient } from "@/components/portfolio/PortfolioDetailClient";

interface PortfolioDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PortfolioDetailPage({ params }: PortfolioDetailPageProps) {
  const { id } = await params;
  return <PortfolioDetailClient portfolioId={id} />;
}
