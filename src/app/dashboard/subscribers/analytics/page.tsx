// app/dashboard/subscribers/analytics/page.tsx (Real Data Integration)
'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  TrendingUp, 
  Activity, 
  DollarSign,
  Download,
  Calendar
} from 'lucide-react';
import { SubscriberGrowthChart } from '@/components/analytics/SubscriberGrowthChart';
import { RevenueChart } from '@/components/analytics/RevenueChart';
import { ChurnRateChart } from '@/components/analytics/ChurnRateChart';
import { LTVChart } from '@/components/analytics/LTVChart';
import { subscribersService } from '@/lib/api/subscribers';

export default function AnalyticsDashboard() {
  const { data: analyticsData, isLoading, error } = useQuery({
    queryKey: ['subscriber-analytics'],
    queryFn: () => subscribersService.getSubscriberAnalytics(),
  });

  const { data: growthData } = useQuery({
    queryKey: ['subscriber-growth'],
    queryFn: () => subscribersService.getSubscriberGrowth(30),
  });

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
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">Failed to load analytics data</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscriber Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive analytics and insights about your subscribers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Last 30 Days
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

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
                  {((analyticsData?.activeSubscribers / analyticsData?.totalSubscribers) * 100).toFixed(1)}% of total
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
                <SubscriberGrowthChart data={growthData} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Activity Breakdown</CardTitle>
                <CardDescription>Subscriber activity types distribution</CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsData?.activityData && (
                  <div className="space-y-2">
                    {analyticsData.activityData.map((activity: any, index: number) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-sm text-muted-foreground">{activity._id}</span>
                        <span className="text-sm font-medium">{activity.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subscription Breakdown</CardTitle>
                <CardDescription>Subscription status distribution</CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsData?.subscriptionBreakdown && (
                  <div className="space-y-2">
                    {analyticsData.subscriptionBreakdown.map((sub: any, index: number) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-sm text-muted-foreground capitalize">{sub._id}</span>
                        <div className="text-right">
                          <div className="text-sm font-medium">{sub.count}</div>
                          <div className="text-xs text-muted-foreground">
                            ${sub.totalRevenue?.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Metrics</CardTitle>
                <CardDescription>Additional performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Conversion Rate</span>
                    <span className="text-sm font-medium">
                      {analyticsData?.conversionRate?.toFixed(1) || '0'}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">New (7 days)</span>
                    <span className="text-sm font-medium">
                      {analyticsData?.newSubscribersLast7Days || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">New (30 days)</span>
                    <span className="text-sm font-medium">
                      {analyticsData?.newSubscribersLast30Days || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="growth">
          <Card>
            <CardHeader>
              <CardTitle>Growth Analytics</CardTitle>
              <CardDescription>
                Subscriber growth trends and acquisition channels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SubscriberGrowthChart data={growthData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="churn">
          <Card>
            <CardHeader>
              <CardTitle>Churn Analysis</CardTitle>
              <CardDescription>
                Churn rates and retention analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Churn Rate: {analyticsData?.churnRate?.toFixed(1) || '0'}%
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Detailed churn analysis charts will be implemented here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ltv">
          <Card>
            <CardHeader>
              <CardTitle>Lifetime Value Analysis</CardTitle>
              <CardDescription>
                Customer lifetime value trends and predictions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Average LTV: ${analyticsData?.averageLifetimeValue?.toLocaleString() || '0'}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Detailed LTV analysis charts will be implemented here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}