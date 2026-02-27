"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CountryRisk } from "@/types/market";
import { formatPercent } from "@/lib/format";
import { ArrowDownIcon, ArrowUpIcon, MinusIcon, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { createChart, ColorType, IChartApi, ISeriesApi, AreaSeries } from "lightweight-charts";
import { useTheme } from "next-themes";
import { useSocketContext } from "@/providers/SocketProvider";

interface RiskCountryCardProps {
  initialData: CountryRisk;
  historyData: { time: string; value: number }[];
}

export function RiskCountryCard({ initialData, historyData }: RiskCountryCardProps) {
  const [data, setData] = useState<CountryRisk>(initialData);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Area"> | null>(null);
  const { theme, systemTheme } = useTheme();
  const { marketSocket } = useSocketContext();

  const isPositive = data.changePct > 0;
  const isNegative = data.changePct < 0;

  // Handle real-time updates
  useEffect(() => {
    if (!marketSocket) return;

    const handleRiskUpdate = (newData: CountryRisk) => {
      setData(newData);
      
      // Update chart if we have a new data point
      if (seriesRef.current && newData.timestamp) {
        const date = new Date(newData.timestamp);
        const timeString = date.toISOString().split('T')[0];
        
        // Only add if it's a new day (lightweight-charts requires unique time points for daily data)
        // In a real app, we might use intraday data, but for this mock we'll just update the last point
        const lastPoint = historyData[historyData.length - 1];
        if (lastPoint && lastPoint.time === timeString) {
          seriesRef.current.update({ time: timeString, value: newData.value });
        } else {
          // If it's a new day, we'd add it, but for simplicity in this mock we just update the last one
          seriesRef.current.update({ time: lastPoint.time, value: newData.value });
        }
      }
    };

    marketSocket.on("market:risk", handleRiskUpdate);

    return () => {
      marketSocket.off("market:risk", handleRiskUpdate);
    };
  }, [marketSocket, historyData]);

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
      height: 60,
    };

    const chart = createChart(chartContainerRef.current, chartOptions);
    chartRef.current = chart;

    const areaSeries = chart.addSeries(AreaSeries, {
      lineColor: isNegative ? "#16a34a" : isPositive ? "#dc2626" : "#3b82f6", // Green if risk goes down, red if up
      topColor: isNegative ? "rgba(22, 163, 74, 0.2)" : isPositive ? "rgba(220, 38, 38, 0.2)" : "rgba(59, 130, 246, 0.2)",
      bottomColor: "rgba(0, 0, 0, 0)",
      lineWidth: 2,
    });
    
    seriesRef.current = areaSeries;
    areaSeries.setData(historyData);

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
  }, [historyData, theme, systemTheme, isPositive, isNegative]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Activity className="h-4 w-4 text-muted-foreground" />
          Riesgo País
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="flex items-baseline justify-between">
          <div className="text-3xl font-bold tracking-tighter">
            {data.value.toLocaleString("es-AR")} <span className="text-sm font-normal text-muted-foreground">pts</span>
          </div>
          <div
            className={cn(
              "flex items-center text-sm font-medium",
              isPositive ? "text-red-600" : isNegative ? "text-green-600" : "text-muted-foreground"
            )}
          >
            {isPositive ? (
              <ArrowUpIcon className="mr-1 h-4 w-4" />
            ) : isNegative ? (
              <ArrowDownIcon className="mr-1 h-4 w-4" />
            ) : (
              <MinusIcon className="mr-1 h-4 w-4" />
            )}
            {formatPercent(Math.abs(data.changePct))}
          </div>
        </div>
        <div className="mt-4 h-[60px] w-full" ref={chartContainerRef} />
      </CardContent>
    </Card>
  );
}
