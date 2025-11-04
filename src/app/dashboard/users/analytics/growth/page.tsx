// app/dashboard/users/analytics/growth/page.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Download, Calendar, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { useGrowthAnalytics, useExportAnalytics } from '@/hooks/useAnalytics';
import { toast } from 'sonner';

export default function GrowthAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('12m');
  const { exportAnalytics } = useExportAnalytics();
  
  const { 
    data: growthData, 
    isLoading, 
    error, 
    refetch,
    isRefetching 
  } = useGrowthAnalytics(timeRange);

  const handleExport = async () => {
    try {
      await exportAnalytics('growth', timeRange);
      toast.success('Growth analytics exported successfully');
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
        <div className="flex items-center gap-4">
          <Link href="/dashboard/users/analytics">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Analytics
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Growth Analytics</h1>
            <p className="text-muted-foreground">
              User acquisition and growth metrics
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Loading growth analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/users/analytics">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Analytics
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Growth Analytics</h1>
          <p className="text-muted-foreground">
            User acquisition and growth metrics
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load growth analytics: {error.message}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center">
        <Tabs defaultValue="overview" className="w-full">
          <div className="flex justify-between items-center mb-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="acquisition">Acquisition</TabsTrigger>
              <TabsTrigger value="retention">Retention</TabsTrigger>
              <TabsTrigger value="cohort">Cohort Analysis</TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3m">Last 3 months</SelectItem>
                  <SelectItem value="6m">Last 6 months</SelectItem>
                  <SelectItem value="12m">Last 12 months</SelectItem>
                  <SelectItem value="2y">Last 2 years</SelectItem>
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
                Export
              </Button>
            </div>
          </div>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6">
              {/* Overview metrics */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Total Growth</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {growthData?.overview.totalGrowth.toLocaleString() || '0'}
                    </div>
                    <p className="text-xs text-muted-foreground">Total users acquired</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Monthly Growth Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {growthData?.overview.monthlyGrowthRate.toFixed(1) || '0'}%
                    </div>
                    <p className="text-xs text-muted-foreground">Average monthly growth</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Yearly Growth Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {growthData?.overview.yearlyGrowthRate.toFixed(1) || '0'}%
                    </div>
                    <p className="text-xs text-muted-foreground">Annualized growth rate</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Projected Growth</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {growthData?.overview.projectedGrowth.toFixed(0) || '0'}
                    </div>
                    <p className="text-xs text-muted-foreground">Next month projection</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>User Growth Trend</CardTitle>
                  <CardDescription>
                    Monthly user growth and acquisition rates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold">Monthly Growth Data</h4>
                    <div className="grid gap-2">
                      {growthData?.acquisition.trends?.slice(-6).map((month, index) => (
                        <div key={index} className="flex justify-between items-center p-3 border rounded">
                          <span className="text-sm font-medium">{month.date}</span>
                          <div className="flex gap-4 text-sm">
                            <span>Organic: {month.organic}</span>
                            <span>Referral: {month.referral}</span>
                            <span>Direct: {month.direct}</span>
                            <span>Social: {month.social}</span>
                          </div>
                        </div>
                      )) || <div className="text-muted-foreground">No growth trend data available</div>}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Acquisition Channels</CardTitle>
                    <CardDescription>
                      Where your users are coming from
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {growthData?.acquisition.channels?.slice(0, 5).map((channel, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm">{channel.channel}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{channel.users}</span>
                            <span className="text-xs text-muted-foreground">({channel.percentage}%)</span>
                            <span className={`text-xs ${channel.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {channel.trend > 0 ? '+' : ''}{channel.trend.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      )) || <div className="text-muted-foreground">No acquisition data available</div>}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Growth Rate</CardTitle>
                    <CardDescription>
                      Monthly growth percentage
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600">
                          {growthData?.overview.monthlyGrowthRate.toFixed(1) || '0'}%
                        </div>
                        <p className="text-sm text-muted-foreground">Current Growth Rate</p>
                      </div>
                      <div className="pt-4 border-t">
                        <div className="flex justify-between text-sm">
                          <span>Yearly Rate:</span>
                          <span className="font-medium">
                            {growthData?.overview.yearlyGrowthRate.toFixed(1) || '0'}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="acquisition">
            <Card>
              <CardHeader>
                <CardTitle>User Acquisition</CardTitle>
                <CardDescription>
                  Detailed acquisition metrics and sources
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold mb-4">Acquisition Channels</h4>
                    <div className="grid gap-3">
                      {growthData?.acquisition.channels?.map((channel, index) => (
                        <div key={index} className="flex justify-between items-center p-4 border rounded">
                          <div>
                            <span className="font-medium">{channel.channel}</span>
                            <div className="text-sm text-muted-foreground">
                              {channel.users} users ({channel.percentage}%)
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-sm font-medium ${
                              channel.trend > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {channel.trend > 0 ? '+' : ''}{channel.trend.toFixed(1)}%
                            </div>
                            <div className="text-xs text-muted-foreground">trend</div>
                          </div>
                        </div>
                      )) || <div className="text-muted-foreground">No acquisition data available</div>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="retention">
            <Card>
              <CardHeader>
                <CardTitle>User Retention</CardTitle>
                <CardDescription>
                  Retention rates and churn analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <h4 className="text-lg font-semibold mb-4">Retention Metrics</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 border rounded">
                          <span>Retention Rate</span>
                          <span className="font-medium text-green-600">
                            {growthData?.retention.retentionRate.toFixed(1) || '0'}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 border rounded">
                          <span>Churn Rate</span>
                          <span className="font-medium text-red-600">
                            {growthData?.retention.churnRate.toFixed(1) || '0'}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold mb-4">Cohort Summary</h4>
                      <div className="space-y-2">
                        {growthData?.retention.cohorts?.slice(0, 3).map((cohort, index) => (
                          <div key={index} className="p-3 border rounded">
                            <div className="font-medium">{cohort.cohort}</div>
                            <div className="text-sm text-muted-foreground">
                              Month 1: {cohort.month1}% | Month 3: {cohort.month3}% | 
                              Month 6: {cohort.month6}% | Month 12: {cohort.month12}%
                            </div>
                          </div>
                        )) || <div className="text-muted-foreground">No retention data available</div>}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cohort">
            <Card>
              <CardHeader>
                <CardTitle>Cohort Analysis</CardTitle>
                <CardDescription>
                  User cohort retention analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Cohort Data</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-200">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-200 p-2 text-left">Cohort</th>
                          <th className="border border-gray-200 p-2 text-center">Size</th>
                          <th className="border border-gray-200 p-2 text-center">Month 0</th>
                          <th className="border border-gray-200 p-2 text-center">Month 1</th>
                          <th className="border border-gray-200 p-2 text-center">Month 3</th>
                          <th className="border border-gray-200 p-2 text-center">Month 6</th>
                          <th className="border border-gray-200 p-2 text-center">Month 12</th>
                        </tr>
                      </thead>
                      <tbody>
                        {growthData?.cohortAnalysis?.slice(0, 6).map((cohort, index) => (
                          <tr key={index}>
                            <td className="border border-gray-200 p-2 font-medium">{cohort.cohort}</td>
                            <td className="border border-gray-200 p-2 text-center">{cohort.size}</td>
                            <td className="border border-gray-200 p-2 text-center">
                              {cohort.retentionData?.[0]?.percentage?.toFixed(1) || '100.0'}%
                            </td>
                            <td className="border border-gray-200 p-2 text-center">
                              {cohort.retentionData?.[1]?.percentage?.toFixed(1) || '0'}%
                            </td>
                            <td className="border border-gray-200 p-2 text-center">
                              {cohort.retentionData?.[3]?.percentage?.toFixed(1) || '0'}%
                            </td>
                            <td className="border border-gray-200 p-2 text-center">
                              {cohort.retentionData?.[6]?.percentage?.toFixed(1) || '0'}%
                            </td>
                            <td className="border border-gray-200 p-2 text-center">
                              {cohort.retentionData?.[11]?.percentage?.toFixed(1) || '0'}%
                            </td>
                          </tr>
                        )) || (
                          <tr>
                            <td colSpan={7} className="border border-gray-200 p-4 text-center text-muted-foreground">
                              No cohort data available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}