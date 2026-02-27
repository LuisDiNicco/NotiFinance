"use client";

import { cn } from "@/lib/utils";
import { formatPercent } from "@/lib/format";

interface PercentBadgeProps {
  value: number;
  className?: string;
}

export function PercentBadge({ value, className }: PercentBadgeProps) {
  const isPositive = value > 0;
  const isNegative = value < 0;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        isPositive ? "bg-green-500/10 text-green-600" : isNegative ? "bg-red-500/10 text-red-600" : "bg-muted text-muted-foreground",
        className,
      )}
    >
      {formatPercent(value)}
    </span>
  );
}
