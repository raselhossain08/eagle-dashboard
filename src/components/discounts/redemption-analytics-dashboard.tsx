// components/discounts/redemption-analytics-dashboard.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface RedemptionAnalyticsDashboardProps {
  data: {
    totalRedemptions: number;
    totalDiscountAmount: number;
    totalRevenue: number;
    averageDiscount: number;
    conversionRate: number;
    averageOrderValue: number;
    topDiscounts?: Array<{ discount: any; redemptions: number; totalDiscount: number }>;
    topChannels: Array<{ channel: string; redemptions: number }>;
    topCodes: Array<{ code: string; redemptions: number }>;
    conversionFunnel: Array<{ step: string; count: number }>;
  };
  dateRange: {
    from: Date;
    to: Date;
  };
  isLoading?: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export function RedemptionAnalyticsDashboard({ data, dateRange, isLoading }: RedemptionAnalyticsDashboardProps) {
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[200px]" />
            <Skeleton className="h-4 w-[300px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[200px]" />
            <Skeleton className="h-4 w-[300px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const channelData = data.topChannels.map(channel => ({
    name: channel.channel,
    value: channel.redemptions,
    percentage: data.totalRedemptions > 0 ? (channel.redemptions / data.totalRedemptions) * 100 : 0
  }));

  const funnelData = data.conversionFunnel.map((step, index, array) => ({
    ...step,
    conversionRate: index === 0 ? 100 : array[0].count > 0 ? (step.count / array[0].count) * 100 : 0,
    dropoff: index > 0 && array[index - 1].count > 0 ? 
      ((array[index - 1].count - step.count) / array[index - 1].count) * 100 : 0
  }));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount / 100); // Convert from cents
  };

  return (
    <div className="grid gap-6">
      {/* Top Discounts Performance */}
      {data.topDiscounts && data.topDiscounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Discounts</CardTitle>
            <CardDescription>
              Discounts with the highest redemption rates in the selected period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.topDiscounts.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="discount.code" 
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis fontSize={12} />
                  <Tooltip 
                    formatter={(value, name) => [value, name === 'redemptions' ? 'Redemptions' : 'Total Discount']}
                    labelFormatter={(label) => `Code: ${label}`}
                  />
                  <Bar 
                    dataKey="redemptions" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                    name="redemptions"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Channel Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Redemptions by Channel</CardTitle>
          <CardDescription>
            Distribution of discount redemptions across marketing channels
          </CardDescription>
        </CardHeader>
        <CardContent>
          {channelData.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={channelData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} (${Number(percentage).toFixed(1)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {channelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'Redemptions']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-4">
                {channelData.map((channel, index) => (
                  <div key={channel.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="font-medium">{channel.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{channel.value} redemptions</div>
                      <div className="text-sm text-muted-foreground">
                        {channel.percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No channel data available for the selected period</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conversion Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
          <CardDescription>
            Customer journey from discount view to purchase completion
          </CardDescription>
        </CardHeader>
        <CardContent>
          {funnelData.some(step => step.count > 0) ? (
            <>
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
                      formatter={(value, name) => [
                        name === 'count' ? value.toLocaleString() : `${Number(value).toFixed(1)}%`,
                        name === 'count' ? 'Users' : 'Conversion Rate'
                      ]}
                      labelFormatter={(label) => `Step: ${label}`}
                    />
                    <Bar 
                      dataKey="count" 
                      fill="hsl(var(--primary))" 
                      radius={[4, 4, 0, 0]}
                      name="count"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-4">
                {funnelData.map((step, index) => (
                  <div key={step.step} className="text-center p-3 border rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground">{step.step}</div>
                    <div className="text-2xl font-bold mt-1">{step.count.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">
                      {step.conversionRate.toFixed(1)}% conversion
                    </div>
                    {index > 0 && step.dropoff > 0 && (
                      <div className="text-xs text-red-500 mt-1">
                        {step.dropoff.toFixed(1)}% dropoff
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Conversion funnel data will be available with tracking implementation</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analytics Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Period Summary</CardTitle>
          <CardDescription>
            Key metrics for {dateRange.from.toLocaleDateString()} - {dateRange.to.toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">{data.totalRedemptions.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Redemptions</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">{formatCurrency(data.totalRevenue)}</div>
              <div className="text-sm text-muted-foreground">Revenue Generated</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{formatCurrency(data.totalDiscountAmount)}</div>
              <div className="text-sm text-muted-foreground">Total Discounts</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{data.conversionRate.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Conversion Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}