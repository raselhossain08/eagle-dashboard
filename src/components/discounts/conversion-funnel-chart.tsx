// components/discounts/conversion-funnel-chart.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface ConversionFunnelChartProps {
  data: Array<{
    step: string;
    count: number;
    conversionRate?: number;
  }>;
  isLoading?: boolean;
}

export function ConversionFunnelChart({ data, isLoading }: ConversionFunnelChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const funnelData = data.map((step, index, array) => ({
    ...step,
    conversionRate: step.conversionRate || (index === 0 ? 100 : (step.count / array[0].count) * 100),
    dropoff: index > 0 ? ((array[index - 1].count - step.count) / array[index - 1].count) * 100 : 0
  }));

  return (
    <div className="space-y-6">
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={funnelData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="step" 
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis fontSize={12} />
            <Tooltip 
              formatter={(value, name) => {
                if (name === 'count') return [value, 'Users'];
                if (name === 'conversionRate') return [`${value}%`, 'Conversion Rate'];
                return [value, name];
              }}
              labelFormatter={(label) => `Step: ${label}`}
            />
            <Bar 
              dataKey="count" 
              fill="hsl(var(--primary))" 
              radius={[4, 4, 0, 0]}
              name="count"
            />
            <Bar 
              dataKey="conversionRate" 
              fill="hsl(var(--chart-1))" 
              radius={[4, 4, 0, 0]}
              name="conversionRate"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Conversion Rate Line Chart */}
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={funnelData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="step" 
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis fontSize={12} domain={[0, 100]} />
            <Tooltip formatter={(value) => [`${value}%`, 'Conversion Rate']} />
            <Line 
              type="monotone" 
              dataKey="conversionRate" 
              stroke="hsl(var(--chart-1))" 
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--chart-1))', strokeWidth: 2, r: 4 }}
              name="conversionRate"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Funnel Steps Details */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {funnelData.map((step, index) => (
          <Card key={step.step} className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">{step.count.toLocaleString()}</div>
              <div className="text-sm font-medium mt-1">{step.step}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {step.conversionRate.toFixed(1)}% conversion
              </div>
              {index > 0 && (
                <div className="text-xs text-red-500 mt-1">
                  {step.dropoff.toFixed(1)}% dropoff
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}