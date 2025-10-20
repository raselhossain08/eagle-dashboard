// components/billing/plan-performance-chart.tsx
'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Users, DollarSign, TrendingDown } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface PlanPerformanceData {
  planName: string;
  subscribers: number;
  revenue: number;
  churnRate: number;
}

interface PlanPerformanceChartProps {
  data: PlanPerformanceData[];
  metric: 'subscribers' | 'revenue' | 'churnRate';
  isLoading?: boolean;
}

export function PlanPerformanceChart({ data, metric, isLoading }: PlanPerformanceChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Plan Performance</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  const getChartConfig = () => {
    switch (metric) {
      case 'subscribers':
        return {
          dataKey: 'subscribers',
          name: 'Subscribers',
          color: '#3b82f6',
          icon: Users,
          formatter: (value: number) => value.toString(),
        };
      case 'revenue':
        return {
          dataKey: 'revenue',
          name: 'Revenue',
          color: '#10b981',
          icon: DollarSign,
          formatter: formatCurrency,
        };
      case 'churnRate':
        return {
          dataKey: 'churnRate',
          name: 'Churn Rate (%)',
          color: '#ef4444',
          icon: TrendingDown,
          formatter: (value: number) => `${value}%`,
        };
      default:
        return {
          dataKey: 'subscribers',
          name: 'Subscribers',
          color: '#3b82f6',
          icon: Users,
          formatter: (value: number) => value.toString(),
        };
    }
  };

  const config = getChartConfig();
  const Icon = config.icon;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const planData = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-sm">
          <p className="font-medium">{label}</p>
          <p className="text-sm" style={{ color: config.color }}>
            {config.name}: {config.formatter(payload[0].value)}
          </p>
          {metric !== 'churnRate' && (
            <>
              <p className="text-sm text-gray-600">
                Subscribers: {planData.subscribers}
              </p>
              <p className="text-sm text-gray-600">
                Revenue: {formatCurrency(planData.revenue)}
              </p>
              <p className="text-sm text-gray-600">
                Churn Rate: {planData.churnRate}%
              </p>
            </>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Package className="h-5 w-5 mr-2" />
          Plan Performance
        </CardTitle>
        <CardDescription>
          Performance metrics across billing plans
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="planName" fontSize={12} angle={-45} textAnchor="end" height={80} />
            <YAxis fontSize={12} tickFormatter={config.formatter} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey={config.dataKey} 
              name={config.name} 
              fill={config.color} 
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}