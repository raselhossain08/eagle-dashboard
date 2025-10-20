"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ConversionFunnelData } from "@/lib/api/reports.service";

interface FunnelChartProps {
  data: ConversionFunnelData[];
  isLoading?: boolean;
}

export function FunnelChart({ data, isLoading = false }: FunnelChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="w-full h-16" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxCount = Math.max(...data.map(item => item.count ?? 0));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversion Funnel</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((step, index) => (
            <div key={`funnel-step-${index}-${step.step}`} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{step.step}</span>
                  <span className="text-sm text-muted-foreground">
                    {(step.count ?? 0).toLocaleString()} ({(step.conversionRate ?? 0).toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${((step.count ?? 0) / maxCount) * 100}%` }}
                  />
                </div>
                {index < data.length - 1 && (
                  <div className="text-xs text-muted-foreground mt-1 text-right">
                    Drop-off: {(step.dropOff ?? 0).toFixed(1)}%
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}