// app/dashboard/subscribers/analytics/page.tsx (Real Data Integration)
'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  TrendingUp, 
  Activity, 
  DollarSign,
  Download,
  Calendar,
  RefreshCw,
  AlertTriangle,
  Eye,
  EyeOff
} from 'lucide-react';
import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { RoleBasedAccess } from '@/components/auth/RoleBasedAccess';
import { ApiErrorHandler } from '@/components/errors/ApiErrorHandler';
import { subscribersService } from '@/lib/api/subscribers';
import { SubscriberGrowthChart } from '@/components/analytics/SubscriberGrowthChart';
import { RevenueChart } from '@/components/analytics/RevenueChart';
import { ChurnRateChart } from '@/components/analytics/ChurnRateChart';
import { LTVChart } from '@/components/analytics/LTVChart';

interface AnalyticsData {
  totalSubscribers: number;
  activeSubscribers: number;
  newSubscribersLast7Days: number;
  newSubscribersLast30Days: number;
  churnRate: number;
  averageLifetimeValue: number;
  conversionRate: number;
  monthlyRecurringRevenue: number;
  activityData: Array<{
    _id: string;
    count: number;
    percentage: number;
  }>;
  subscriptionBreakdown: Array<{
    _id: string;
    count: number;
    totalRevenue: number;
    percentage: number;
  }>;
  revenueData: Array<{
    date: string;
    revenue: number;
    subscribers: number;
  }>;
  churnData: Array<{
    date: string;
    churnRate: number;
    churnedCount: number;
  }>;
}

interface GrowthData {
  date: string;
  newSubscribers: number;
  totalSubscribers: number;
  growthRate: number;
}

