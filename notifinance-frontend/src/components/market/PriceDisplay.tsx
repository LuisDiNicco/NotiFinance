"use client";

import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

interface PriceDisplayProps {
  value: number;
  variation?: number;
  className?: string;
}

export function PriceDisplay({ value, variation = 0, className }: PriceDisplayProps) {
  const isPositive = variation > 0;
  const isNegative = variation < 0;

  return (
    <div className={cn("inline-flex items-center gap-1", className)}>
      <span>{formatCurrency(value)}</span>
      {isPositive ? <ArrowUpIcon className="h-3 w-3 text-green-600" /> : null}
      {isNegative ? <ArrowDownIcon className="h-3 w-3 text-red-600" /> : null}
    </div>
  );
}
