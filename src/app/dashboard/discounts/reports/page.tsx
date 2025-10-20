// app/dashboard/discounts/reports/page.tsx
'use client';

import { DiscountsDashboardShell } from '@/components/discounts/discounts-dashboard-shell';
import { RevenueImpactAnalysis } from '@/components/discounts/revenue-impact-analysis';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, BarChart3, TrendingUp, Users } from 'lucide-react';

const mockRevenueData = {
  totalRevenue: 450000,
  revenueWithDiscounts: 289500,
  revenueWithoutDiscounts: 380000,
  discountImpact: 23.8,
  averageUplift: 15.2
};

const mockTrendsData = [
  { date: 'Jan', withDiscounts: 35000, withoutDiscounts: 42000 },
  { date: 'Feb', withDiscounts: 42000, withoutDiscounts: 45000 },
  { date: 'Mar', withDiscounts: 38000, withoutDiscounts: 41000 },
  { date: 'Apr', withDiscounts: 45000, withoutDiscounts: 48000 },
  { date: 'May', withDiscounts: 52000, withoutDiscounts: 55000 },
  { date: 'Jun', withDiscounts: 58000, withoutDiscounts: 62000 },
];

export default function ReportsPage() {
  const actions = (
    <Button variant="outline" size="sm">
      <Download className="mr-2 h-4 w-4" />
      Export Report
    </Button>
  );

  return (
    <DiscountsDashboardShell
      title="Reports & Analytics"
      description="Comprehensive performance reports and revenue analysis"
      actions={actions}
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Discounts', href: '/dashboard/discounts' },
        { label: 'Reports' }
      ]}
    >
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${mockRevenueData.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +18% from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Discount Impact</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{mockRevenueData.discountImpact}%</div>
              <p className="text-xs text-muted-foreground">
                Revenue uplift from discounts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">
                Running marketing campaigns
              </p>
            </CardContent>
          </Card>
        </div>

        <RevenueImpactAnalysis 
          data={mockRevenueData}
          trendsData={mockTrendsData}
        />

        <Card>
          <CardHeader>
            <CardTitle>Quick Reports</CardTitle>
            <CardDescription>
              Generate specific performance reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Button variant="outline" className="h-auto flex-col p-4">
                <BarChart3 className="mb-2 h-6 w-6" />
                <span>Performance</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col p-4">
                <TrendingUp className="mb-2 h-6 w-6" />
                <span>Revenue Impact</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col p-4">
                <Users className="mb-2 h-6 w-6" />
                <span>Customer Analysis</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col p-4">
                <Download className="mb-2 h-6 w-6" />
                <span>Export All</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DiscountsDashboardShell>
  );
}