function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState<string>('30');
  const [refreshing, setRefreshing] = useState(false);

  const { 
    data: analyticsData, 
    isLoading: analyticsLoading, 
    error: analyticsError,
    refetch: refetchAnalytics 
  } = useQuery<AnalyticsData>({
    queryKey: ['subscriber-analytics', dateRange],
    queryFn: () => subscribersService.getSubscriberAnalytics(),
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const { 
    data: growthData, 
    isLoading: growthLoading, 
    error: growthError,
    refetch: refetchGrowth 
  } = useQuery<GrowthData[]>({
    queryKey: ['subscriber-growth', dateRange],
    queryFn: () => subscribersService.getSubscriberGrowth(parseInt(dateRange)),
    retry: 2,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { 
    data: topSubscribers, 
    isLoading: topSubscribersLoading,
    error: topSubscribersError 
  } = useQuery({
    queryKey: ['top-subscribers'],
    queryFn: () => subscribersService.getTopSubscribers(10),
    retry: 2,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const isLoading = analyticsLoading || growthLoading;
  const hasError = analyticsError || growthError || topSubscribersError;

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchAnalytics(),
        refetchGrowth()
      ]);
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleExport = () => {
    const data = {
      analytics: analyticsData,
      growth: growthData,
      topSubscribers,
      exportedAt: new Date().toISOString(),
      dateRange: `${dateRange} days`
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subscriber-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Subscriber Analytics</h1>
            <p className="text-muted-foreground">Loading analytics data...</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted animate-pulse rounded mb-2" />
                <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-muted animate-pulse rounded w-1/3 mb-2" />
                <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Subscriber Analytics</h1>
            <p className="text-muted-foreground">Error loading analytics data</p>
          </div>
        </div>
        <ApiErrorHandler 
          error={analyticsError || growthError || topSubscribersError} 
          retry={handleRefresh}
          className="mx-auto max-w-md"
        />
      </div>
    );
  }

  return (
    <RoleBasedAccess 
      requiredRoles={['super_admin', 'finance_admin', 'growth_marketing']}
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold">Access Restricted</h3>
              <p className="text-muted-foreground">
                You need analytics permissions to view subscriber analytics.
              </p>
            </div>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Subscriber Analytics</h1>
            <p className="text-muted-foreground">
              Comprehensive analytics and insights about your subscribers
            </p>
            {analyticsData && (
              <p className="text-sm text-muted-foreground mt-1">
                Last updated: {new Date().toLocaleString()}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[140px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 Days</SelectItem>
                <SelectItem value="30">Last 30 Days</SelectItem>
                <SelectItem value="90">Last 90 Days</SelectItem>
                <SelectItem value="365">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing || isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleExport}
              disabled={!analyticsData}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Status Alert */}
        {analyticsData && analyticsData.totalSubscribers === 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No subscriber data available. This might be because no subscribers have been added to the system yet.
            </AlertDescription>
          </Alert>
        )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="growth">Growth</TabsTrigger>
          <TabsTrigger value="churn">Churn Analysis</TabsTrigger>
          <TabsTrigger value="ltv">Lifetime Value</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyticsData?.totalSubscribers?.toLocaleString() || '0'}
                </div>
                <p className="text-xs text-muted-foreground">
                  +{analyticsData?.newSubscribersLast30Days || 0} in last 30 days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyticsData?.activeSubscribers?.toLocaleString() || '0'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {analyticsData?.activeSubscribers && analyticsData?.totalSubscribers 
                    ? `${((analyticsData.activeSubscribers / analyticsData.totalSubscribers) * 100).toFixed(1)}% of total`
                    : 'No data available'
                  }
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyticsData?.churnRate?.toFixed(1) || '0'}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Monthly churn rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg LTV</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${analyticsData?.averageLifetimeValue?.toLocaleString() || '0'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Average lifetime value
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Subscriber Growth</CardTitle>
                <CardDescription>Monthly subscriber acquisition trends</CardDescription>
              </CardHeader>
              <CardContent>
                <SubscriberGrowthChart 
                  data={growthData} 
                  height={280}
                  chartType="area"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>Monthly revenue and subscriber correlation</CardDescription>
              </CardHeader>
              <CardContent>
                <RevenueChart 
                  data={analyticsData?.revenueData} 
                  height={280}
                  chartType="area"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Activity Breakdown</CardTitle>
                <CardDescription>Subscriber activity types distribution</CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsData?.activityData && analyticsData.activityData.length > 0 ? (
                  <div className="space-y-3">
                    {analyticsData.activityData.slice(0, 8).map((activity: any, index: number) => {
                      const percentage = activity.percentage || 0;
                      return (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground capitalize">
                              {activity._id || 'Unknown'}
                            </span>
                            <div className="text-right">
                              <span className="font-medium">{activity.count || 0}</span>
                              <span className="text-xs text-muted-foreground ml-2">
                                ({percentage.toFixed(1)}%)
                              </span>
                            </div>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary rounded-full h-2 transition-all duration-300" 
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                    {analyticsData.activityData.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No activity data available
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No activity data available
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subscription Breakdown</CardTitle>
                <CardDescription>Subscription status distribution</CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsData?.subscriptionBreakdown && analyticsData.subscriptionBreakdown.length > 0 ? (
                  <div className="space-y-3">
                    {analyticsData.subscriptionBreakdown.map((sub: any, index: number) => {
                      const percentage = sub.percentage || 0;
                      return (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground capitalize">
                              {sub._id || 'Unknown'}
                            </span>
                            <div className="text-right">
                              <div className="text-sm font-medium">{sub.count || 0}</div>
                              <div className="text-xs text-muted-foreground">
                                ${(sub.totalRevenue || 0).toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-chart-2 rounded-full h-2 transition-all duration-300" 
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No subscription data available
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Subscribers</CardTitle>
                <CardDescription>Highest value subscribers</CardDescription>
              </CardHeader>
              <CardContent>
                {topSubscribers && topSubscribers.length > 0 ? (
                  <div className="space-y-3">
                    {topSubscribers.slice(0, 5).map((subscriber: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-primary">
                              {(subscriber.firstName?.[0] || subscriber.email?.[0] || '?').toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {subscriber.firstName && subscriber.lastName 
                                ? `${subscriber.firstName} ${subscriber.lastName}` 
                                : subscriber.email
                              }
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {subscriber.email}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            ${(subscriber.lifetimeValue || 0).toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            LTV
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No subscriber data available
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Metrics</CardTitle>
                <CardDescription>Additional performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Conversion Rate</span>
                    <div className="text-right">
                      <span className="text-sm font-medium">
                        {(analyticsData?.conversionRate || 0).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Monthly Recurring Revenue</span>
                    <div className="text-right">
                      <span className="text-sm font-medium">
                        ${(analyticsData?.monthlyRecurringRevenue || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">New (7 days)</span>
                    <span className="text-sm font-medium">
                      {analyticsData?.newSubscribersLast7Days || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">New (30 days)</span>
                    <span className="text-sm font-medium">
                      {analyticsData?.newSubscribersLast30Days || 0}
                    </span>
                  </div>
                  {analyticsData?.totalSubscribers && analyticsData.totalSubscribers > 0 && (
                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Avg Revenue per User</span>
                        <span className="text-sm font-medium">
                          ${((analyticsData.monthlyRecurringRevenue || 0) / analyticsData.totalSubscribers).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="growth" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Growth Trend</CardTitle>
                <CardDescription>
                  Subscriber acquisition over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SubscriberGrowthChart 
                  data={growthData} 
                  height={350}
                  chartType="line"
                  showGrowthRate={true}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Growth Statistics</CardTitle>
                <CardDescription>
                  Key growth metrics and insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {growthData && growthData.length > 0 ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">Total Growth</p>
                          <p className="text-2xl font-bold">
                            +{growthData.reduce((acc, item) => acc + (item.newSubscribers || 0), 0)}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">Avg. Daily Growth</p>
                          <p className="text-2xl font-bold">
                            {(growthData.reduce((acc, item) => acc + (item.newSubscribers || 0), 0) / Math.max(growthData.length, 1)).toFixed(1)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-3 pt-4 border-t">
                        <h4 className="font-medium">Growth Breakdown</h4>
                        {growthData.slice(-7).reverse().map((item, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">
                              {format(parseISO(item.date), 'MMM dd, yyyy')}
                            </span>
                            <div className="text-right">
                              <span className="text-sm font-medium">+{item.newSubscribers}</span>
                              {item.growthRate > 0 && (
                                <span className="text-xs text-green-600 ml-2">
                                  (+{item.growthRate.toFixed(1)}%)
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No growth data available
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="churn" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Churn Rate Trend</CardTitle>
                <CardDescription>
                  Monthly churn rates and patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChurnRateChart 
                  data={analyticsData?.churnData} 
                  height={350}
                  showChurnedCount={true}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Churn Analysis</CardTitle>
                <CardDescription>
                  Current churn metrics and insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <p className="text-3xl font-bold text-destructive">
                      {(analyticsData?.churnRate || 0).toFixed(1)}%
                    </p>
                    <p className="text-sm text-muted-foreground">Current Churn Rate</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Retention Rate</p>
                      <p className="text-xl font-semibold text-green-600">
                        {(100 - (analyticsData?.churnRate || 0)).toFixed(1)}%
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Active Subscribers</p>
                      <p className="text-xl font-semibold">
                        {(analyticsData?.activeSubscribers || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {analyticsData?.churnData && analyticsData.churnData.length > 0 && (
                    <div className="space-y-3 pt-4 border-t">
                      <h4 className="font-medium">Recent Churn History</h4>
                      {analyticsData.churnData.slice(-5).reverse().map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            {format(parseISO(item.date), 'MMM dd')}
                          </span>
                          <div className="text-right">
                            <span className="text-sm font-medium text-destructive">
                              {item.churnRate.toFixed(1)}%
                            </span>
                            <span className="text-xs text-muted-foreground ml-2">
                              ({item.churnedCount} churned)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ltv" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Lifetime Value Trends</CardTitle>
                <CardDescription>
                  Customer lifetime value evolution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LTVChart 
                  data={analyticsData?.revenueData?.map((item: any) => ({
                    date: item.date,
                    averageLTV: analyticsData?.averageLifetimeValue || 0,
                    totalLTV: item.revenue * (analyticsData?.averageLifetimeValue || 0),
                    subscribers: item.subscribers
                  }))} 
                  height={350}
                  showTotalLTV={true}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>LTV Analysis</CardTitle>
                <CardDescription>
                  Lifetime value insights and metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <p className="text-3xl font-bold text-primary">
                      ${(analyticsData?.averageLifetimeValue || 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">Average Customer LTV</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Total LTV</p>
                      <p className="text-xl font-semibold">
                        ${((analyticsData?.averageLifetimeValue || 0) * (analyticsData?.totalSubscribers || 0)).toLocaleString()}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">LTV/CAC Ratio</p>
                      <p className="text-xl font-semibold">
                        {analyticsData?.averageLifetimeValue && analyticsData.averageLifetimeValue > 0 
                          ? (analyticsData.averageLifetimeValue / 100).toFixed(1) 
                          : '0'
                        }:1
                      </p>
                    </div>
                  </div>

                  {topSubscribers && topSubscribers.length > 0 && (
                    <div className="space-y-3 pt-4 border-t">
                      <h4 className="font-medium">Highest LTV Customers</h4>
                      {topSubscribers.slice(0, 3).map((subscriber: any, index: number) => (
                        <div key={index} className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-primary">
                                {(subscriber.firstName?.[0] || subscriber.email?.[0] || '?').toUpperCase()}
                              </span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {subscriber.firstName && subscriber.lastName 
                                ? `${subscriber.firstName} ${subscriber.lastName}` 
                                : subscriber.email
                              }
                            </span>
                          </div>
                          <span className="text-sm font-medium">
                            ${(subscriber.lifetimeValue || 0).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </RoleBasedAccess>
  );
}

export default AnalyticsDashboard;