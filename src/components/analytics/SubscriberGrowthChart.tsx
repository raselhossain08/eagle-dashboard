// components/analytics/SubscriberGrowthChart.tsx
'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { format, parseISO } from 'date-fns';

interface GrowthData {
  date: string;
  newSubscribers: number;
  totalSubscribers: number;
  growthRate: number;
}

interface SubscriberGrowthChartProps {
  data?: GrowthData[];
  height?: number;
  showGrowthRate?: boolean;
  chartType?: 'line' | 'area';
}

export function SubscriberGrowthChart({ 
  data = [], 
  height = 300,
  showGrowthRate = false,
  chartType = 'area'
}: SubscriberGrowthChartProps) {
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
          return `Day ${index + 1}`;
        }
      })(),
      newSubscribers: Number(item.newSubscribers) || 0,
      totalSubscribers: Number(item.totalSubscribers) || 0,
      growthRate: Number(item.growthRate) || 0,
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
                {entry.name === 'Growth Rate' ? `${entry.value}%` : entry.value.toLocaleString()}
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
          <p className="text-sm">No growth data available</p>
          <p className="text-xs mt-1">Data will appear when subscribers are added</p>
        </div>
      </div>
    );
  }

  if (chartType === 'line') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={processedData}>
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
          <Line
            type="monotone"
            dataKey="totalSubscribers"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            name="Total Subscribers"
            dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
          />
          <Line
            type="monotone"
            dataKey="newSubscribers"
            stroke="hsl(var(--chart-2))"
            strokeWidth={2}
            name="New Subscribers"
            dot={{ fill: 'hsl(var(--chart-2))', strokeWidth: 2, r: 4 }}
          />
          {showGrowthRate && (
            <Line
              type="monotone"
              dataKey="growthRate"
              stroke="hsl(var(--chart-3))"
              strokeWidth={2}
              name="Growth Rate"
              dot={{ fill: 'hsl(var(--chart-3))', strokeWidth: 2, r: 4 }}
            />
          )}
        </LineChart>
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
          dataKey="totalSubscribers"
          stroke="hsl(var(--primary))"
          fill="hsl(var(--primary))"
          fillOpacity={0.3}
          strokeWidth={2}
          name="Total Subscribers"
        />
        <Area
          type="monotone"
          dataKey="newSubscribers"
          stroke="hsl(var(--chart-2))"
          fill="hsl(var(--chart-2))"
          fillOpacity={0.2}
          strokeWidth={2}
          name="New Subscribers"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}