// app/dashboard/subscribers/analytics/page.tsx (Updated)
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  TrendingUp, 
  Activity, 
  DollarSign,
  Download,
  Calendar
} from 'lucide-react';
import { SubscriberGrowthChart } from '@/components/analytics/SubscriberGrowthChart';
import { RevenueChart } from '@/components/analytics/RevenueChart';
import { ChurnRateChart } from '@/components/analytics/ChurnRateChart';
import { LTVChart } from '@/components/analytics/LTVChart';

const analyticsData = {
  totalSubscribers: 2847,
  activeSubscriptions: 2451,
  monthlyGrowth: 5.2,
  churnRate: 2.1,
  averageLtv: 1247,
  mrr: 125847,
  arr: 1510164
};

export default function AnalyticsDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscriber Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive analytics and insights about your subscribers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Last 30 Days
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="growth">Growth</TabsTrigger>
          <TabsTrigger value="churn">Churn Analysis</TabsTrigger>
          <TabsTrigger value="ltv">Lifetime Value</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.totalSubscribers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Growth</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+{analyticsData.monthlyGrowth}%</div>
                <p className="text-xs text-muted-foreground">
                  +124 new subscribers
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.churnRate}%</div>
                <p className="text-xs text-muted-foreground">
                  -0.3% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg LTV</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${analyticsData.averageLtv.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +2.1% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Subscriber Growth</CardTitle>
                <CardDescription>Monthly subscriber acquisition trends</CardDescription>
              </CardHeader>
              <CardContent>
                <SubscriberGrowthChart />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>Monthly recurring revenue and growth</CardDescription>
              </CardHeader>
              <CardContent>
                <RevenueChart />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Churn Rate</CardTitle>
                <CardDescription>Monthly churn rate and lost subscribers</CardDescription>
              </CardHeader>
              <CardContent>
                <ChurnRateChart />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lifetime Value</CardTitle>
                <CardDescription>Customer LTV and average order value</CardDescription>
              </CardHeader>
              <CardContent>
                <LTVChart />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="growth">
          <Card>
            <CardHeader>
              <CardTitle>Growth Analytics</CardTitle>
              <CardDescription>
                Subscriber growth trends and acquisition channels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SubscriberGrowthChart />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="churn">
          <Card>
            <CardHeader>
              <CardTitle>Churn Analysis</CardTitle>
              <CardDescription>
                Churn rates and retention analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChurnRateChart />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ltv">
          <Card>
            <CardHeader>
              <CardTitle>Lifetime Value Analysis</CardTitle>
              <CardDescription>
                Customer lifetime value trends and predictions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LTVChart />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}