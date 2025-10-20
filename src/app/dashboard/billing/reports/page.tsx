// app/dashboard/billing/reports/page.tsx
'use client';

import React, { useState } from 'react';
import { BillingDashboardShell } from '@/components/billing/billing-dashboard-shell';
import { BillingNavigation } from '@/components/billing/billing-navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, TrendingUp, Users, DollarSign, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('30d');

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
      href: '#',
      color: 'text-orange-600',
      updated: '1 week ago',
      frequency: 'Monthly',
    },
    {
      title: 'Plan Performance',
      description: 'Revenue and growth by plan',
      icon: FileText,
      href: '#',
      color: 'text-indigo-600',
      updated: '2 days ago',
      frequency: 'Weekly',
    },
    {
      title: 'Invoice Summary',
      description: 'Invoice status and payment tracking',
      icon: FileText,
      href: '#',
      color: 'text-red-600',
      updated: '4 hours ago',
      frequency: 'Daily',
    },
  ];

  const quickStats = [
    {
      title: 'Reports Generated',
      value: '24',
      description: 'This month',
      icon: FileText,
      color: 'text-blue-600',
    },
    {
      title: 'Total Revenue',
      value: '$197,500',
      description: 'Current MRR',
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      title: 'Active Subscribers',
      value: '1,242',
      description: 'Across all plans',
      icon: Users,
      color: 'text-purple-600',
    },
    {
      title: 'Report Updates',
      value: '12',
      description: 'Today',
      icon: TrendingUp,
      color: 'text-orange-600',
    },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar Navigation */}
      <div className="hidden w-64 lg:block border-r">
        <div className="p-6">
          <BillingNavigation />
        </div>
      </div>

      {/* Main Content */}
      <BillingDashboardShell
        title="Reports & Analytics"
        description="Comprehensive billing reports and financial analytics"
        breadcrumbs={breadcrumbs}
        actions={
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
        }
      >
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {quickStats.map((stat, index) => {
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
            })}
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
              <CardTitle>Recent Report Activity</CardTitle>
              <CardDescription>
                Latest report generations and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { action: 'Revenue Report generated', user: 'System', time: '2 hours ago', type: 'auto' },
                  { action: 'MRR Analysis exported', user: 'You', time: '4 hours ago', type: 'manual' },
                  { action: 'Subscription Analytics updated', user: 'System', time: '6 hours ago', type: 'auto' },
                  { action: 'Customer Cohort report generated', user: 'System', time: '1 day ago', type: 'auto' },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'auto' ? 'bg-green-500' : 'bg-blue-500'
                      }`} />
                      <div>
                        <div className="font-medium">{activity.action}</div>
                        <div className="text-sm text-muted-foreground">
                          by {activity.user} • {activity.time}
                        </div>
                      </div>
                    </div>
                    <Badge variant={activity.type === 'auto' ? 'outline' : 'default'}>
                      {activity.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </BillingDashboardShell>
    </div>
  );
}