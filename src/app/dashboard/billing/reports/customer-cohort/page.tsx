// app/dashboard/billing/reports/customer-cohort/page.tsx
'use client';

import React, { useState } from 'react';
import { BillingDashboardShell } from '@/components/billing/billing-dashboard-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, Users, TrendingUp, Calendar } from 'lucide-react';
import { useCustomerCohort } from '@/hooks/use-billing-reports';

export default function CustomerCohortPage() {
  const [cohortType, setCohortType] = useState<'weekly' | 'monthly'>('monthly');
  const [periods, setPeriods] = useState(12);

  const { data: cohortData, isLoading, error } = useCustomerCohort(cohortType, periods);

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Billing', href: '/dashboard/billing' },
    { label: 'Reports', href: '/dashboard/billing/reports' },
    { label: 'Customer Cohort', href: '#', active: true }
  ];

  if (error) {
    return (
      <div className="flex min-h-screen">
        <BillingDashboardShell
          title="Customer Cohort Analysis"
          description="Customer retention and lifetime value analysis"
          breadcrumbs={breadcrumbs}
        >
          <div className="text-center text-red-600 py-8">
            Failed to load cohort data. Please try again.
          </div>
        </BillingDashboardShell>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <BillingDashboardShell
        title="Customer Cohort Analysis"
        description="Customer retention and lifetime value analysis"
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex gap-2">
            <Select value={cohortType} onValueChange={(value: 'weekly' | 'monthly') => setCohortType(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
            <Select value={periods.toString()} onValueChange={(value) => setPeriods(parseInt(value))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6 Periods</SelectItem>
                <SelectItem value="12">12 Periods</SelectItem>
                <SelectItem value="24">24 Periods</SelectItem>
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
          {/* Cohort Overview */}
          <div className="grid gap-4 md:grid-cols-3">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
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
                    <CardTitle className="text-sm font-medium">Total Cohorts</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{cohortData?.length || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Customer groups analyzed
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Retention</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {cohortData?.length > 0 
                        ? (cohortData.reduce((sum: number, cohort: any) => 
                            sum + (cohort.retention?.[1] || 0), 0) / cohortData.length).toFixed(1)
                        : 0}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      First period retention
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Latest Cohort</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {cohortData?.[cohortData.length - 1]?.customers || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {cohortData?.[cohortData.length - 1]?.period || 'No data'}
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Cohort Table */}
          <Card>
            <CardHeader>
              <CardTitle>Cohort Retention Analysis</CardTitle>
              <CardDescription>
                Customer retention rates by cohort period
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="grid grid-cols-6 gap-4">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-8 w-full" />
                      ))}
                    </div>
                  ))}
                </div>
              ) : cohortData && cohortData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Cohort</th>
                        <th className="text-left p-2">Size</th>
                        {Array.from({ length: Math.min(periods, 12) }, (_, i) => (
                          <th key={i} className="text-center p-2">
                            {cohortType === 'monthly' ? `M${i}` : `W${i}`}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {cohortData.map((cohort: any, index: number) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium">{cohort.period}</td>
                          <td className="p-2">{cohort.customers}</td>
                          {Array.from({ length: Math.min(periods, 12) }, (_, i) => (
                            <td key={i} className="p-2 text-center">
                              {cohort.retention?.[i] !== undefined ? (
                                <span 
                                  className={`px-2 py-1 rounded text-xs ${
                                    cohort.retention[i] >= 50 ? 'bg-green-100 text-green-800' :
                                    cohort.retention[i] >= 25 ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {cohort.retention[i].toFixed(1)}%
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No cohort data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cohort Insights */}
          {!isLoading && cohortData && cohortData.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Retention Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Best Performing Cohort</span>
                    <span className="font-medium">
                      {cohortData.reduce((best: any, current: any) => 
                        (current.retention?.[1] || 0) > (best.retention?.[1] || 0) ? current : best
                      ).period}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Average Cohort Size</span>
                    <span className="font-medium">
                      {Math.round(cohortData.reduce((sum: number, cohort: any) => 
                        sum + cohort.customers, 0) / cohortData.length)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Retention Trend</span>
                    <span className="font-medium text-green-600">Stable</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cohort Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Customers Analyzed</span>
                    <span className="font-medium">
                      {cohortData.reduce((sum: number, cohort: any) => sum + cohort.customers, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Time Period</span>
                    <span className="font-medium">
                      {cohortData[0]?.period} - {cohortData[cohortData.length - 1]?.period}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Analysis Type</span>
                    <span className="font-medium capitalize">{cohortType}</span>
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