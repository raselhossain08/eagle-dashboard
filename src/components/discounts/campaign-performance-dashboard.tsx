// components/discounts/campaign-performance-dashboard.tsx
'use client';

import { Campaign } from '@/types/discounts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Users, DollarSign, Target, Calendar } from 'lucide-react';

interface CampaignPerformanceDashboardProps {
  campaign: Campaign;
  metrics: {
    redemptions: number;
    revenue: number;
    roi: number;
    conversionRate: number;
    costPerAcquisition: number;
  };
  trendsData: Array<{
    date: string;
    redemptions: number;
    revenue: number;
  }>;
  isLoading?: boolean;
}

export function CampaignPerformanceDashboard({
  campaign,
  metrics,
  trendsData,
  isLoading
}: CampaignPerformanceDashboardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const budgetUsage = campaign.budget ? (campaign.totalRevenue / campaign.budget) * 100 : 0;
  const revenueProgress = campaign.revenueGoal ? (campaign.totalRevenue / campaign.revenueGoal) * 100 : 0;
  const conversionProgress = campaign.conversionGoal ? (metrics.redemptions / campaign.conversionGoal) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Campaign Status */}
      <Card>
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Status</div>
              <Badge variant={campaign.isActive ? "default" : "secondary"}>
                {campaign.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Type</div>
              <div className="font-medium capitalize">{campaign.type}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Duration</div>
              <div className="font-medium">
                {new Date(campaign.startDate).toLocaleDateString()} - {' '}
                {campaign.endDate ? new Date(campaign.endDate).toLocaleDateString() : 'Ongoing'}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Channels</div>
              <div className="font-medium">{campaign.channels.join(', ')}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.revenue)}</div>
            <Progress value={revenueProgress} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {revenueProgress.toFixed(1)}% of goal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ROI</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.roi}x</div>
            <p className="text-xs text-muted-foreground">
              Return on investment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Redemptions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.redemptions}</div>
            <Progress value={conversionProgress} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {conversionProgress.toFixed(1)}% of goal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPA</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.costPerAcquisition)}</div>
            <p className="text-xs text-muted-foreground">
              Cost per acquisition
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
            <CardDescription>Weekly revenue performance</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendsData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} tickFormatter={(value) => `$${value / 1000}k`} />
                <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Redemption Trends</CardTitle>
            <CardDescription>Weekly redemption activity</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={trendsData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="redemptions" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}