// app/dashboard/billing/reports/plan-performance/page.tsx
'use client';

import React, { useState } from 'react';
import { BillingDashboardShell } from '@/components/billing/billing-dashboard-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Download, FileText, Users, DollarSign, TrendingUp } from 'lucide-react';
import { usePlanPerformance } from '@/hooks/use-billing-reports';
import { formatCurrency } from '@/lib/utils';
import { DateRange } from '@/types/billing-reports';

export default function PlanPerformancePage() {
  const [dateRange, setDateRange] = useState('90d');

  // Calculate date range based on selection
  const getDateRange = (): DateRange => {
    const now = new Date();
    const start = new Date();
    
    switch (dateRange) {
      case '30d':
        start.setDate(now.getDate() - 30);
        break;
      case '90d':
        start.setDate(now.getDate() - 90);
        break;
      case '1y':
        start.setFullYear(now.getFullYear() - 1);
        break;
      default:
        start.setDate(now.getDate() - 90);
        break;
    }
    
    return { from: start, to: now };
  };

  const { data: planData, isLoading, error } = usePlanPerformance(getDateRange());

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Billing', href: '/dashboard/billing' },
    { label: 'Reports', href: '/dashboard/billing/reports' },
    { label: 'Plan Performance', href: '#', active: true }
  ];

  if (error) {
    return (
      <div className="flex min-h-screen">
        <BillingDashboardShell
          title="Plan Performance"
          description="Revenue and growth analysis by subscription plan"
          breadcrumbs={breadcrumbs}
        >
          <div className="text-center text-red-600 py-8">
            Failed to load plan performance data. Please try again.
          </div>
        </BillingDashboardShell>
      </div>
    );
  }

  // Calculate totals and metrics
  const totalSubscriptions = planData?.reduce((sum, plan) => sum + plan.totalSubscriptions, 0) || 0;
  const totalRevenue = planData?.reduce((sum, plan) => sum + plan.totalRevenue, 0) || 0;
  const activeSubscriptions = planData?.reduce((sum, plan) => sum + plan.activeSubscriptions, 0) || 0;
  
  return (
    <div className="flex min-h-screen">
      <BillingDashboardShell
        title="Plan Performance"
        description="Revenue and growth analysis by subscription plan"
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex gap-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Performance Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </CardContent>
                </Card>
              ))
            ) : (
              <>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{planData?.length || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Active subscription plans
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
                    <p className="text-xs text-muted-foreground">
                      From all plans
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalSubscriptions}</div>
                    <p className="text-xs text-muted-foreground">
                      All time subscriptions
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Rate</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {totalSubscriptions > 0 ? ((activeSubscriptions / totalSubscriptions) * 100).toFixed(1) : 0}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Active subscription rate
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Plan Performance Table */}
          <Card>
            <CardHeader>
              <CardTitle>Plan Performance Details</CardTitle>
              <CardDescription>
                Detailed performance metrics for each subscription plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="grid grid-cols-6 gap-4 p-4 border rounded-lg">
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                  ))}
                </div>
              ) : planData && planData.length > 0 ? (
                <div className="space-y-4">
                  {planData.map((plan, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-center">
                        <div>
                          <div className="font-medium">{plan.planName}</div>
                          <div className="text-sm text-muted-foreground">Plan ID: {plan._id}</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-lg font-semibold">{plan.totalSubscriptions}</div>
                          <div className="text-xs text-muted-foreground">Total Subscriptions</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-lg font-semibold text-green-600">{plan.activeSubscriptions}</div>
                          <div className="text-xs text-muted-foreground">Active</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-lg font-semibold">{formatCurrency(plan.totalRevenue)}</div>
                          <div className="text-xs text-muted-foreground">Revenue</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-lg font-semibold">
                            {plan.totalSubscriptions > 0 ? ((plan.activeSubscriptions / plan.totalSubscriptions) * 100).toFixed(1) : 0}%
                          </div>
                          <div className="text-xs text-muted-foreground">Active Rate</div>
                        </div>
                        
                        <div>
                          <Progress 
                            value={totalSubscriptions > 0 ? (plan.totalSubscriptions / totalSubscriptions) * 100 : 0} 
                            className="w-full"
                          />
                          <div className="text-xs text-muted-foreground mt-1">
                            {totalSubscriptions > 0 ? ((plan.totalSubscriptions / totalSubscriptions) * 100).toFixed(1) : 0}% of total
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No plan performance data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance Insights */}
          {!isLoading && planData && planData.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Plans</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {planData
                    .sort((a, b) => b.totalRevenue - a.totalRevenue)
                    .slice(0, 3)
                    .map((plan, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{plan.planName}</div>
                          <div className="text-sm text-muted-foreground">
                            {plan.activeSubscriptions} active subscriptions
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(plan.totalRevenue)}</div>
                          <div className="text-sm text-muted-foreground">revenue</div>
                        </div>
                      </div>
                    ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Plan Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Best Conversion Rate</span>
                    <span className="font-medium">
                      {planData
                        .reduce((best, current) => 
                          (current.activeSubscriptions / (current.totalSubscriptions || 1)) > 
                          (best.activeSubscriptions / (best.totalSubscriptions || 1)) ? current : best
                        ).planName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Highest Revenue</span>
                    <span className="font-medium">
                      {planData
                        .reduce((highest, current) => 
                          current.totalRevenue > highest.totalRevenue ? current : highest
                        ).planName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Most Popular</span>
                    <span className="font-medium">
                      {planData
                        .reduce((popular, current) => 
                          current.totalSubscriptions > popular.totalSubscriptions ? current : popular
                        ).planName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Average Revenue per Plan</span>
                    <span className="font-medium">
                      {formatCurrency(totalRevenue / (planData.length || 1))}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </BillingDashboardShell>
    </div>
  );
}