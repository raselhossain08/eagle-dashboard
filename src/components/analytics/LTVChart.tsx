// components/analytics/LTVChart.tsx
'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';

interface LTVData {
  date: string;
  averageLTV: number;
  totalLTV: number;
  subscribers: number;
}

interface LTVChartProps {
  data?: LTVData[];
  height?: number;
  showTotalLTV?: boolean;
}

export function LTVChart({ 
  data = [], 
  height = 300,
  showTotalLTV = true 
}: LTVChartProps) {
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
      averageLTV: Number(item.averageLTV) || 0,
      totalLTV: Number(item.totalLTV) || 0,
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
                {entry.name.includes('LTV') 
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
          <p className="text-sm">No LTV data available</p>
          <p className="text-xs mt-1">Lifetime value data will appear as subscription history develops</p>
        </div>
      </div>
    );
  }

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
          dataKey="averageLTV"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          name="Average LTV"
          dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
        />
        {showTotalLTV && (
          <Line
            type="monotone"
            dataKey="totalLTV"
            stroke="hsl(var(--chart-2))"
            strokeWidth={2}
            name="Total LTV"
            dot={{ fill: 'hsl(var(--chart-2))', strokeWidth: 2, r: 4 }}
          />
        )}
        <Line
          type="monotone"
          dataKey="subscribers"
          stroke="hsl(var(--chart-3))"
          strokeWidth={2}
          name="Subscribers"
          dot={{ fill: 'hsl(var(--chart-3))', strokeWidth: 2, r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}