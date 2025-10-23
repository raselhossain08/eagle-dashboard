// app/dashboard/discounts/reports/performance/page.tsx
'use client';

import { useState } from 'react';
import { DiscountsDashboardShell } from '@/components/discounts/discounts-dashboard-shell';
import { DiscountPerformanceChart } from '@/components/discounts/discount-performance-chart';
import { ConversionFunnelChart } from '@/components/discounts/conversion-funnel-chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, Filter, BarChart3, TrendingUp, Users, Target, DollarSign, AlertTriangle } from 'lucide-react';
import { useDiscountsOverview, useExportDiscounts } from '@/hooks/use-discounts';
import { useRedemptionStats } from '@/hooks/use-redemptions';
import { toast } from 'sonner';

export default function PerformanceReportsPage() {
  const [timeRange, setTimeRange] = useState('30d');
  const [metric, setMetric] = useState<'redemptions' | 'revenue' | 'roi'>('revenue');
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');
  const [isExporting, setIsExporting] = useState(false);

  // Calculate date range based on selected timeRange
  const getDateRange = () => {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }
    
    return { from: startDate, to: endDate };
  };

  const dateRange = getDateRange();

  // Fetch real data
  const { 
    data: overviewData, 
    isLoading: overviewLoading, 
    error: overviewError 
  } = useDiscountsOverview();

  const { 
    data: statsData, 
    isLoading: statsLoading,
    error: statsError 
  } = useRedemptionStats(dateRange);

  const exportDiscounts = useExportDiscounts();

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const blob = await exportDiscounts.mutateAsync({
        format: 'csv',
        filters: { 
          isActive: true,
          // Add date range to filters if needed
        }
      });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `performance-report-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Performance report exported successfully');
    } catch (error: any) {
      toast.error('Failed to export performance report');
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const actions = (
    <div className="flex space-x-2">
      <Select value={timeRange} onValueChange={setTimeRange}>
        <SelectTrigger className="w-[130px]">
          <Filter className="h-4 w-4 mr-2" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7d">Last 7 days</SelectItem>
          <SelectItem value="30d">Last 30 days</SelectItem>
          <SelectItem value="90d">Last 90 days</SelectItem>
          <SelectItem value="1y">Last year</SelectItem>
        </SelectContent>
      </Select>
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleExport}
        disabled={isExporting || overviewLoading}
      >
        <Download className="mr-2 h-4 w-4" />
        {isExporting ? 'Exporting...' : 'Export'}
      </Button>
    </div>
  );

  // Handle error states
  if (overviewError || statsError) {
    return (
      <DiscountsDashboardShell
        title="Performance Reports"
        description="Detailed analytics and performance metrics for all discount campaigns"
        actions={actions}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Discounts', href: '/dashboard/discounts' },
          { label: 'Reports', href: '/dashboard/discounts/reports' },
          { label: 'Performance' }
        ]}
      >
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load performance data: {(overviewError || statsError)?.message}
          </AlertDescription>
        </Alert>
      </DiscountsDashboardShell>
    );
  }

  // Transform data for performance chart
  const performanceData = overviewData?.topPerformingDiscounts?.slice(0, 7).map(discount => ({
    code: discount.code,
    redemptions: discount.timesRedeemed || 0,
    revenue: (discount.timesRedeemed || 0) * 100, // Simplified calculation - would need real revenue data
    discountAmount: (discount.timesRedeemed || 0) * (discount.value || 0),
    roi: discount.timesRedeemed && discount.value ? 
      (((discount.timesRedeemed * 100) - (discount.timesRedeemed * discount.value)) / (discount.timesRedeemed * discount.value)) : 0
  })) || [];

  // Transform funnel data
  const funnelData = statsData?.conversionFunnel || [
    { step: 'Page Views', count: 0, conversionRate: 0 },
    { step: 'Add to Cart', count: 0, conversionRate: 0 },
    { step: 'Checkout Start', count: 0, conversionRate: 0 },
    { step: 'Discount Applied', count: 0, conversionRate: 0 },
    { step: 'Purchase Complete', count: 0, conversionRate: 0 },
  ];

  // Calculate key metrics
  const totalRevenue = statsData?.totalRevenue || 0;
  const totalRedemptions = statsData?.totalRedemptions || 0;
  const averageROI = performanceData.length > 0 ? 
    performanceData.reduce((sum, item) => sum + item.roi, 0) / performanceData.length : 0;
  const conversionRate = statsData?.conversionRate || 0;

  return (
    <DiscountsDashboardShell
      title="Performance Reports"
      description="Detailed analytics and performance metrics for all discount campaigns"
      actions={actions}
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Discounts', href: '/dashboard/discounts' },
        { label: 'Reports', href: '/dashboard/discounts/reports' },
        { label: 'Performance' }
      ]}
    >
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {(overviewLoading || statsLoading) ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
              )}
              <p className="text-xs text-muted-foreground">
                {timeRange} period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Redemptions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {(overviewLoading || statsLoading) ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{totalRedemptions.toLocaleString()}</div>
              )}
              <p className="text-xs text-muted-foreground">
                {timeRange} period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. ROI</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {(overviewLoading || statsLoading) ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <div className="text-2xl font-bold">{averageROI.toFixed(1)}x</div>
              )}
              <p className="text-xs text-muted-foreground">
                Average return on investment
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {(overviewLoading || statsLoading) ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
              )}
              <p className="text-xs text-muted-foreground">
                Discount to purchase conversion
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Chart Controls */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Discount Performance</CardTitle>
                <CardDescription>
                  Compare performance across different discount codes
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                <Select value={metric} onValueChange={(value: any) => setMetric(value)}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="redemptions">Redemptions</SelectItem>
                    <SelectItem value="revenue">Revenue</SelectItem>
                    <SelectItem value="roi">ROI</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={chartType} onValueChange={(value: any) => setChartType(value)}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bar">Bar</SelectItem>
                    <SelectItem value="line">Line</SelectItem>
                    <SelectItem value="pie">Pie</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {(overviewLoading || statsLoading) ? (
              <Skeleton className="h-[400px] w-full" />
            ) : (
              <DiscountPerformanceChart
                data={performanceData}
                metric={metric}
                chartType={chartType}
              />
            )}
          </CardContent>
        </Card>

        {/* Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
            <CardDescription>
              Customer journey from page view to purchase with discounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(overviewLoading || statsLoading) ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ConversionFunnelChart data={funnelData} />
            )}
          </CardContent>
        </Card>

        {/* Top Performers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Discounts</CardTitle>
            <CardDescription>
              Best performing discount codes by ROI and revenue
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(overviewLoading || statsLoading) ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-20 mb-2" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <div className="text-right">
                      <Skeleton className="h-4 w-16 mb-2" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {performanceData.slice(0, 5).map((item, index) => (
                  <div key={item.code} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{item.code}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.redemptions} redemptions
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${item.revenue.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">
                        ROI: {item.roi.toFixed(1)}x
                      </div>
                    </div>
                  </div>
                ))}
                {performanceData.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No performance data available for the selected period
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DiscountsDashboardShell>
  );
}