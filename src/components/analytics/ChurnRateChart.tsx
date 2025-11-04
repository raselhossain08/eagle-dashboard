'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';

interface ChurnData {
  date: string;
  churnRate: number;
  churnedCount: number;
}

interface ChurnRateChartProps {
  data?: ChurnData[];
  height?: number;
  showChurnedCount?: boolean;
}

export function ChurnRateChart({ 
  data = [], 
  height = 300,
  showChurnedCount = false 
}: ChurnRateChartProps) {
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
      churnRate: Number(item.churnRate) || 0,
      churnedCount: Number(item.churnedCount) || 0,
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
                {entry.name === 'Churn Rate' 
                  ? `${entry.value.toFixed(1)}%` 
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
          <p className="text-sm">No churn data available</p>
          <p className="text-xs mt-1">Churn data will appear as subscription patterns develop</p>
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
          dataKey="churnRate"
          stroke="hsl(var(--destructive))"
          strokeWidth={2}
          name="Churn Rate"
          dot={{ fill: 'hsl(var(--destructive))', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, fill: 'hsl(var(--destructive))' }}
        />
        {showChurnedCount && (
          <Line
            type="monotone"
            dataKey="churnedCount"
            stroke="hsl(var(--chart-3))"
            strokeWidth={2}
            name="Churned Count"
            dot={{ fill: 'hsl(var(--chart-3))', strokeWidth: 2, r: 4 }}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}