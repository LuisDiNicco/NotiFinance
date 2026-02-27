"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export interface IndicatorOption {
  key: string;
  label: string;
}

interface IndicatorToggleProps {
  indicators: IndicatorOption[];
  activeIndicators: string[];
  onToggle: (key: string, active: boolean) => void;
}

export function IndicatorToggle({ indicators, activeIndicators, onToggle }: IndicatorToggleProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {indicators.map((indicator) => {
        const checked = activeIndicators.includes(indicator.key);
        return (
          <div key={indicator.key} className="flex items-center space-x-2">
            <Checkbox id={indicator.key} checked={checked} onCheckedChange={(value) => onToggle(indicator.key, Boolean(value))} />
            <Label htmlFor={indicator.key}>{indicator.label}</Label>
          </div>
        );
      })}
    </div>
  );
}
