'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { ExportControls } from '@/components/reports/ExportControls';
import { RevenueChart } from '@/components/reports/RevenueChart';
import { DataTable } from '@/components/reports/DataTable';
import { useRevenueReport, useSubscriptionReport } from '@/hooks/useReports';
import { addDays, format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { TrendingUp, DollarSign, Users, Percent } from 'lucide-react';

export default function FinancialReportsPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  const revenueParams = {
    startDate: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : '',
    endDate: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : '',
    groupBy: 'day' as const,
  };

  const { data: revenueData, isLoading: revenueLoading } = useRevenueReport(revenueParams);
  const { data: subscriptionData, isLoading: subscriptionLoading } = useSubscriptionReport(revenueParams);

  const handleExport = (format: any) => {
    console.log('Exporting in format:', format);
  };

  // Calculate summary metrics
  const totalRevenue = revenueData?.reduce((sum: number, item: any) => sum + item.revenue, 0) || 0;
  const totalSubscriptions = revenueData?.reduce((sum: number, item: any) => sum + item.subscriptions, 0) || 0;
  const avgGrowthRate = revenueData?.length ? 
    revenueData.reduce((sum: number, item: any) => sum + item.growth, 0) / revenueData.length : 0;
  
  const totalMRR = subscriptionData?.reduce((sum: number, item: any) => sum + item.revenue, 0) || 0;
  const avgSubscriptionGrowth = subscriptionData?.length ?
    subscriptionData.reduce((sum: number, item: any) => sum + item.growth, 0) / subscriptionData.length : 0;

  const tableColumns = [
    { key: 'period', label: 'Date' },
    { key: 'revenue', label: 'Revenue', format: (value: number) => `$${value.toLocaleString()}` },
    { key: 'subscriptions', label: 'Transactions' },
    { key: 'growth', label: 'Growth %', format: (value: number) => `${value > 0 ? '+' : ''}${value}%` },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Reports</h1>
          <p className="text-muted-foreground">
            Revenue analytics, subscription metrics, and financial performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <ExportControls onExport={handleExport} />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {avgGrowthRate > 0 ? '+' : ''}{avgGrowthRate.toFixed(1)}% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly MRR</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalMRR.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {avgSubscriptionGrowth > 0 ? '+' : ''}{avgSubscriptionGrowth.toFixed(1)}% growth rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubscriptions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Total for selected period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalSubscriptions > 0 ? (totalRevenue / totalSubscriptions).toFixed(0) : '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Per transaction
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <RevenueChart 
        data={revenueData || []} 
        isLoading={revenueLoading}
        title="Revenue Trend Analysis"
        description="Daily revenue performance and growth trends"
      />

      {/* Data Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Details</CardTitle>
            <CardDescription>
              Daily revenue breakdown and performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            {revenueLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading revenue data...
              </div>
            ) : revenueData && revenueData.length > 0 ? (
              <DataTable 
                data={revenueData} 
                columns={tableColumns}
                searchable={true}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No revenue data available for the selected period
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription Metrics</CardTitle>
            <CardDescription>
              MRR trends and subscription growth analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            {subscriptionLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading subscription data...
              </div>
            ) : subscriptionData && subscriptionData.length > 0 ? (
              <DataTable 
                data={subscriptionData.map((item: any) => ({
                  ...item,
                  revenue: Math.round(item.revenue) // Format MRR as whole numbers
                }))} 
                columns={[
                  { key: 'period', label: 'Period' },
                  { key: 'revenue', label: 'MRR', format: (value: number) => `$${value.toLocaleString()}` },
                  { key: 'subscriptions', label: 'New Subs' },
                  { key: 'growth', label: 'Growth %', format: (value: number) => `${value > 0 ? '+' : ''}${value}%` },
                ]}
                searchable={true}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No subscription data available for the selected period
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Insights Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Insights</CardTitle>
            <CardDescription>Key performance indicators and trends</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>• Revenue trend: {avgGrowthRate > 0 ? 'Growing' : avgGrowthRate < 0 ? 'Declining' : 'Stable'} at {Math.abs(avgGrowthRate).toFixed(1)}%</p>
            <p>• Peak revenue: ${Math.max(...(revenueData?.map((d: any) => d.revenue) || [0])).toLocaleString()}</p>
            <p>• Average daily revenue: ${(totalRevenue / (revenueData?.length || 1)).toFixed(0)}</p>
            <p>• Data points analyzed: {revenueData?.length || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Business Performance</CardTitle>
            <CardDescription>Financial health indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>• MRR growth rate: {avgSubscriptionGrowth > 0 ? '+' : ''}{avgSubscriptionGrowth.toFixed(1)}%</p>
            <p>• Revenue predictability: {totalMRR > 0 ? 'High' : 'Low'} (based on MRR)</p>
            <p>• Transaction volume: {totalSubscriptions.toLocaleString()} transactions</p>
            <p>• Period analyzed: {revenueData?.length || 0} days</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}