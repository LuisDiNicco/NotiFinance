import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IndicatorOption, IndicatorToggle } from "@/components/charts/IndicatorToggle";

const indicatorOptions: IndicatorOption[] = [
  { key: "sma20", label: "SMA 20" },
  { key: "sma50", label: "SMA 50" },
  { key: "sma200", label: "SMA 200" },
  { key: "ema12", label: "EMA 12" },
  { key: "ema26", label: "EMA 26" },
  { key: "bollinger", label: "Bollinger" },
  { key: "rsi", label: "RSI" },
  { key: "macd", label: "MACD" },
];

interface TechnicalIndicatorsProps {
  activeIndicators: string[];
  onToggle: (key: string, active: boolean) => void;
}

export function TechnicalIndicators({ activeIndicators, onToggle }: TechnicalIndicatorsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Indicadores Técnicos</CardTitle>
      </CardHeader>
      <CardContent>
        <IndicatorToggle indicators={indicatorOptions} activeIndicators={activeIndicators} onToggle={onToggle} />
      </CardContent>
    </Card>
  );
}
