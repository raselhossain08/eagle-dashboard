// app/dashboard/discounts/reports/page.tsx
'use client';

import { useState } from 'react';
import { DiscountsDashboardShell } from '@/components/discounts/discounts-dashboard-shell';
import { RevenueImpactAnalysis } from '@/components/discounts/revenue-impact-analysis';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, BarChart3, TrendingUp, Users, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useDiscountsOverview, useExportDiscounts } from '@/hooks/use-discounts';
import { useRedemptionStats } from '@/hooks/use-redemptions';
import { toast } from 'sonner';

export default function ReportsPage() {
  const [isExporting, setIsExporting] = useState(false);

  // Get current month date range
  const currentMonth = new Date();
  const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

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
  } = useRedemptionStats({
    from: startOfMonth,
    to: endOfMonth
  });

  const exportDiscounts = useExportDiscounts();

  const handleExportReport = async () => {
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
      link.download = `discounts-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Report exported successfully');
    } catch (error: any) {
      toast.error('Failed to export report');
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const actions = (
    <Button 
      variant="outline" 
      size="sm"
      onClick={handleExportReport}
      disabled={isExporting || overviewLoading}
    >
      <Download className="mr-2 h-4 w-4" />
      {isExporting ? 'Exporting...' : 'Export Report'}
    </Button>
  );

  // Handle error states
  if (overviewError || statsError) {
    return (
      <DiscountsDashboardShell
        title="Reports & Analytics"
        description="Comprehensive performance reports and revenue analysis"
        actions={actions}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Discounts', href: '/dashboard/discounts' },
          { label: 'Reports' }
        ]}
      >
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load reports data: {(overviewError || statsError)?.message}
          </AlertDescription>
        </Alert>
      </DiscountsDashboardShell>
    );
  }

  // Prepare revenue data for RevenueImpactAnalysis component
  const mockRevenueData = {
    totalRevenue: overviewData?.totalRevenue || 0,
    revenueWithDiscounts: overviewData?.totalRevenue || 0,
    revenueWithoutDiscounts: (overviewData?.totalRevenue || 0) + (overviewData?.totalDiscountAmount || 0),
    discountImpact: overviewData?.totalRevenue && overviewData?.totalDiscountAmount 
      ? ((overviewData.totalDiscountAmount / overviewData.totalRevenue) * 100) 
      : 0,
    averageUplift: 15.2 // This would need to be calculated from historical data
  };

  const mockTrendsData = statsData?.conversionFunnel?.map((item, index) => ({
    date: item.step.substring(0, 3),
    withDiscounts: item.count * 100, // Simplified calculation
    withoutDiscounts: item.count * 120 // Simplified calculation
  })) || [
    { date: 'Jan', withDiscounts: 0, withoutDiscounts: 0 },
    { date: 'Feb', withDiscounts: 0, withoutDiscounts: 0 },
  ];

  return (
    <DiscountsDashboardShell
      title="Reports & Analytics"
      description="Comprehensive performance reports and revenue analysis"
      actions={actions}
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Discounts', href: '/dashboard/discounts' },
        { label: 'Reports' }
      ]}
    >
      <div className="grid gap-6">
        {/* Key Metrics Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {overviewLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold">
                  ${(overviewData?.totalRevenue || 0).toLocaleString()}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Current period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Discount Impact</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {overviewLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">
                  +{mockRevenueData.discountImpact.toFixed(1)}%
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Revenue uplift from discounts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {overviewLoading ? (
                <Skeleton className="h-8 w-8" />
              ) : (
                <div className="text-2xl font-bold">{overviewData?.activeDiscounts || 0}</div>
              )}
              <p className="text-xs text-muted-foreground">
                Running campaigns
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Impact Analysis */}
        {(overviewLoading || statsLoading) ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-60" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[400px] w-full" />
            </CardContent>
          </Card>
        ) : (
          <RevenueImpactAnalysis 
            data={mockRevenueData}
            trendsData={mockTrendsData}
          />
        )}

        {/* Quick Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Reports</CardTitle>
            <CardDescription>
              Generate specific performance reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Button variant="outline" className="h-auto flex-col p-4" asChild>
                <Link href="/dashboard/discounts/reports/performance">
                  <BarChart3 className="mb-2 h-6 w-6" />
                  <span>Performance</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto flex-col p-4" disabled>
                <TrendingUp className="mb-2 h-6 w-6" />
                <span>Revenue Impact</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col p-4" disabled>
                <Users className="mb-2 h-6 w-6" />
                <span>Customer Analysis</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto flex-col p-4"
                onClick={handleExportReport}
                disabled={isExporting}
              >
                <Download className="mb-2 h-6 w-6" />
                <span>{isExporting ? 'Exporting...' : 'Export All'}</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DiscountsDashboardShell>
  );
}