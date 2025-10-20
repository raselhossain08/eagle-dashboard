// components/billing/revenue-breakdown-chart.tsx
'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface RevenueBreakdownData {
  recurringRevenue: number;
  oneTimeRevenue: number;
  refunds: number;
}

interface RevenueBreakdownChartProps {
  data: RevenueBreakdownData;
  period: { from: Date; to: Date };
  isLoading?: boolean;
}

const COLORS = ['#3b82f6', '#10b981', '#ef4444'];

export function RevenueBreakdownChart({ data, period, isLoading }: RevenueBreakdownChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue Breakdown</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  const chartData = [
    { name: 'Recurring Revenue', value: data.recurringRevenue, color: COLORS[0] },
    { name: 'One-Time Revenue', value: data.oneTimeRevenue, color: COLORS[1] },
    { name: 'Refunds', value: Math.abs(data.refunds), color: COLORS[2] },
  ].filter(item => item.value > 0);

  const totalRevenue = chartData.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / totalRevenue) * 100).toFixed(1);
      
      return (
        <div className="bg-white p-3 border rounded-lg shadow-sm">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">
            {formatCurrency(data.value)} ({percentage}%)
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
          <DollarSign className="h-5 w-5 mr-2" />
          Revenue Breakdown
        </CardTitle>
        <CardDescription>
          Distribution of revenue by type
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => 
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <div className="flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm font-medium">Recurring</span>
            </div>
            <div className="text-lg font-bold">
              {formatCurrency(data.recurringRevenue)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium">One-Time</div>
            <div className="text-lg font-bold">
              {formatCurrency(data.oneTimeRevenue)}
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center">
              <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
              <span className="text-sm font-medium">Refunds</span>
            </div>
            <div className="text-lg font-bold text-red-600">
              -{formatCurrency(Math.abs(data.refunds))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}