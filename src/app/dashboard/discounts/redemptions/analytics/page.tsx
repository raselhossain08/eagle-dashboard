// app/dashboard/discounts/redemptions/analytics/page.tsx
'use client';

import { useState } from 'react';
import { DiscountsDashboardShell } from '@/components/discounts/discounts-dashboard-shell';
import { RedemptionAnalyticsDashboard } from '@/components/discounts/redemption-analytics-dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Calendar, TrendingUp, Users, DollarSign, ShoppingCart, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useRedemptionStats, useExportRedemptions } from '@/hooks/use-redemptions';
import { DateRange } from '@/types/discounts';
import { toast } from 'sonner';

export default function RedemptionAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d');
  
  // Calculate date range based on selection
  const getDateRange = (range: string): DateRange => {
    const now = new Date();
    let startDate = new Date();
    
    switch (range) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    
    return { from: startDate, to: now };
  };

  const dateRange = getDateRange(timeRange);

  // Fetch analytics data
  const { 
    data: analyticsData, 
    isLoading, 
    error 
  } = useRedemptionStats(dateRange);

  // Export mutation
  const exportRedemptions = useExportRedemptions();

  const handleExport = async () => {
    try {
      const blob = await exportRedemptions.mutateAsync({
        startDate: dateRange.from,
        endDate: dateRange.to,
        format: 'csv'
      });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `redemption-analytics-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Analytics report exported successfully');
    } catch (error: any) {
      toast.error('Failed to export analytics report');
      console.error('Export failed:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount / 100); // Convert from cents
  };

  const actions = (
    <div className="flex space-x-2">
      <Select value={timeRange} onValueChange={setTimeRange}>
        <SelectTrigger className="w-[130px]">
          <Calendar className="h-4 w-4 mr-2" />
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
        disabled={isLoading || exportRedemptions.isPending}
      >
        <Download className="mr-2 h-4 w-4" />
        {exportRedemptions.isPending ? 'Exporting...' : 'Export Report'}
      </Button>
    </div>
  );

  return (
    <DiscountsDashboardShell
      title="Redemption Analytics"
      description="Comprehensive analytics and insights into discount code redemptions"
      actions={actions}
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Discounts', href: '/dashboard/discounts' },
        { label: 'Redemptions', href: '/dashboard/discounts/redemptions' },
        { label: 'Analytics' }
      ]}
    >
      <div className="space-y-6">
        {/* Error State */}
        {error && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Failed to load analytics data: {error.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Redemptions</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">
                  {analyticsData?.totalRedemptions?.toLocaleString() || 0}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                In selected period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue Generated</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold">
                  {formatCurrency(analyticsData?.totalRevenue || 0)}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Total revenue after discounts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">
                  {formatCurrency(analyticsData?.averageOrderValue || 0)}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Average order value
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">
                  {analyticsData?.conversionRate?.toFixed(1) || 0}%
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Discount to purchase rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Analytics Dashboard */}
        {analyticsData && (
          <RedemptionAnalyticsDashboard
            data={analyticsData}
            dateRange={dateRange}
          />
        )}

        {/* Additional Insights */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Channels</CardTitle>
              <CardDescription>
                Marketing channels driving the most redemptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {analyticsData?.topChannels?.map((channel, index) => (
                    <div key={channel.channel} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                          {index + 1}
                        </div>
                        <span className="font-medium">{channel.channel}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{channel.redemptions} redemptions</div>
                        <div className="text-sm text-muted-foreground">
                          {analyticsData?.totalRedemptions ? 
                            ((channel.redemptions / analyticsData.totalRedemptions) * 100).toFixed(1) : 0}%
                        </div>
                      </div>
                    </div>
                  )) || (
                    <p className="text-sm text-muted-foreground">No channel data available</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Most Popular Codes</CardTitle>
              <CardDescription>
                Discount codes with highest redemption rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {analyticsData?.topCodes?.map((code, index) => (
                    <div key={code.code} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
                          {index + 1}
                        </div>
                        <span className="font-mono font-medium">{code.code}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{code.redemptions} redemptions</div>
                        <div className="text-sm text-muted-foreground">
                          {analyticsData?.totalRedemptions ? 
                            ((code.redemptions / analyticsData.totalRedemptions) * 100).toFixed(1) : 0}%
                        </div>
                      </div>
                    </div>
                  )) || (
                    <p className="text-sm text-muted-foreground">No code data available</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DiscountsDashboardShell>
  );
}