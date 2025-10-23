// app/dashboard/users/analytics/page.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Users, TrendingUp, Activity, Map, Download, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { useUserAnalytics, useExportAnalytics } from '@/hooks/useAnalytics';
import { toast } from 'sonner';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d');
  const { exportAnalytics } = useExportAnalytics();
  
  const { 
    data: analyticsData, 
    isLoading, 
    error, 
    refetch,
    isRefetching 
  } = useUserAnalytics(timeRange);

  const handleExport = async () => {
    try {
      await exportAnalytics('users', timeRange);
      toast.success('Analytics exported successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to export analytics');
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/users">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Users
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">User Analytics</h1>
              <p className="text-muted-foreground">
                Comprehensive analytics and user insights
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/users">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Users
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Analytics</h1>
            <p className="text-muted-foreground">
              Comprehensive analytics and user insights
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
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
            onClick={handleRefresh}
            disabled={isRefetching}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load analytics: {error.message}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="growth" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Growth
          </TabsTrigger>
          <TabsTrigger value="engagement" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Engagement
          </TabsTrigger>
          <TabsTrigger value="demographics" className="flex items-center gap-2">
            <Map className="h-4 w-4" />
            Demographics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Overview analytics content */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyticsData?.overview.totalUsers.toLocaleString() || '0'}
                </div>
                <p className="text-xs text-muted-foreground">
                  +{analyticsData?.overview.growthRate.toFixed(1) || '0'}% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyticsData?.overview.activeUsers.toLocaleString() || '0'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {((analyticsData?.overview.activeUsers / analyticsData?.overview.totalUsers) * 100 || 0).toFixed(1)}% of total users
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Users</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyticsData?.overview.newUsers.toLocaleString() || '0'}
                </div>
                <p className="text-xs text-muted-foreground">
                  In selected time period
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
                <Map className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyticsData?.overview.growthRate.toFixed(1) || '0'}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Month over month
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>User Growth Trend</CardTitle>
                <CardDescription>User acquisition over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center text-muted-foreground border rounded-lg">
                  {analyticsData?.growth.dailyGrowth ? (
                    <div className="w-full">
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Daily Growth</h4>
                        <div className="space-y-1">
                          {analyticsData.growth.dailyGrowth.slice(-7).map((day, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>{new Date(day.date).toLocaleDateString()}</span>
                              <span className="font-medium">+{day.newUsers} users</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    'Growth Trend Chart'
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>User Distribution</CardTitle>
                <CardDescription>By status and activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center">
                  {analyticsData?.demographics ? (
                    <div className="w-full space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">By Status</h4>
                        <div className="space-y-2">
                          {analyticsData.demographics.byStatus.map((status, index) => (
                            <div key={index} className="flex justify-between items-center">
                              <span className="text-sm">{status.status}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-500 h-2 rounded-full" 
                                    style={{ width: `${status.percentage}%` }}
                                  />
                                </div>
                                <span className="text-sm font-medium w-8 text-right">
                                  {status.percentage}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Distribution Chart</span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="growth">
          <Card>
            <CardHeader>
              <CardTitle>Growth Analytics</CardTitle>
              <CardDescription>Detailed growth metrics and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="text-lg font-semibold mb-4">Monthly Growth</h4>
                  <div className="space-y-2">
                    {analyticsData?.growth.monthlyGrowth?.slice(-6).map((month, index) => (
                      <div key={index} className="flex justify-between items-center p-2 border rounded">
                        <span className="text-sm">{month.month}</span>
                        <div className="text-right">
                          <div className="text-sm font-medium">+{month.newUsers} users</div>
                          <div className="text-xs text-muted-foreground">
                            {month.growthRate.toFixed(1)}% growth
                          </div>
                        </div>
                      </div>
                    )) || <div className="text-muted-foreground">No growth data available</div>}
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-4">Key Metrics</h4>
                  <div className="space-y-4">
                    <div className="p-4 border rounded">
                      <div className="text-2xl font-bold">
                        {analyticsData?.overview.totalUsers.toLocaleString() || '0'}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Users</div>
                    </div>
                    <div className="p-4 border rounded">
                      <div className="text-2xl font-bold">
                        {analyticsData?.overview.growthRate.toFixed(1) || '0'}%
                      </div>
                      <div className="text-sm text-muted-foreground">Growth Rate</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Analytics</CardTitle>
              <CardDescription>User engagement metrics and patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="text-lg font-semibold mb-4">Active Users by Period</h4>
                  <div className="space-y-3">
                    {analyticsData?.engagement.activeUsersByPeriod?.map((period, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm">{period.period}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {period.activeUsers.toLocaleString()}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({period.percentage}%)
                          </span>
                        </div>
                      </div>
                    )) || <div className="text-muted-foreground">No engagement data available</div>}
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-4">Top Features</h4>
                  <div className="space-y-2">
                    {analyticsData?.engagement.topFeatures?.slice(0, 5).map((feature, index) => (
                      <div key={index} className="flex justify-between items-center p-2 border rounded">
                        <span className="text-sm">{feature.feature}</span>
                        <div className="text-right">
                          <div className="text-sm font-medium">{feature.usageCount}</div>
                          <div className="text-xs text-muted-foreground">{feature.percentage}%</div>
                        </div>
                      </div>
                    )) || <div className="text-muted-foreground">No feature data available</div>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demographics">
          <Card>
            <CardHeader>
              <CardTitle>Demographic Analytics</CardTitle>
              <CardDescription>User demographic information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="text-lg font-semibold mb-4">Geographic Distribution</h4>
                  <div className="space-y-2">
                    {analyticsData?.demographics.byCountry?.slice(0, 5).map((country, index) => (
                      <div key={index} className="flex justify-between items-center p-2 border rounded">
                        <span className="text-sm">{country.country}</span>
                        <div className="text-right">
                          <div className="text-sm font-medium">{country.count}</div>
                          <div className="text-xs text-muted-foreground">{country.percentage}%</div>
                        </div>
                      </div>
                    )) || <div className="text-muted-foreground">No geographic data available</div>}
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-4">KYC Status Distribution</h4>
                  <div className="space-y-2">
                    {analyticsData?.demographics.byKycStatus?.map((status, index) => (
                      <div key={index} className="flex justify-between items-center p-2 border rounded">
                        <span className="text-sm">{status.status}</span>
                        <div className="text-right">
                          <div className="text-sm font-medium">{status.count}</div>
                          <div className="text-xs text-muted-foreground">{status.percentage}%</div>
                        </div>
                      </div>
                    )) || <div className="text-muted-foreground">No KYC data available</div>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}