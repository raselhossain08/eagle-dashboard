// app/dashboard/billing/reports/page.tsx
'use client';

import React, { useState } from 'react';
import { BillingDashboardShell } from '@/components/billing/billing-dashboard-shell';
import { BillingNavigation } from '@/components/billing/billing-navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, FileText, TrendingUp, Users, DollarSign, Calendar, RefreshCw } from 'lucide-react';
import { useDashboardStats, useRecentActivity, useRefreshBillingReports } from '@/hooks/use-billing-reports';
import Link from 'next/link';
import { DashboardStats, BillingActivity } from '@/types/billing-reports';

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('30d');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Fetch real data using hooks with no auto-refresh
  const { data: dashboardStats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useDashboardStats({
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });
  const { data: recentActivity, isLoading: activityLoading, error: activityError, refetch: refetchActivity } = useRecentActivity(4, {
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });
  const refreshReportsMutation = useRefreshBillingReports();

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Billing', href: '/dashboard/billing' },
    { label: 'Reports', href: '#', active: true }
  ];

  const reports = [
    {
      title: 'Revenue Report',
      description: 'Detailed revenue analysis and trends',
      icon: DollarSign,
      href: '/dashboard/billing/reports/revenue',
      color: 'text-green-600',
      updated: '2 hours ago',
      frequency: 'Daily',
    },
    {
      title: 'MRR Analysis',
      description: 'Monthly recurring revenue breakdown',
      icon: TrendingUp,
      href: '/dashboard/billing/reports/mrr',
      color: 'text-blue-600',
      updated: '1 day ago',
      frequency: 'Weekly',
    },
    {
      title: 'Subscription Analytics',
      description: 'Subscription metrics and churn analysis',
      icon: Users,
      href: '/dashboard/billing/subscriptions/analytics',
      color: 'text-purple-600',
      updated: '3 hours ago',
      frequency: 'Daily',
    },
    {
      title: 'Customer Cohort',
      description: 'Customer retention and lifetime value',
      icon: Users,
      href: '/dashboard/billing/reports/customer-cohort',
      color: 'text-orange-600',
      updated: '1 week ago',
      frequency: 'Monthly',
    },
    {
      title: 'Plan Performance',
      description: 'Revenue and growth by plan',
      icon: FileText,
      href: '/dashboard/billing/reports/plan-performance',
      color: 'text-indigo-600',
      updated: '2 days ago',
      frequency: 'Weekly',
    },
    {
      title: 'Invoice Summary',
      description: 'Invoice status and payment tracking',
      icon: FileText,
      href: '/dashboard/billing/reports/invoice-summary',
      color: 'text-red-600',
      updated: '4 hours ago',
      frequency: 'Daily',
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount / 100); // Assuming amounts are in cents
  };

  const getQuickStats = () => {
    if (!dashboardStats) return [];
    
    return [
      {
        title: 'Total Plans',
        value: dashboardStats.totalPlans?.toString() || '0',
        description: 'Active plans',
        icon: FileText,
        color: 'text-blue-600',
      },
      {
        title: 'Monthly Revenue',
        value: formatCurrency(dashboardStats.monthlyRevenue || 0),
        description: `${dashboardStats.revenueGrowth > 0 ? '+' : ''}${dashboardStats.revenueGrowth.toFixed(1)}% from last month`,
        icon: DollarSign,
        color: 'text-green-600',
      },
      {
        title: 'Active Subscriptions',
        value: dashboardStats.activeSubscriptions?.toString() || '0',
        description: 'Current subscribers',
        icon: Users,
        color: 'text-purple-600',
      },
      {
        title: 'New Customers',
        value: dashboardStats.newCustomers?.toString() || '0',
        description: 'This month',
        icon: TrendingUp,
        color: 'text-orange-600',
      },
    ];
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetchStats(), refetchActivity()]);
      refreshReportsMutation.mutate();
    } catch (error) {
      console.error('Error refreshing dashboard data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Main Content */}
      <BillingDashboardShell
        title="Reports & Analytics"
        description="Comprehensive billing reports and financial analytics"
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={isRefreshing || refreshReportsMutation.isPending}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${(isRefreshing || refreshReportsMutation.isPending) ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Loading...' : 'Refresh'}
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Export All
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statsLoading ? (
              // Loading skeletons
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
            ) : statsError ? (
              <div className="col-span-4 text-center text-red-600">
                Failed to load dashboard stats
              </div>
            ) : (
              getQuickStats().map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={index}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {stat.title}
                      </CardTitle>
                      <Icon className={`h-4 w-4 ${stat.color}`} />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <p className="text-xs text-muted-foreground">
                        {stat.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {/* Reports Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reports.map((report, index) => {
              const Icon = report.icon;
              return (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Icon className={`h-8 w-8 ${report.color}`} />
                      <Badge variant="outline">{report.frequency}</Badge>
                    </div>
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                    <CardDescription>{report.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Updated</span>
                      <span>{report.updated}</span>
                    </div>
                    <div className="flex gap-2">
                      <Link href={report.href} className="flex-1">
                        <Button className="w-full" size="sm">
                          View Report
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest billing activity and events
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activityLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Skeleton className="w-2 h-2 rounded-full" />
                        <div>
                          <Skeleton className="h-4 w-48 mb-2" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                      <Skeleton className="h-6 w-16" />
                    </div>
                  ))}
                </div>
              ) : activityError ? (
                <div className="text-center text-red-600 py-4">
                  Failed to load recent activity
                </div>
              ) : recentActivity && recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity: BillingActivity, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.type === 'subscription' ? 'bg-green-500' : 'bg-blue-500'
                        }`} />
                        <div>
                          <div className="font-medium">{activity.description}</div>
                          <div className="text-sm text-muted-foreground">
                            {activity.user} • {new Date(activity.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={activity.type === 'subscription' ? 'default' : 'outline'}>
                          {activity.type}
                        </Badge>
                        {activity.amount && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {formatCurrency(activity.amount)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  No recent activity
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </BillingDashboardShell>
    </div>
  );
}