"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DonutChartProps {
  title: string;
  data: Array<{ label: string; value: number }>;
}

export function DonutChart({ title, data }: DonutChartProps) {
  const total = data.reduce((acc, item) => acc + item.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin datos para mostrar.</p>
        ) : (
          data.map((item) => (
            <div key={item.label} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{item.label}</span>
                <span className="text-muted-foreground">{((item.value / total) * 100).toFixed(1)}%</span>
              </div>
              <div className="h-2 rounded bg-muted">
                <div className="h-2 rounded bg-primary" style={{ width: `${(item.value / total) * 100}%` }} />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
