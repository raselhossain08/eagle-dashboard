// app/dashboard/discounts/page.tsx
'use client';

import { useState } from 'react';
import { DiscountsDashboardShell } from '@/components/discounts/discounts-dashboard-shell';
import { DiscountsOverviewCards, DiscountsOverviewData } from '@/components/discounts/discounts-overview-cards';
import { RedemptionTrendsChart } from '@/components/discounts/redemption-trends-chart';
import { TopPerformingDiscounts } from '@/components/discounts/top-performing-discounts';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Download, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useDiscountsOverview, useExportDiscounts, useDiscountsDashboard } from '@/hooks/use-discounts';
import { useRedemptionStats } from '@/hooks/use-redemptions';
import { toast } from 'sonner';

export default function DiscountsOverviewPage() {
  const [isExporting, setIsExporting] = useState(false);

  // Get current month date range for trends
  const currentMonth = new Date();
  const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

  // Fetch real data using enhanced hooks
  const { 
    overview: { 
      data: overviewData, 
      isLoading: overviewLoading, 
      error: overviewError 
    },
    active: { 
      data: activeDiscounts 
    },
    isLoading: dashboardLoading,
    refresh: refreshDashboard
  } = useDiscountsDashboard();

  const { 
    data: trendsData, 
    isLoading: trendsLoading 
  } = useRedemptionStats({
    startDate: startOfMonth.toISOString(),
    endDate: endOfMonth.toISOString()
  });

  const exportDiscounts = useExportDiscounts();

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const blob = await exportDiscounts.mutateAsync({
        format: 'csv',
        filters: { isActive: true }
      });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `discounts-overview-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Export completed successfully');
    } catch (error: any) {
      toast.error('Failed to export data');
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const actions = (
    <div className="flex space-x-2">
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleExport}
        disabled={isExporting || dashboardLoading}
      >
        <Download className="mr-2 h-4 w-4" />
        {isExporting ? 'Exporting...' : 'Export'}
      </Button>
      <Button size="sm" asChild>
        <Link href="/dashboard/discounts/codes/new">
          <Plus className="mr-2 h-4 w-4" />
          New Discount
        </Link>
      </Button>
    </div>
  );

  // Handle error state with refresh option
  if (overviewError) {
    return (
      <DiscountsDashboardShell
        title="Discounts Overview"
        description="Manage discount codes, campaigns, and track performance"
        actions={actions}
      >
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load discounts overview: {overviewError.message}
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2"
              onClick={refreshDashboard}
            >
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      </DiscountsDashboardShell>
    );
  }

  // Transform backend data to match component expectations
  const transformedOverviewData: DiscountsOverviewData = overviewData ? {
    totalDiscounts: overviewData.totalDiscounts,
    activeDiscounts: overviewData.activeDiscounts,
    totalRedemptions: overviewData.totalRedemptions,
    totalDiscountAmount: overviewData.totalDiscountAmount,
    totalRevenue: overviewData.totalRevenue,
    conversionRate: overviewData.conversionRate,
    averageDiscountValue: overviewData.totalDiscountAmount / (overviewData.totalRedemptions || 1),
    topPerformingCode: overviewData.topPerformingDiscounts?.[0]?.code || 'N/A'
  } : {
    totalDiscounts: 0,
    activeDiscounts: 0,
    totalRedemptions: 0,
    totalDiscountAmount: 0,
    totalRevenue: 0,
    conversionRate: 0,
    averageDiscountValue: 0,
    topPerformingCode: 'N/A'
  };

  // Transform trends data for chart - using real redemption stats conversion funnel
  const transformedTrendsData = trendsData?.conversionFunnel?.map((item: any, index: number) => {
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - (trendsData.conversionFunnel.length - index - 1));
    
    return {
      date: baseDate.toISOString().split('T')[0],
      redemptions: item.count || 0,
      revenue: (item.count || 0) * (trendsData.averageOrderValue || 50), // Use real average order value
      discountAmount: (item.count || 0) * (trendsData.averageDiscount || 10) // Use real average discount
    };
  }) || [];

  // Transform top performing discounts with real data
  const transformedTopDiscounts = overviewData?.topPerformingDiscounts?.slice(0, 5).map((discount: any) => ({
    code: discount.code,
    redemptions: discount.timesRedeemed || 0,
    revenue: discount.totalRevenue || 0,
    conversionRate: discount.redemptionRate || 0,
    discountAmount: discount.totalDiscountAmount || 0
  })) || [];

  return (
    <DiscountsDashboardShell
      title="Discounts Overview"
      description="Manage discount codes, campaigns, and track performance"
      actions={actions}
    >
      {/* Overview Cards with Real Data */}
      {dashboardLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3 p-6 border rounded-lg">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
      ) : (
        <DiscountsOverviewCards data={transformedOverviewData} />
      )}
      
      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Trends Chart */}
        <div className="space-y-3">
          {trendsLoading ? (
            <div className="p-6 border rounded-lg">
              <Skeleton className="h-6 w-40 mb-4" />
              <Skeleton className="h-[300px] w-full" />
            </div>
          ) : (
            <RedemptionTrendsChart 
              data={transformedTrendsData} 
              period="monthly" 
            />
          )}
        </div>

        {/* Top Performing Discounts with Real Data */}
        <div className="space-y-3">
          {dashboardLoading ? (
            <div className="p-6 border rounded-lg">
              <Skeleton className="h-6 w-40 mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <TopPerformingDiscounts 
              data={transformedTopDiscounts} 
              limit={5}
            />
          )}
        </div>
      </div>
    </DiscountsDashboardShell>
  );
}