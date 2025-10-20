// app/dashboard/discounts/reports/performance/page.tsx
'use client';

import { DiscountsDashboardShell } from '@/components/discounts/discounts-dashboard-shell';
import { DiscountPerformanceChart } from '@/components/discounts/discount-performance-chart';
import { ConversionFunnelChart } from '@/components/discounts/conversion-funnel-chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Filter, BarChart3, TrendingUp, Users, Target, DollarSign } from 'lucide-react';
import { useState } from 'react';

const mockPerformanceData = [
  { code: 'SUMMER25', redemptions: 156, revenue: 45200, discountAmount: 11200, roi: 4.03 },
  { code: 'WELCOME10', redemptions: 134, revenue: 38900, discountAmount: 8900, roi: 4.37 },
  { code: 'BLACKFRIDAY', redemptions: 98, revenue: 56700, discountAmount: 14300, roi: 3.97 },
  { code: 'NEWYEAR20', redemptions: 87, revenue: 31200, discountAmount: 7800, roi: 4.00 },
  { code: 'SPRING15', redemptions: 76, revenue: 28900, discountAmount: 6700, roi: 4.31 },
  { code: 'FALL30', redemptions: 65, revenue: 42300, discountAmount: 12800, roi: 3.30 },
  { code: 'WINTER25', redemptions: 54, revenue: 19800, discountAmount: 5200, roi: 3.81 },
];

const mockFunnelData = [
  { step: 'Page Views', count: 10000, conversionRate: 100 },
  { step: 'Add to Cart', count: 2500, conversionRate: 25 },
  { step: 'Checkout Start', count: 1500, conversionRate: 15 },
  { step: 'Discount Applied', count: 800, conversionRate: 8 },
  { step: 'Purchase Complete', count: 650, conversionRate: 6.5 },
];

export default function PerformanceReportsPage() {
  const [timeRange, setTimeRange] = useState('30d');
  const [metric, setMetric] = useState<'redemptions' | 'revenue' | 'roi'>('revenue');
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');

  const actions = (
    <div className="flex space-x-2">
      <Select value={timeRange} onValueChange={setTimeRange}>
        <SelectTrigger className="w-[130px]">
          <Filter className="h-4 w-4 mr-2" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7d">Last 7 days</SelectItem>
          <SelectItem value="30d">Last 30 days</SelectItem>
          <SelectItem value="90d">Last 90 days</SelectItem>
          <SelectItem value="1y">Last year</SelectItem>
        </SelectContent>
      </Select>
      <Button variant="outline" size="sm">
        <Download className="mr-2 h-4 w-4" />
        Export
      </Button>
    </div>
  );

  return (
    <DiscountsDashboardShell
      title="Performance Reports"
      description="Detailed analytics and performance metrics for all discount campaigns"
      actions={actions}
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Discounts', href: '/dashboard/discounts' },
        { label: 'Reports', href: '/dashboard/discounts/reports' },
        { label: 'Performance' }
      ]}
    >
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$289.5K</div>
              <p className="text-xs text-muted-foreground">
                +18.2% from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Redemptions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-muted-foreground">
                +12.4% from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. ROI</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.2x</div>
              <p className="text-xs text-muted-foreground">
                +0.3x from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12.4%</div>
              <p className="text-xs text-muted-foreground">
                +2.1% from last period
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Chart Controls */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Discount Performance</CardTitle>
                <CardDescription>
                  Compare performance across different discount codes
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                <Select value={metric} onValueChange={(value: any) => setMetric(value)}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="redemptions">Redemptions</SelectItem>
                    <SelectItem value="revenue">Revenue</SelectItem>
                    <SelectItem value="roi">ROI</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={chartType} onValueChange={(value: any) => setChartType(value)}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bar">Bar</SelectItem>
                    <SelectItem value="line">Line</SelectItem>
                    <SelectItem value="pie">Pie</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DiscountPerformanceChart
              data={mockPerformanceData}
              metric={metric}
              chartType={chartType}
            />
          </CardContent>
        </Card>

        {/* Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
            <CardDescription>
              Customer journey from page view to purchase with discounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ConversionFunnelChart data={mockFunnelData} />
          </CardContent>
        </Card>

        {/* Top Performers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Discounts</CardTitle>
            <CardDescription>
              Best performing discount codes by ROI and revenue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockPerformanceData.slice(0, 5).map((item, index) => (
                <div key={item.code} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{item.code}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.redemptions} redemptions
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${item.revenue.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">
                      ROI: {item.roi}x
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DiscountsDashboardShell>
  );
}