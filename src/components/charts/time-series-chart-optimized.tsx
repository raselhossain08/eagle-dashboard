"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEventTrends, useRevenueAnalytics } from "@/hooks/use-analytics-optimized";
import type { DateRange } from "@/store/dashboard-store";
import { useMemo } from "react";

interface OptimizedTimeSeriesChartProps {
  dateRange: DateRange;
  title: string;
  type?: 'sessions' | 'pageviews' | 'revenue';
  valueFormatter?: (value: number) => string;
  height?: number;
  color?: string;
}

export function TimeSeriesChart({
  dateRange,
  title,
  type = 'sessions',
  valueFormatter = (value) => value.toString(),
  height = 300,
  color = '#3b82f6',
}: OptimizedTimeSeriesChartProps) {
  // Load data based on type
  const { data: eventTrends, isLoading: trendsLoading } = useEventTrends(dateRange);
  const { data: revenueData, isLoading: revenueLoading } = useRevenueAnalytics(dateRange);

  const { data, isLoading } = useMemo(() => {
    switch (type) {
      case 'sessions':
        return {
          data: eventTrends?.map(item => ({ 
            date: item.date, 
            value: item.sessions || 0
          })) || [],
          isLoading: trendsLoading
        };
      case 'pageviews':
        return {
          data: eventTrends?.map(item => ({ 
            date: item.date, 
            value: item.events || 0
          })) || [],
          isLoading: trendsLoading
        };
      case 'revenue':
        return {
          data: revenueData?.trends?.map(item => ({ 
            date: item.date, 
            value: item.revenue || 0
          })) || [],
          isLoading: revenueLoading
        };
      default:
        return { data: [], isLoading: false };
    }
  }, [type, eventTrends, revenueData, trendsLoading, revenueLoading]);

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
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}