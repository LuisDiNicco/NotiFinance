"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const PERIODS = ["1D", "5D", "1M", "3M", "6M", "1Y", "5Y", "MAX"] as const;
export type ChartPeriod = (typeof PERIODS)[number];

interface PeriodSelectorProps {
  value: ChartPeriod;
  onChange: (period: ChartPeriod) => void;
}

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {PERIODS.map((period) => (
        <Button
          key={period}
          type="button"
          variant="outline"
          size="sm"
          className={cn(value === period ? "bg-primary text-primary-foreground" : "")}
          onClick={() => onChange(period)}
        >
          {period}
        </Button>
      ))}
    </div>
  );
}
