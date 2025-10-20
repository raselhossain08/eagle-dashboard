// components/billing/mrr-trends-chart.tsx
'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MrrTrendData } from '@/types/billing';
import { formatCurrency } from '@/lib/utils';

interface MrrTrendsChartProps {
  data: MrrTrendData[];
  period: 'daily' | 'weekly' | 'monthly';
  isLoading?: boolean;
}

export function MrrTrendsChart({ data, period, isLoading }: MrrTrendsChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>MRR Trends</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  const formatTooltip = (value: number) => formatCurrency(value);
  const formatXAxis = (tickItem: string) => {
    const date = new Date(tickItem);
    if (period === 'daily') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else if (period === 'weekly') {
      return `Week ${date.getWeek()}`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>MRR Trends</CardTitle>
        <CardDescription>
          Monthly Recurring Revenue trends over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatXAxis}
              fontSize={12}
            />
            <YAxis 
              tickFormatter={formatTooltip}
              fontSize={12}
            />
            <Tooltip formatter={formatTooltip} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="currentMrr" 
              stroke="#3b82f6" 
              strokeWidth={2}
              name="Current MRR"
            />
            <Line 
              type="monotone" 
              dataKey="newMrr" 
              stroke="#10b981" 
              strokeWidth={2}
              name="New MRR"
            />
            <Line 
              type="monotone" 
              dataKey="churnedMrr" 
              stroke="#ef4444" 
              strokeWidth={2}
              name="Churned MRR"
            />
            <Line 
              type="monotone" 
              dataKey="netMrr" 
              stroke="#8b5cf6" 
              strokeWidth={3}
              strokeDasharray="5 5"
              name="Net MRR"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}