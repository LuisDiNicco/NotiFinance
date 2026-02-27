"use client";

import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MarketIndex } from "@/types/market";
import { formatPercent } from "@/lib/format";
import { ArrowDownIcon, ArrowUpIcon, MinusIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { createChart, ColorType, IChartApi, LineSeries } from "lightweight-charts";
import { useTheme } from "next-themes";

interface IndexCardProps {
  index: MarketIndex;
}

export function IndexCard({ index }: IndexCardProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const { theme, systemTheme } = useTheme();

  const isPositive = index.variation > 0;
  const isNegative = index.variation < 0;

  // Initialize chart
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
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      rightPriceScale: {
        visible: false,
      },
      timeScale: {
        visible: false,
      },
      crosshair: {
        vertLine: { visible: false },
        horzLine: { visible: false },
      },
      handleScroll: false,
      handleScale: false,
      height: 40,
    };

    const chart = createChart(chartContainerRef.current, chartOptions);
    chartRef.current = chart;

    const lineColor = isPositive ? "#16a34a" : isNegative ? "#dc2626" : "#71717a";
    
    const lineSeries = chart.addSeries(LineSeries, {
      color: lineColor,
      lineWidth: 2,
      crosshairMarkerVisible: false,
      lastValueVisible: false,
      priceLineVisible: false,
    });
    
    lineSeries.setData(index.history);
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
  }, [index.history, theme, systemTheme, isPositive, isNegative]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{index.name}</CardTitle>
        <div
          className={cn(
            "flex items-center text-xs font-medium",
            isPositive ? "text-green-600" : isNegative ? "text-red-600" : "text-muted-foreground"
          )}
        >
          {isPositive ? (
            <ArrowUpIcon className="mr-1 h-3 w-3" />
          ) : isNegative ? (
            <ArrowDownIcon className="mr-1 h-3 w-3" />
          ) : (
            <MinusIcon className="mr-1 h-3 w-3" />
          )}
          {formatPercent(Math.abs(index.variation))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">
          {index.value.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="mt-2 h-[40px] w-full" ref={chartContainerRef} />
      </CardContent>
    </Card>
  );
}

interface IndexCardsProps {
  indices: MarketIndex[];
}

export function IndexCards({ indices }: IndexCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {indices.map((index) => (
        <IndexCard key={index.symbol} index={index} />
      ))}
    </div>
  );
}
