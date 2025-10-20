'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RevenueReport } from '@/types/reports';

interface RevenueChartProps {
  data: RevenueReport[];
  isLoading?: boolean;
  title?: string;
  description?: string;
}

export function RevenueChart({ data, isLoading, title = "Revenue Trend", description = "Revenue over time" }: RevenueChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-muted-foreground">Loading chart data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center border rounded-lg">
            <div className="text-muted-foreground">No revenue data available</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 flex items-center justify-center border rounded-lg">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Revenue Chart Visualization</p>
            <div className="space-y-2 text-sm">
              {data.slice(0, 5).map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span>{item.period}</span>
                  <span className="font-medium">
                    ${item.revenue.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}