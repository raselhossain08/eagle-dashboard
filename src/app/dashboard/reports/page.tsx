'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricCard } from '@/components/reports/MetricCard';
import { ReportOverview } from '@/components/reports/ReportOverview';
import { Button } from '@/components/ui/button';
import { Plus, Download, Calendar } from 'lucide-react';
import { QuickMetric } from '@/types/reports';

// Mock data - replace with actual API calls
const overviewData = {
  totalRevenue: 125000,
  revenueGrowth: 12.5,
  activeSubscriptions: 2450,
  churnRate: 2.1,
  totalUsers: 15600,
  userGrowth: 8.3,
};

const quickMetrics: QuickMetric[] = [
  { label: 'Monthly Revenue', value: 125000, change: 12.5, trend: 'up', format: 'currency' },
  { label: 'Active Users', value: 15600, change: 8.3, trend: 'up', format: 'number' },
  { label: 'Conversion Rate', value: 3.2, change: -0.5, trend: 'down', format: 'percentage' },
  { label: 'Avg. Session', value: 4.5, change: 2.1, trend: 'up', format: 'number' },
];

export default function ReportsDashboard() {
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
        {quickMetrics.map((metric, index) => (
          <MetricCard key={index} metric={metric} />
        ))}
      </div>

      {/* Overview Section */}
      <Card>
        <CardHeader>
          <CardTitle>Business Overview</CardTitle>
          <CardDescription>
            Key performance indicators and growth metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReportOverview data={overviewData} />
        </CardContent>
      </Card>

      {/* Recent Reports & Popular Templates */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
            <CardDescription>Your recently generated reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Recent reports list would go here */}
              <div className="text-center text-muted-foreground py-8">
                No recent reports
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Popular Templates</CardTitle>
            <CardDescription>Quick start with pre-built reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Report templates list would go here */}
              <div className="text-center text-muted-foreground py-8">
                No templates available
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}