'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ActivityTrendsChartProps {
  data: Array<{
    timestamp: string;
    successful: number;
    failed: number;
    total: number;
  }>;
  groupBy: 'hour' | 'day' | 'week' | 'month';
  isLoading?: boolean;
}

export function ActivityTrendsChart({ data, groupBy, isLoading }: ActivityTrendsChartProps) {
  const formatXAxis = (tickItem: string) => {
    const date = new Date(tickItem);
    
    switch (groupBy) {
      case 'hour':
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      case 'day':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case 'week':
        return `Week ${date.getWeek()}`;
      case 'month':
        return date.toLocaleDateString('en-US', { month: 'short' });
      default:
        return tickItem;
    }
  };

  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />;
  }

  const chartData = data.map(item => ({
    ...item,
    name: formatXAxis(item.timestamp),
    successRate: item.total > 0 ? (item.successful / item.total) * 100 : 0
  }));

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="name" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip 
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-background border rounded-lg shadow-lg p-3">
                    <p className="font-medium text-sm">{label}</p>
                    {payload.map((entry, index) => (
                      <p key={index} className="text-xs" style={{ color: entry.color }}>
                        {entry.name}: {entry.value?.toLocaleString()}
                      </p>
                    ))}
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="successful" 
            stroke="#10b981" 
            strokeWidth={2}
            name="Successful"
            dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
          />
          <Line 
            type="monotone" 
            dataKey="failed" 
            stroke="#ef4444" 
            strokeWidth={2}
            name="Failed"
            dot={{ fill: '#ef4444', strokeWidth: 2, r: 3 }}
          />
          <Line 
            type="monotone" 
            dataKey="total" 
            stroke="#3b82f6" 
            strokeWidth={2}
            name="Total"
            strokeDasharray="3 3"
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// Add week utility to Date prototype
declare global {
  interface Date {
    getWeek(): number;
  }
}

Date.prototype.getWeek = function() {
  const date = new Date(this.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  const week1 = new Date(date.getFullYear(), 0, 4);
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
};