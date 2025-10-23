// app/dashboard/files/admin/analytics/page.tsx
'use client';

import { useState } from 'react';
import { FilesDashboardShell } from '@/components/files/files-dashboard-shell';
import { FilesNavigation } from '@/components/files/files-navigation';
import { StorageAnalyticsDashboard } from '@/components/files/storage-analytics-dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Download, RefreshCw } from 'lucide-react';
import { useSystemAnalytics, useUsageTrends, useUserAnalytics } from '@/hooks/use-files';
import { DateRange } from 'react-day-picker';
import { toast } from 'sonner';

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date()
  });
  const [userPage, setUserPage] = useState(1);

  // Fetch real analytics data
  const { 
    data: analyticsData, 
    isLoading: analyticsLoading, 
    error: analyticsError,
    refetch: refetchAnalytics 
  } = useSystemAnalytics();

  const { 
    data: usageTrends, 
    isLoading: trendsLoading, 
    error: trendsError,
    refetch: refetchTrends 
  } = useUsageTrends(dateRange.from, dateRange.to);

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

  const handleExport = () => {
    // Export functionality could be implemented here
    toast.info('Export functionality will be implemented');
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
        
        {/* Error States */}
        {(analyticsError || trendsError || userError) && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {analyticsError ? `Analytics: ${analyticsError.message}` :
               trendsError ? `Trends: ${trendsError.message}` :
               `Users: ${userError?.message}`}
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
                ) : usageTrends && usageTrends.length > 0 ? (
                  <div className="space-y-4">
                    {/* Simple table display for trends data */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Date</th>
                            <th className="text-left p-2">Uploads</th>
                            <th className="text-left p-2">Total Size</th>
                          </tr>
                        </thead>
                        <tbody>
                          {usageTrends.slice(-10).map((trend) => (
                            <tr key={trend.date} className="border-b">
                              <td className="p-2">{new Date(trend.date).toLocaleDateString()}</td>
                              <td className="p-2">{trend.uploads}</td>
                              <td className="p-2">
                                {(trend.totalSize / (1024 * 1024)).toFixed(2)} MB
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
                  Generate and download detailed reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  Report generation functionality will be implemented here
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </FilesDashboardShell>
  );
}