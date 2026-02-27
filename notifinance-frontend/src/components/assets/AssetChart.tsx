"use client";

import { useEffect, useRef } from "react";
import { createChart, ColorType, IChartApi, AreaSeries } from "lightweight-charts";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AssetChartProps {
  data: { time: string; value: number }[];
  isPositive: boolean;
}

export function AssetChart({ data, isPositive }: AssetChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const { theme, systemTheme } = useTheme();

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const currentTheme = theme === "system" ? systemTheme : theme;
    const isDark = currentTheme === "dark";

    const chartOptions = {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: isDark ? "#9ca3af" : "#71717a",
      },
      grid: {
        vertLines: { color: isDark ? "#27272a" : "#e4e4e7" },
        horzLines: { color: isDark ? "#27272a" : "#e4e4e7" },
      },
      rightPriceScale: {
        borderVisible: false,
      },
      timeScale: {
        borderVisible: false,
        timeVisible: true,
      },
      crosshair: {
        mode: 1, // Normal mode
      },
      height: 400,
    };

    const chart = createChart(chartContainerRef.current, chartOptions);
    chartRef.current = chart;

    const areaSeries = chart.addSeries(AreaSeries, {
      lineColor: isPositive ? "#16a34a" : "#dc2626",
      topColor: isPositive ? "rgba(22, 163, 74, 0.2)" : "rgba(220, 38, 38, 0.2)",
      bottomColor: "rgba(0, 0, 0, 0)",
      lineWidth: 2,
    });
    
    areaSeries.setData(data);
    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [data, theme, systemTheme, isPositive]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gráfico Histórico</CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={chartContainerRef} className="w-full" />
      </CardContent>
    </Card>
  );
}
