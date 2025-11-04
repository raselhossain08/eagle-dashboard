// app/dashboard/discounts/redemptions/analytics/page.tsx
'use client';

import { useState, useMemo, Suspense } from 'react';
import { DiscountsDashboardShell } from '@/components/discounts/discounts-dashboard-shell';
import { RedemptionAnalyticsDashboard } from '@/components/discounts/redemption-analytics-dashboard';
import { RedemptionAnalyticsErrorBoundary } from '@/components/discounts/redemption-analytics-error-boundary';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Download, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  Users, 
  DollarSign, 
  ShoppingCart, 
  AlertTriangle,
  RefreshCw,
  BarChart3,
  PieChart,
  Globe,
  Target,
  Filter,
  Eye,
  Settings
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  useRedemptionAnalytics, 
  useExportRedemptionAnalytics,
  useRealTimeRedemptions,
  useComparativeAnalytics 
} from '@/hooks/use-enhanced-redemptions';
import { DateRange } from '@/types/discounts';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Enhanced Analytics Component with Real-Time Features
function RedemptionAnalyticsContent() {
  const [timeRange, setTimeRange] = useState('30d');
  const [granularity, setGranularity] = useState<'day' | 'week' | 'month'>('day');
  const [enableRealTime, setEnableRealTime] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Enhanced date range calculation with comparison periods
  const { dateRange, comparisonDateRange } = useMemo(() => {
    const now = new Date();
    let startDate = new Date();
    let comparisonStartDate = new Date();
    let comparisonEndDate = new Date();
    
    switch (timeRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        comparisonStartDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        comparisonEndDate = new Date(startDate);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        comparisonStartDate = new Date(startDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        comparisonEndDate = new Date(startDate);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        comparisonStartDate = new Date(startDate.getTime() - 90 * 24 * 60 * 60 * 1000);
        comparisonEndDate = new Date(startDate);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        comparisonStartDate = new Date(startDate.getTime() - 365 * 24 * 60 * 60 * 1000);
        comparisonEndDate = new Date(startDate);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        comparisonStartDate = new Date(startDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        comparisonEndDate = new Date(startDate);
    }
    
    return {
      dateRange: { from: startDate, to: now },
      comparisonDateRange: { from: comparisonStartDate, to: comparisonEndDate }
    };
  }, [timeRange]);

  // Enhanced hooks with real-time capabilities
  const { 
    data: analyticsData, 
    isLoading, 
    error,
    isFetching,
    isStale,
    refetch
  } = useRedemptionAnalytics({
    dateRange,
    enableRealTime,
    includeComparison: true,
    granularity
  });

  const {
    data: comparisonData,
    isLoading: comparisonLoading
  } = useComparativeAnalytics(dateRange, comparisonDateRange);

  // Use the pre-calculated changes from comparative analytics hook
  const changes = comparisonData?.changes || null;

  const {
    recentRedemptions
  } = useRealTimeRedemptions({
    enablePolling: enableRealTime,
    onNewRedemption: (redemption) => {
      toast.success(`New redemption: ${redemption.code}`, {
        description: `$${redemption.orderValue} order by ${redemption.userEmail}`
      });
    }
  });

  // Extract analytics data from main analytics response
  const timelineData = analyticsData?.timeline || [];
  const timelineLoading = isLoading;
  
  const channelsData = analyticsData?.topChannels || [];
  const channelsLoading = isLoading;
  
  const codesData = analyticsData?.topCodes || [];
  const codesLoading = isLoading;
  
  const geographicData = analyticsData?.topCountries || [];
  const geographicLoading = isLoading;
  
  const segmentsData = analyticsData?.customerSegments || [];
  const segmentsLoading = isLoading;

  // Export functionality
  const exportAnalytics = useExportRedemptionAnalytics();

  const handleExport = async (format: 'csv' | 'excel' | 'json' = 'csv') => {
    try {
      const blob = await exportAnalytics.mutateAsync({
        dateRange,
        format,
        includeDetails: true
      });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `redemption-analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success(`Analytics exported as ${format.toUpperCase()}`);
    } catch (error: any) {
      toast.error('Export failed', {
        description: error?.message || 'Please try again'
      });
    }
  };

  // Utility functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getChangeIndicator = (value: number) => {
    if (value > 0) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else if (value < 0) {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
    return null;
  };

  // Enhanced action bar
  const actions = (
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-2">
        <Badge variant={enableRealTime ? "default" : "secondary"} className="flex items-center gap-1">
          <div className={cn("w-2 h-2 rounded-full", enableRealTime ? "bg-green-500 animate-pulse" : "bg-gray-400")} />
          {enableRealTime ? "Live" : "Paused"}
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setEnableRealTime(!enableRealTime)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      </div>

      <Select value={granularity} onValueChange={(value: any) => setGranularity(value)}>
        <SelectTrigger className="w-[100px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="day">Daily</SelectItem>
          <SelectItem value="week">Weekly</SelectItem>
          <SelectItem value="month">Monthly</SelectItem>
        </SelectContent>
      </Select>
      
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
        onClick={() => refetch()}
        disabled={isFetching}
      >
        <RefreshCw className={cn("mr-2 h-4 w-4", isFetching && "animate-spin")} />
        Refresh
      </Button>
      
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => handleExport('csv')}
        disabled={isLoading || exportAnalytics.isPending}
      >
        <Download className="mr-2 h-4 w-4" />
        {exportAnalytics.isPending ? 'Exporting...' : 'Export'}
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

        {/* Data Staleness Indicator */}
        {isStale && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Data may be outdated. 
              <Button variant="link" className="ml-2 p-0 h-auto" onClick={() => refetch()}>
                Refresh now
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Enhanced Analytics Tabs */}
        <Tabs value="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="realtime">Real-time</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Enhanced KPI Cards with Comparisons */}
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
                    <>
                      <div className="text-2xl font-bold">
                        {analyticsData?.totalRedemptions?.toLocaleString() || 0}
                      </div>
                      {comparisonData && (
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          {getChangeIndicator(comparisonData.changes.redemptions)}
                          <span className={cn(
                            "ml-1",
                            comparisonData.changes.redemptions > 0 ? "text-green-600" : "text-red-600"
                          )}>
                            {formatPercentage(comparisonData.changes.redemptions)} vs previous period
                          </span>
                        </div>
                      )}
                    </>
                  )}
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
                    <>
                      <div className="text-2xl font-bold">
                        {formatCurrency(analyticsData?.totalRevenue || 0)}
                      </div>
                      {comparisonData && (
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          {getChangeIndicator(comparisonData.changes.revenue)}
                          <span className={cn(
                            "ml-1",
                            comparisonData.changes.revenue > 0 ? "text-green-600" : "text-red-600"
                          )}>
                            {formatPercentage(comparisonData.changes.revenue)} vs previous period
                          </span>
                        </div>
                      )}
                    </>
                  )}
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
                    <>
                      <div className="text-2xl font-bold">
                        {formatCurrency(analyticsData?.averageOrderValue || 0)}
                      </div>
                      {comparisonData && (
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          {getChangeIndicator(comparisonData.changes.averageOrderValue)}
                          <span className={cn(
                            "ml-1",
                            comparisonData.changes.averageOrderValue > 0 ? "text-green-600" : "text-red-600"
                          )}>
                            {formatPercentage(comparisonData.changes.averageOrderValue)} vs previous period
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">
                        {analyticsData?.conversionRate?.toFixed(1) || 0}%
                      </div>
                      {comparisonData && (
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          {getChangeIndicator(comparisonData.changes.conversionRate)}
                          <span className={cn(
                            "ml-1",
                            comparisonData.changes.conversionRate > 0 ? "text-green-600" : "text-red-600"
                          )}>
                            {formatPercentage(comparisonData.changes.conversionRate)} vs previous period
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Main Analytics Dashboard */}
            {analyticsData && (
              <RedemptionAnalyticsDashboard
                data={{
                  ...analyticsData,
                  averageDiscount: analyticsData.totalDiscountAmount / (analyticsData.totalRedemptions || 1),
                  topDiscounts: analyticsData.topCodes?.map(code => ({
                    discount: { code: code.code },
                    redemptions: code.redemptions,
                    totalDiscount: code.discountAmount
                  })) || []
                }}
                dateRange={dateRange}
              />
            )}
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            {/* Performance Insights */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Top Performing Channels
                  </CardTitle>
                  <CardDescription>
                    Marketing channels driving the most redemptions and revenue
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
                        <div key={channel.channel} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                                {index + 1}
                              </div>
                              <span className="font-medium">{channel.channel}</span>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">{formatCurrency(channel.revenue)}</div>
                              <div className="text-sm text-muted-foreground">
                                {channel.redemptions} redemptions
                              </div>
                            </div>
                          </div>
                          <Progress 
                            value={analyticsData?.totalRevenue ? (channel.revenue / analyticsData.totalRevenue) * 100 : 0} 
                            className="h-2"
                          />
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
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Most Popular Codes
                  </CardTitle>
                  <CardDescription>
                    Discount codes with highest redemption rates and ROI
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
                        <div key={code.code} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
                                {index + 1}
                              </div>
                              <span className="font-mono font-medium">{code.code}</span>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">{formatCurrency(code.revenue)}</div>
                              <div className="text-sm text-muted-foreground">
                                {code.redemptions} uses • {code.conversionRate?.toFixed(1)}% CVR
                              </div>
                            </div>
                          </div>
                          <Progress 
                            value={analyticsData?.totalRedemptions ? (code.redemptions / analyticsData.totalRedemptions) * 100 : 0} 
                            className="h-2"
                          />
                        </div>
                      )) || (
                        <p className="text-sm text-muted-foreground">No code data available</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            {/* Geographic and Customer Insights */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Top Countries
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {geographicLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between py-2">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                      ))}
                    </div>
                  ) : geographicData && geographicData.length > 0 ? (
                    geographicData.slice(0, 5).map((country: any, index: number) => (
                      <div key={country.country} className="flex items-center justify-between py-2">
                        <span className="font-medium">{country.country}</span>
                        <span className="text-sm text-muted-foreground">
                          {country.redemptions.toLocaleString()} redemptions
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No geographic data available</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Customer Segments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {segmentsLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between py-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                      ))}
                    </div>
                  ) : segmentsData && segmentsData.length > 0 ? (
                    segmentsData.map((segment: any) => (
                      <div key={segment.segment} className="flex items-center justify-between py-2">
                        <span className="font-medium">{segment.segment}</span>
                        <span className="text-sm text-muted-foreground">
                          {formatCurrency(segment.averageOrderValue)} AOV
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No segment data available</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Conversion Funnel
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analyticsData?.conversionFunnel?.map((step) => (
                    <div key={step.step} className="space-y-2 py-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{step.step}</span>
                        <span className="text-sm">{step.rate?.toFixed(1)}%</span>
                      </div>
                      <Progress value={step.rate} className="h-2" />
                    </div>
                  )) || <p className="text-sm text-muted-foreground">No funnel data available</p>}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="realtime" className="space-y-6">
            {/* Real-time Monitoring */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Recent Redemptions
                </CardTitle>
                <CardDescription>
                  Live feed of discount code redemptions (updates every 15 seconds)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentRedemptions?.length > 0 ? (
                    recentRedemptions.map((redemption) => (
                      <div key={redemption.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline">{redemption.code}</Badge>
                          <div>
                            <div className="font-medium">{redemption.userEmail || 'Anonymous'}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(redemption.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(redemption.orderValue)}</div>
                          <div className="text-sm text-green-600">
                            -{formatCurrency(redemption.discountAmount)}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No recent redemptions
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DiscountsDashboardShell>
  );
}

export default function RedemptionAnalyticsPage() {
  return (
    <RedemptionAnalyticsErrorBoundary>
      <Suspense fallback={
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
            <p className="text-sm text-muted-foreground">Loading analytics dashboard...</p>
          </div>
        </div>
      }>
        <RedemptionAnalyticsContent />
      </Suspense>
    </RedemptionAnalyticsErrorBoundary>
  );
}