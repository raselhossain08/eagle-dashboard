'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface TopActionsChartProps {
  data: Array<{
    action: string;
    count: number;
    successRate: number;
  }>;
  isLoading?: boolean;
}

export function TopActionsChart({ data, isLoading }: TopActionsChartProps) {
  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />;
  }

  const chartData = data.slice(0, 10).map(item => ({
    ...item,
    name: item.action.split('.').pop() || item.action,
    failureRate: 100 - item.successRate
  }));

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis type="number" domain={[0, 100]} fontSize={12} />
          <YAxis 
            type="category" 
            dataKey="name" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
            width={80}
          />
          <Tooltip 
            formatter={(value, name) => {
              if (name === 'successRate') return [`${Number(value).toFixed(1)}%`, 'Success Rate'];
              if (name === 'failureRate') return [`${Number(value).toFixed(1)}%`, 'Failure Rate'];
              return [value, name];
            }}
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-background border rounded-lg shadow-lg p-3">
                    <p className="font-medium text-sm">{label}</p>
                    <p className="text-xs text-green-600">
                      Success: {data.successRate.toFixed(1)}%
                    </p>
                    <p className="text-xs text-red-600">
                      Failure: {data.failureRate.toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Total: {data.count.toLocaleString()}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend />
          <Bar 
            dataKey="successRate" 
            fill="#10b981" 
            name="Success Rate"
            radius={[0, 4, 4, 0]}
          />
          <Bar 
            dataKey="failureRate" 
            fill="#ef4444" 
            name="Failure Rate"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}