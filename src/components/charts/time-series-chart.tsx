"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface TimeSeriesChartProps {
  data: Array<{ date: string; value: number; category?: string }>;
  title: string;
  valueFormatter?: (value: number) => string;
  height?: number;
  showLegend?: boolean;
  colors?: string[];
  isLoading?: boolean;
}

export function TimeSeriesChart({
  data,
  title,
  valueFormatter = (value) => value.toString(),
  height = 300,
  showLegend = false,
  colors = ['#3b82f6', '#ef4444', '#10b981'],
  isLoading = false,
}: TimeSeriesChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="w-full" style={{ height: `${height}px` }} />
        </CardContent>
      </Card>
    );
  }

  // Group data by category if present
  const categories = [...new Set(data.map(item => item.category))].filter(Boolean) as string[];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="date" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={valueFormatter}
            />
            <Tooltip
              formatter={(value: number) => [valueFormatter(value), 'Value']}
              labelFormatter={(label) => `Date: ${label}`}
            />
            {showLegend && <Legend />}
            {categories.length > 0 ? (
              categories.map((category, index) => (
                <Line
                  key={category}
                  type="monotone"
                  dataKey="value"
                  data={data.filter(item => item.category === category)}
                  name={category}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  dot={false}
                />
              ))
            ) : (
              <Line
                type="monotone"
                dataKey="value"
                stroke={colors[0]}
                strokeWidth={2}
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}