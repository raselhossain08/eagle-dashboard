// components/discounts/revenue-impact-analysis.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, LineChart } from 'recharts';

interface RevenueImpactAnalysisProps {
  data: {
    totalRevenue: number;
    revenueWithDiscounts: number;
    revenueWithoutDiscounts: number;
    discountImpact: number;
    averageUplift: number;
  };
  trendsData: Array<{
    date: string;
    withDiscounts: number;
    withoutDiscounts: number;
  }>;
  isLoading?: boolean;
}

export function RevenueImpactAnalysis({ data, trendsData, isLoading }: RevenueImpactAnalysisProps) {
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Impact Analysis</CardTitle>
        <CardDescription>
          Compare revenue with and without discount strategies
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">With Discounts</div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(data.revenueWithDiscounts)}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Without Discounts</div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(data.revenueWithoutDiscounts)}
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Discount Impact:</span>
                <span className={`font-medium ${data.discountImpact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {data.discountImpact >= 0 ? '+' : ''}{data.discountImpact}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Average Uplift:</span>
                <span className="font-medium text-green-600">
                  +{data.averageUplift}%
                </span>
              </div>
            </div>
          </div>

          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendsData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="date" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <Tooltip 
                  formatter={(value) => [`$${value}`, 'Revenue']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="withDiscounts" 
                  stroke="hsl(var(--chart-1))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--chart-1))' }}
                  name="With Discounts"
                />
                <Line 
                  type="monotone" 
                  dataKey="withoutDiscounts" 
                  stroke="hsl(var(--chart-2))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--chart-2))' }}
                  name="Without Discounts"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}