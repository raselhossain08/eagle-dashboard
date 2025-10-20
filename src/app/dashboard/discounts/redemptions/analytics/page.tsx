// app/dashboard/discounts/redemptions/analytics/page.tsx
'use client';

import { DiscountsDashboardShell } from '@/components/discounts/discounts-dashboard-shell';
import { RedemptionAnalyticsDashboard } from '@/components/discounts/redemption-analytics-dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Calendar, TrendingUp, Users, DollarSign, ShoppingCart } from 'lucide-react';
import { useState } from 'react';

const mockAnalyticsData = {
  totalRedemptions: 1247,
  totalRevenue: 289500,
  averageOrderValue: 232.3,
  topChannels: [
    { channel: 'Email', redemptions: 456 },
    { channel: 'Social Media', redemptions: 389 },
    { channel: 'Direct', redemptions: 234 },
    { channel: 'Affiliate', redemptions: 168 },
  ],
  topCodes: [
    { code: 'SUMMER25', redemptions: 156 },
    { code: 'WELCOME10', redemptions: 134 },
    { code: 'BLACKFRIDAY', redemptions: 98 },
    { code: 'NEWYEAR20', redemptions: 87 },
  ],
  conversionFunnel: [
    { step: 'Discount Viewed', count: 5000 },
    { step: 'Discount Applied', count: 1500 },
    { step: 'Checkout Started', count: 1200 },
    { step: 'Purchase Completed', count: 950 },
  ]
};

const mockDateRange = {
  from: new Date('2024-06-01'),
  to: new Date('2024-07-20')
};

export default function RedemptionAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d');

  const actions = (
    <div className="flex space-x-2">
      <Select value={timeRange} onValueChange={setTimeRange}>
        <SelectTrigger className="w-[130px]">
          <Calendar className="h-4 w-4 mr-2" />
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
        Export Report
      </Button>
    </div>
  );

  return (
    <DiscountsDashboardShell
      title="Redemption Analytics"
      description="Comprehensive analytics and insights into discount code redemptions"
      actions={actions}
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Discounts', href: '/dashboard/discounts' },
        { label: 'Redemptions', href: '/dashboard/discounts/redemptions' },
        { label: 'Analytics' }
      ]}
    >
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Redemptions</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
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
              <CardTitle className="text-sm font-medium">Revenue Generated</CardTitle>
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
              <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$232.30</div>
              <p className="text-xs text-muted-foreground">
                +5.2% from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">19.0%</div>
              <p className="text-xs text-muted-foreground">
                +3.1% from last period
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Analytics Dashboard */}
        <RedemptionAnalyticsDashboard
          data={mockAnalyticsData}
          dateRange={mockDateRange}
        />

        {/* Additional Insights */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Channels</CardTitle>
              <CardDescription>
                Marketing channels driving the most redemptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAnalyticsData.topChannels.map((channel, index) => (
                  <div key={channel.channel} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                        {index + 1}
                      </div>
                      <span className="font-medium">{channel.channel}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{channel.redemptions} redemptions</div>
                      <div className="text-sm text-muted-foreground">
                        {((channel.redemptions / mockAnalyticsData.totalRedemptions) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Most Popular Codes</CardTitle>
              <CardDescription>
                Discount codes with highest redemption rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAnalyticsData.topCodes.map((code, index) => (
                  <div key={code.code} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
                        {index + 1}
                      </div>
                      <span className="font-mono font-medium">{code.code}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{code.redemptions} redemptions</div>
                      <div className="text-sm text-muted-foreground">
                        {((code.redemptions / mockAnalyticsData.totalRedemptions) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DiscountsDashboardShell>
  );
}