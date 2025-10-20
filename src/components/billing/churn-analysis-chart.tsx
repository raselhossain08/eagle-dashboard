// components/billing/churn-analysis-chart.tsx
'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, TrendingDown } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface ChurnAnalysisData {
  period: string;
  churnRate: number;
  churnedMrr: number;
  churnedCustomers: number;
}

interface ChurnAnalysisChartProps {
  data: ChurnAnalysisData[];
  isLoading?: boolean;
}

export function ChurnAnalysisChart({ data, isLoading }: ChurnAnalysisChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Churn Analysis</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-sm">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-red-600">
            Churn Rate: {payload[0].value}%
          </p>
          <p className="text-sm text-orange-600">
            Churned MRR: {formatCurrency(payload[1].value)}
          </p>
          <p className="text-sm text-purple-600">
            Churned Customers: {payload[2].value}
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
          <TrendingDown className="h-5 w-5 mr-2" />
          Churn Analysis
        </CardTitle>
        <CardDescription>
          Customer churn trends and impact
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" fontSize={12} />
            <YAxis yAxisId="left" fontSize={12} />
            <YAxis yAxisId="right" orientation="right" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              yAxisId="left"
              dataKey="churnRate" 
              name="Churn Rate (%)" 
              fill="#ef4444" 
              radius={[2, 2, 0, 0]}
            />
            <Bar 
              yAxisId="right"
              dataKey="churnedMrr" 
              name="Churned MRR" 
              fill="#f97316" 
              radius={[2, 2, 0, 0]}
            />
            <Bar 
              yAxisId="left"
              dataKey="churnedCustomers" 
              name="Churned Customers" 
              fill="#8b5cf6" 
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}