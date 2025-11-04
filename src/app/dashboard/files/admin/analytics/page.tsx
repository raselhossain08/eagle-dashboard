// app/dashboard/files/admin/analytics/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { FilesDashboardShell } from '@/components/files/files-dashboard-shell';
import { FilesNavigation } from '@/components/files/files-navigation';
import { StorageAnalyticsDashboard } from '@/components/files/storage-analytics-dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Download, RefreshCw, Calendar } from 'lucide-react';
import { useSystemAnalytics, useUsageTrends, useUserAnalytics } from '@/hooks/use-files';
import { DateRange } from 'react-day-picker';
import { toast } from 'sonner';

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date()
  });
  const [userPage, setUserPage] = useState(1);

  // Fetch real analytics data with proper error handling
  const { 
    data: analyticsData, 
    isLoading: analyticsLoading, 
    error: analyticsError,
    refetch: refetchAnalytics 
  } = useSystemAnalytics();

  // Ensure we have valid date range for trends
  const trendsFromDate = dateRange.from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const trendsToDate = dateRange.to || new Date();

  const { 
    data: usageTrends, 
    isLoading: trendsLoading, 
    error: trendsError,
    refetch: refetchTrends 
  } = useUsageTrends(trendsFromDate, trendsToDate);

  const { 
    data: userAnalytics, 
    isLoading: userLoading, 
    error: userError,
    refetch: refetchUsers 
  } = useUserAnalytics(userPage, 10);

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Files', href: '/dashboard/files' },
    { label: 'Admin', href: '/dashboard/files/admin' },
    { label: 'Analytics' }
  ];

  const handleRefresh = async () => {
    try {
      await Promise.all([
        refetchAnalytics(),
        refetchTrends(),
        refetchUsers()
      ]);
      toast.success('Analytics data refreshed');
    } catch (error) {
      toast.error('Failed to refresh data');
    }
  };

  const handleDateRangeChange = (newDateRange: DateRange) => {
    setDateRange(newDateRange);
    // The useUsageTrends hook will automatically refetch when dates change
  };

  // Auto-refresh data every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      handleRefresh();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleExport = async () => {
    try {
      // Create export request with proper date range
      const fromParam = dateRange.from ? dateRange.from.toISOString() : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const toParam = dateRange.to ? dateRange.to.toISOString() : new Date().toISOString();
      
      // Build export URL
      const exportUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/files/admin/export?format=csv&from=${fromParam}&to=${toParam}`;
      
      // Get auth token
      const token = document.cookie.split('; ').find(row => row.startsWith('accessToken='))?.split('=')[1];
      
      // Fetch export data
      const response = await fetch(exportUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Export request failed');
      }
      
      const data = await response.json();
      
      // Create and download CSV
      if (data.content) {
        const blob = new Blob([data.content], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = data.filename || `files-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast.success('Export completed successfully');
      }
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export data');
    }
  };

  const actions = (
    <div className="flex items-center space-x-2">
      <Button variant="outline" size="sm" onClick={handleRefresh}>
        <RefreshCw className="w-4 h-4 mr-2" />
        Refresh
      </Button>
      <Button variant="outline" size="sm" onClick={handleExport}>
        <Download className="w-4 h-4 mr-2" />
        Export
      </Button>
    </div>
  );

  return (
    <FilesDashboardShell
      title="Storage Analytics"
      description="Comprehensive storage usage and analytics"
      breadcrumbs={breadcrumbs}
      actions={actions}
    >
      <div className="space-y-6">
        <FilesNavigation />
        
        {/* Date Range Selector */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">Date Range:</span>
                <span className="text-sm text-muted-foreground">
                  {dateRange.from ? dateRange.from.toLocaleDateString() : 'Not selected'} - {' '}
                  {dateRange.to ? dateRange.to.toLocaleDateString() : 'Not selected'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDateRangeChange({
                    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    to: new Date()
                  })}
                >
                  Last 7 Days
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDateRangeChange({
                    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    to: new Date()
                  })}
                >
                  Last 30 Days
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDateRangeChange({
                    from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
                    to: new Date()
                  })}
                >
                  Last 90 Days
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Error States */}
        {(analyticsError || trendsError || userError) && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {analyticsError ? `Analytics: ${analyticsError.message}` :
               trendsError ? `Trends: ${trendsError.message}` :
               `Users: ${userError?.message}`}
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-2"
                onClick={handleRefresh}
              >
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="usage">Usage Trends</TabsTrigger>
            <TabsTrigger value="users">User Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {analyticsLoading ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i}>
                      <CardHeader className="pb-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-3 w-16" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-8 w-16" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-40" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-[400px] w-full" />
                  </CardContent>
                </Card>
              </div>
            ) : analyticsError ? (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-3">
                      Failed to load analytics data: {analyticsError.message}
                    </p>
                    <Button variant="outline" size="sm" onClick={() => refetchAnalytics()}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Try Again
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : analyticsData ? (
              <StorageAnalyticsDashboard
                data={analyticsData}
                dateRange={{ from: dateRange.from, to: dateRange.to }}
              />
            ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center text-muted-foreground">
                    No analytics data available
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="usage">
            <Card>
              <CardHeader>
                <CardTitle>Usage Trends</CardTitle>
                <CardDescription>
                  Storage usage and upload trends over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                {trendsLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : trendsError ? (
                  <div className="text-center py-12">
                    <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-3">
                      Failed to load usage trends: {trendsError.message}
                    </p>
                    <Button variant="outline" size="sm" onClick={() => refetchTrends()}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Retry
                    </Button>
                  </div>
                ) : usageTrends && usageTrends.length > 0 ? (
                  <div className="space-y-4">
                    {/* Display summary metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="text-sm text-muted-foreground">Total Uploads</div>
                        <div className="text-xl font-semibold">
                          {usageTrends.reduce((sum, trend) => sum + trend.uploads, 0)}
                        </div>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="text-sm text-muted-foreground">Total Data</div>
                        <div className="text-xl font-semibold">
                          {(usageTrends.reduce((sum, trend) => sum + trend.totalSize, 0) / (1024 * 1024 * 1024)).toFixed(2)} GB
                        </div>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="text-sm text-muted-foreground">Daily Average</div>
                        <div className="text-xl font-semibold">
                          {(usageTrends.reduce((sum, trend) => sum + trend.uploads, 0) / usageTrends.length).toFixed(0)} files/day
                        </div>
                      </div>
                    </div>
                    
                    {/* Table display for trends data */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Date</th>
                            <th className="text-left p-2">Uploads</th>
                            <th className="text-left p-2">Total Size</th>
                            <th className="text-left p-2">Average File Size</th>
                          </tr>
                        </thead>
                        <tbody>
                          {usageTrends.slice(-10).map((trend) => (
                            <tr key={trend.date} className="border-b hover:bg-muted/50">
                              <td className="p-2 font-mono text-xs">
                                {new Date(trend.date).toLocaleDateString()}
                              </td>
                              <td className="p-2">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {trend.uploads}
                                </span>
                              </td>
                              <td className="p-2">
                                {(trend.totalSize / (1024 * 1024)).toFixed(2)} MB
                              </td>
                              <td className="p-2">
                                {trend.uploads > 0 ? 
                                  ((trend.totalSize / trend.uploads) / 1024).toFixed(2) + ' KB' : 
                                  'N/A'
                                }
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No usage trends data available for the selected period
                    <div className="mt-2 text-xs">
                      Try selecting a different date range or check if files were uploaded during this period.
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Analytics</CardTitle>
                <CardDescription>
                  Storage usage by user
                </CardDescription>
              </CardHeader>
              <CardContent>
                {userLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    ))}
                  </div>
                ) : userError ? (
                  <div className="text-center py-12">
                    <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-3">
                      Failed to load user analytics: {userError.message}
                    </p>
                    <Button variant="outline" size="sm" onClick={() => refetchUsers()}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Retry
                    </Button>
                  </div>
                ) : userAnalytics && userAnalytics.users.length > 0 ? (
                  <div className="space-y-4">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">User ID</th>
                            <th className="text-left p-2">File Count</th>
                            <th className="text-left p-2">Total Size</th>
                            <th className="text-left p-2">Average File Size</th>
                          </tr>
                        </thead>
                        <tbody>
                          {userAnalytics.users.map((user) => (
                            <tr key={user.userId} className="border-b">
                              <td className="p-2 font-mono text-xs">
                                {user.userId}
                              </td>
                              <td className="p-2">{user.fileCount}</td>
                              <td className="p-2">
                                {(user.totalSize / (1024 * 1024)).toFixed(2)} MB
                              </td>
                              <td className="p-2">
                                {((user.totalSize / user.fileCount) / 1024).toFixed(2)} KB
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Pagination */}
                    {userAnalytics.totalPages > 1 && (
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          Showing {((userPage - 1) * 10) + 1} to {Math.min(userPage * 10, userAnalytics.total)} of {userAnalytics.total} users
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setUserPage(userPage - 1)}
                            disabled={userPage <= 1}
                          >
                            Previous
                          </Button>
                          <span className="text-sm">
                            Page {userPage} of {userAnalytics.totalPages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setUserPage(userPage + 1)}
                            disabled={userPage >= userAnalytics.totalPages}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No user analytics data available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Reports</CardTitle>
                <CardDescription>
                  Generate and download detailed reports for the selected date range
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Report Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground">Total Files</div>
                        <div className="text-2xl font-bold">
                          {analyticsData?.totalFiles || 0}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground">Total Size</div>
                        <div className="text-2xl font-bold">
                          {analyticsData ? 
                            `${(analyticsData.totalSize / (1024 * 1024 * 1024)).toFixed(2)} GB` : 
                            '0 GB'
                          }
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground">Date Range</div>
                        <div className="text-sm font-medium">
                          {dateRange.from?.toLocaleDateString()} - {dateRange.to?.toLocaleDateString()}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Export Options */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Export Options</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <h4 className="font-medium mb-2">Files Report (CSV)</h4>
                          <p className="text-sm text-muted-foreground mb-4">
                            Export detailed file information including names, sizes, upload dates, and user data.
                          </p>
                          <Button onClick={handleExport} className="w-full">
                            <Download className="w-4 h-4 mr-2" />
                            Export CSV Report
                          </Button>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <h4 className="font-medium mb-2">Analytics Summary (JSON)</h4>
                          <p className="text-sm text-muted-foreground mb-4">
                            Export analytics data including storage trends, user statistics, and system metrics.
                          </p>
                          <Button 
                            onClick={() => {
                              const summaryData = {
                                analytics: analyticsData,
                                usageTrends: usageTrends,
                                userAnalytics: userAnalytics,
                                dateRange: dateRange,
                                exportedAt: new Date().toISOString()
                              };
                              
                              const blob = new Blob([JSON.stringify(summaryData, null, 2)], { 
                                type: 'application/json' 
                              });
                              const url = URL.createObjectURL(blob);
                              const link = document.createElement('a');
                              link.href = url;
                              link.download = `files-analytics-${new Date().toISOString().split('T')[0]}.json`;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                              URL.revokeObjectURL(url);
                              
                              toast.success('Analytics summary exported');
                            }}
                            variant="outline"
                            className="w-full"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Export JSON Summary
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </FilesDashboardShell>
  );
}