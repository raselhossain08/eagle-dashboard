"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useChannelPerformance } from "@/hooks/use-analytics-optimized";
import type { DateRange } from "@/store/dashboard-store";
import { useMemo } from "react";

interface OptimizedDonutChartProps {
  dateRange: DateRange;
  title: string;
  valueFormatter?: (value: number) => string;
  height?: number;
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

export function DonutChart({
  dateRange,
  title,
  valueFormatter = (value) => `${value}%`,
  height = 300,
}: OptimizedDonutChartProps) {
  const { data: channelData, isLoading } = useChannelPerformance(dateRange);

  const data = useMemo(() => {
    if (!channelData) return [];
    
    return channelData.map((item, index) => ({
      name: item.name,
      value: item.value,
      color: item.color || COLORS[index % COLORS.length]
    }));
  }, [channelData]);

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={80}
              innerRadius={40}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [valueFormatter(value), 'Value']}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}