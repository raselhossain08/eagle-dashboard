'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricCard } from '@/components/reports/MetricCard';
import { ReportOverview } from '@/components/reports/ReportOverview';
import { Button } from '@/components/ui/button';
import { Plus, Download, Calendar } from 'lucide-react';
import { QuickMetric } from '@/types/reports';
import { useDashboardOverview, useRecentReports } from '@/hooks/useReports';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatCurrency, formatPercentage } from '@/lib/utils';

export default function ReportsDashboard() {
  const { data: dashboardData, isLoading: isDashboardLoading, error: dashboardError } = useDashboardOverview();
  const { data: recentReports, isLoading: isReportsLoading, error: reportsError } = useRecentReports(5);

  if (isDashboardLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (dashboardError) {
    return (
      <Alert>
        <AlertDescription>
          Failed to load dashboard data. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  const { overview, quickMetrics, analytics } = dashboardData || {};

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
      </div>

      {/* Quick Metrics Grid */}
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
              ) : recentReports && recentReports.length > 0 ? (
                recentReports.map((report: any) => (
                  <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{report.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {report.type} • {new Date(report.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        report.status === 'completed' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {report.status}
                      </span>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No recent reports
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