// components/billing/revenue-timeline-chart.tsx
'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface RevenueTimelineData {
  date: string;
  revenue: number;
  recurring: number;
  oneTime: number;
}

interface RevenueTimelineChartProps {
  data: RevenueTimelineData[];
  period: 'daily' | 'weekly' | 'monthly';
  isLoading?: boolean;
}

export function RevenueTimelineChart({ data, period, isLoading }: RevenueTimelineChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue Timeline</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  const formatXAxis = (tickItem: string) => {
    const date = new Date(tickItem);
    if (period === 'daily') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else if (period === 'weekly') {
      return `W${date.getWeek()}`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short' });
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-sm">
          <p className="font-medium">{formatXAxis(label)}</p>
          <p className="text-sm text-blue-600">
            Total: {formatCurrency(payload[0].value)}
          </p>
          <p className="text-sm text-green-600">
            Recurring: {formatCurrency(payload[1].value)}
          </p>
          <p className="text-sm text-purple-600">
            One-Time: {formatCurrency(payload[2].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          Revenue Timeline
        </CardTitle>
        <CardDescription>
          Revenue trends over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="min-h-[350px]">
          <ResponsiveContainer width="100%" height={350} minHeight={300}>
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatXAxis}
              fontSize={12}
            />
            <YAxis 
              tickFormatter={(value) => formatCurrency(value)}
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stackId="1"
              stroke="#3b82f6" 
              fill="#3b82f6"
              fillOpacity={0.6}
              name="Total Revenue"
            />
            <Area 
              type="monotone" 
              dataKey="recurring" 
              stackId="1"
              stroke="#10b981" 
              fill="#10b981"
              fillOpacity={0.6}
              name="Recurring Revenue"
            />
            <Area 
              type="monotone" 
              dataKey="oneTime" 
              stackId="1"
              stroke="#8b5cf6" 
              fill="#8b5cf6"
              fillOpacity={0.6}
              name="One-Time Revenue"
            />
          </AreaChart>
        </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}