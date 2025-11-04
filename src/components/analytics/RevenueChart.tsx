// components/analytics/RevenueChart.tsx
'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { format, parseISO } from 'date-fns';

interface RevenueData {
  date: string;
  revenue: number;
  subscribers: number;
}

interface RevenueChartProps {
  data?: RevenueData[];
  height?: number;
  chartType?: 'area' | 'bar';
  showSubscribers?: boolean;
}

export function RevenueChart({ 
  data = [], 
  height = 300, 
  chartType = 'area',
  showSubscribers = true 
}: RevenueChartProps) {
  // Process data to ensure proper formatting
  const processedData = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return data.map((item, index) => ({
      ...item,
      date: item.date,
      formattedDate: (() => {
        try {
          return format(parseISO(item.date), 'MMM dd');
        } catch {
          return `Period ${index + 1}`;
        }
      })(),
      revenue: Number(item.revenue) || 0,
      subscribers: Number(item.subscribers) || 0,
    }));
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg shadow-md p-3">
          <p className="font-medium text-sm mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex justify-between items-center gap-4">
              <span 
                className="text-sm"
                style={{ color: entry.color }}
              >
                {entry.name}:
              </span>
              <span className="font-medium text-sm">
                {entry.name === 'Revenue' 
                  ? `$${entry.value.toLocaleString()}` 
                  : entry.value.toLocaleString()
                }
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!processedData || processedData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <div className="text-center">
          <p className="text-sm">No revenue data available</p>
          <p className="text-xs mt-1">Revenue data will appear as subscriptions are processed</p>
        </div>
      </div>
    );
  }

  if (chartType === 'bar') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={processedData}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="formattedDate" 
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: 'currentColor', strokeWidth: 1 }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: 'currentColor', strokeWidth: 1 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="revenue" 
            fill="hsl(var(--primary))" 
            name="Revenue"
            radius={[4, 4, 0, 0]}
          />
          {showSubscribers && (
            <Bar 
              dataKey="subscribers" 
              fill="hsl(var(--chart-2))" 
              name="Subscribers"
              radius={[4, 4, 0, 0]}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={processedData}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis 
          dataKey="formattedDate" 
          tick={{ fontSize: 12 }}
          tickLine={{ stroke: 'currentColor', strokeWidth: 1 }}
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          tickLine={{ stroke: 'currentColor', strokeWidth: 1 }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="hsl(var(--primary))"
          fill="hsl(var(--primary))"
          fillOpacity={0.3}
          strokeWidth={2}
          name="Revenue"
        />
        {showSubscribers && (
          <Area
            type="monotone"
            dataKey="subscribers"
            stroke="hsl(var(--chart-2))"
            fill="hsl(var(--chart-2))"
            fillOpacity={0.2}
            strokeWidth={2}
            name="Subscribers"
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}