"use client";

import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface BarChartProps {
  data: Array<{ name: string; value: number; category?: string }>;
  title: string;
  orientation?: 'horizontal' | 'vertical';
  valueFormatter?: (value: number) => string;
  isLoading?: boolean;
  colors?: string[];
}

export function BarChart({
  data,
  title,
  orientation = 'vertical',
  valueFormatter = (value) => value.toString(),
  isLoading = false,
  colors = ['#3b82f6', '#ef4444', '#10b981'],
}: BarChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="w-full h-64" />
        </CardContent>
      </Card>
    );
  }

  const categories = [...new Set(data.map(item => item.category))].filter(Boolean) as string[];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RechartsBarChart
            data={data}
            layout={orientation === 'horizontal' ? 'vertical' : 'horizontal'}
          >
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            {orientation === 'horizontal' ? (
              <>
                <XAxis type="number" tickFormatter={valueFormatter} />
                <YAxis type="category" dataKey="name" width={80} />
              </>
            ) : (
              <>
                <XAxis dataKey="name" />
                <YAxis tickFormatter={valueFormatter} />
              </>
            )}
            <Tooltip formatter={(value: number) => [valueFormatter(value), 'Value']} />
            {categories.length > 0 ? (
              categories.map((category, index) => (
                <Bar
                  key={category}
                  dataKey="value"
                  data={data.filter(item => item.category === category)}
                  name={category}
                  fill={colors[index % colors.length]}
                />
              ))
            ) : (
              <Bar dataKey="value" fill={colors[0]} />
            )}
            {categories.length > 1 && <Legend />}
          </RechartsBarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}