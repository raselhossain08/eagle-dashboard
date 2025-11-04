'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricCard } from '@/components/reports/MetricCard';
import { ReportOverview } from '@/components/reports/ReportOverview';
import { ReportsErrorBoundary } from './error-boundary';
import { Button } from '@/components/ui/button';
import { Plus, Download, Calendar, RefreshCw, AlertTriangle } from 'lucide-react';
import { QuickMetric, ReportListItem, DashboardOverview } from '@/types/reports';
import { useDashboardOverview, useRecentReports, useRefreshReports } from '@/hooks/useReports';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { useEffect } from 'react';

export default function ReportsDashboard() {
  return (
    <ReportsErrorBoundary>
      <ReportsDashboardContent />
    </ReportsErrorBoundary>
  );
}

function ReportsDashboardContent() {
  const { 
    data: dashboardData, 
    isLoading: isDashboardLoading, 
    error: dashboardError,
    refetch: refetchDashboard
  } = useDashboardOverview();
  
  const { 
    data: recentReports, 
    isLoading: isReportsLoading, 
    error: reportsError,
    refetch: refetchReports
  } = useRecentReports(5);
  
  const refreshMutation = useRefreshReports();

  const handleRefreshAll = () => {
    refreshMutation.mutate({});
  };

  if (isDashboardLoading) {
    return <ReportsDashboardLoading />;
  }

  if (dashboardError) {
    return <ReportsDashboardError error={dashboardError} onRetry={() => refetchDashboard()} />;
  }

  const { overview, quickMetrics, analytics }: DashboardOverview = dashboardData || {
    overview: {
      totalRevenue: 0,
      revenueGrowth: 0,
      activeSubscriptions: 0,
      churnRate: 0,
      totalUsers: 0,
      userGrowth: 0,
    },
    quickMetrics: [],
    analytics: {
      bounceRate: 0,
      avgSessionDuration: 0,
      newUsers: 0,
      returningUsers: 0,
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive analytics and business intelligence
          </p>
        </div>
          <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefreshAll}
            disabled={refreshMutation.isPending}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Date Range
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Report
          </Button>
        </div>
        
        {/* Real-time Data Indicator */}
        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <span>Live Data</span>
          </div>
          <span>• Auto-refresh: 5min</span>
        </div>
      </div>      {/* Quick Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickMetrics?.map((metric: QuickMetric, index: number) => (
          <MetricCard key={index} metric={metric} />
        ))}
      </div>

      {/* Overview Section */}
      {overview && (
        <Card>
          <CardHeader>
            <CardTitle>Business Overview</CardTitle>
            <CardDescription>
              Key performance indicators and growth metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReportOverview data={overview} />
          </CardContent>
        </Card>
      )}

      {/* Recent Reports & Popular Templates */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
            <CardDescription>Your recently generated reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isReportsLoading ? (
                <div className="flex justify-center py-4">
                  <LoadingSpinner />
                </div>
              ) : reportsError ? (
                <div className="text-center text-muted-foreground py-8">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                  <p>Failed to load recent reports</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => refetchReports()}
                    className="mt-2"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Retry
                  </Button>
                </div>
              ) : recentReports && recentReports.length > 0 ? (
                recentReports.map((report: ReportListItem) => (
                  <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{report.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {report.type} • {new Date(report.createdAt).toLocaleDateString()}
                        {report.size && ` • ${report.size}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        report.status === 'completed' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                          : report.status === 'processing'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                          : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                      }`}>
                        {report.status}
                      </span>
                      {report.status === 'completed' && (
                        <Button variant="ghost" size="sm" title="Download Report">
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <div className="mb-4">
                    <Calendar className="h-12 w-12 mx-auto opacity-50" />
                  </div>
                  <p>No recent reports found</p>
                  <p className="text-xs mt-1">Create your first report to get started</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analytics Summary</CardTitle>
            <CardDescription>Real-time analytics overview</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Bounce Rate</span>
                  <span className="text-sm text-muted-foreground">
                    {formatPercentage(analytics.bounceRate)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Avg. Session Duration</span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(analytics.avgSessionDuration / 60)}m
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">New Users</span>
                  <span className="text-sm text-muted-foreground">
                    {analytics.newUsers?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Returning Users</span>
                  <span className="text-sm text-muted-foreground">
                    {analytics.returningUsers?.toLocaleString()}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No analytics data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Loading component
function ReportsDashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-9 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-9 w-28 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      {/* Quick Metrics Loading */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="space-y-2">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Loading */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 w-full bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-6 w-full bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Error component
function ReportsDashboardError({ error, onRetry }: { error: any; onRetry: () => void }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to load reports data</h3>
            <p className="text-muted-foreground mb-4">
              {error instanceof Error ? error.message : 'Unknown error occurred'}
            </p>
            <Button onClick={onRetry} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}