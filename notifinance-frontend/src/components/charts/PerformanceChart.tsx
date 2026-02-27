"use client";

import { PortfolioChart } from "@/components/portfolio/PortfolioChart";

interface PerformanceChartProps {
  data: { time: string; value: number }[];
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  return <PortfolioChart data={data} />;
}
