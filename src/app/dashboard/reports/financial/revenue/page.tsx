'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { ExportControls } from '@/components/reports/ExportControls';
import { RevenueChart } from '@/components/reports/RevenueChart';
import { DataTable } from '@/components/reports/DataTable';
import { useRevenueReport } from '@/hooks/useReports';
import { addDays, format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { TrendingUp, DollarSign, BarChart3, Activity } from 'lucide-react';

export default function RevenueAnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  const revenueParams = {
    startDate: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : '',
    endDate: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : '',
    groupBy: 'day' as const,
  };

  const { data: revenueData, isLoading } = useRevenueReport(revenueParams);

  const handleExport = (format: any) => {
    console.log('Exporting revenue report:', format);
  };

  const tableColumns = [
    { key: 'period', label: 'Period' },
    { key: 'revenue', label: 'Revenue', format: (value: number) => `$${value.toLocaleString()}` },
    { key: 'subscriptions', label: 'Transactions' },
    { key: 'growth', label: 'Growth', format: (value: number) => `${value > 0 ? '+' : ''}${value}%` },
  ];

  // Calculate metrics
  const totalRevenue = revenueData?.reduce((sum: number, item: any) => sum + item.revenue, 0) || 0;
  const totalTransactions = revenueData?.reduce((sum: number, item: any) => sum + item.subscriptions, 0) || 0;
  const avgDailyRevenue = revenueData?.length ? totalRevenue / revenueData.length : 0;
  const peakRevenue = Math.max(...(revenueData?.map((d: any) => d.revenue) || [0]));
  const latestGrowth = revenueData?.[revenueData.length - 1]?.growth || 0;
  const avgOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Revenue Analytics</h1>
          <p className="text-muted-foreground">
            Detailed revenue analysis and trends
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <ExportControls onExport={handleExport} />
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              For selected period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Daily Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${avgDailyRevenue.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">
              Average per day
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Revenue</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${peakRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Highest single day
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${latestGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {latestGrowth > 0 ? '+' : ''}{latestGrowth}%
            </div>
            <p className="text-xs text-muted-foreground">
              Latest period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <RevenueChart 
        data={revenueData || []} 
        isLoading={isLoading}
        title="Revenue Trend"
        description="Daily revenue performance over time"
      />

      {/* Detailed Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Data</CardTitle>
          <CardDescription>
            Detailed revenue metrics and calculations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
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

      {/* Summary and Insights */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Summary</CardTitle>
            <CardDescription>Key revenue metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Total Revenue:</span>
              <span className="font-semibold">
                ${totalRevenue.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Average Daily:</span>
              <span className="font-semibold">
                ${avgDailyRevenue.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Average Order Value:</span>
              <span className="font-semibold">
                ${avgOrderValue.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Growth Rate:</span>
              <span className={`font-semibold ${latestGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {latestGrowth > 0 ? '+' : ''}{latestGrowth}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Insights</CardTitle>
            <CardDescription>Revenue analytics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>• {revenueData?.length || 0} days of data analyzed</p>
            <p>• Peak revenue: ${peakRevenue.toLocaleString()}</p>
            <p>• Total transactions: {totalTransactions.toLocaleString()}</p>
            <p>• Revenue trend: {latestGrowth >= 0 ? 'Positive' : 'Negative'} growth</p>
            <p>• Revenue consistency: {avgDailyRevenue > 0 ? 'Active' : 'No activity'}</p>
            <p>• Performance status: {latestGrowth > 5 ? 'Excellent' : latestGrowth > 0 ? 'Good' : 'Needs attention'}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}