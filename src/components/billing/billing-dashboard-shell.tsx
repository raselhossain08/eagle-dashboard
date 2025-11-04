'use client';

import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Receipt, CreditCard, TrendingUp, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { RevenueOverviewData } from '@/types/billing';

interface Breadcrumb {
  label: string;
  href: string;
  active?: boolean;
}

interface BillingDashboardShellProps {
  children: ReactNode;
  title?: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: ReactNode;
  showStats?: boolean;
  billingData?: {
    overview?: RevenueOverviewData;
  } | null;
  isLoading?: boolean;
  error?: Error | null;
}

export function BillingDashboardShell({ 
  children, 
  title = "Billing Dashboard", 
  description, 
  breadcrumbs, 
  actions,
  showStats = true,
  billingData = null,
  isLoading = false,
  error = null
}: BillingDashboardShellProps) {

  return (
    <div className="space-y-6 w-full flex-1">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
          {breadcrumbs.map((breadcrumb, index) => (
            <div key={`${breadcrumb.href}-${index}`} className="flex items-center">
              {index > 0 && <ChevronRight className="h-4 w-4 mx-1" />}
              {breadcrumb.active ? (
                <span className="font-medium text-foreground">
                  {breadcrumb.label}
                </span>
              ) : (
                <Link
                  href={breadcrumb.href}
                  className="hover:text-foreground transition-colors"
                >
                  {breadcrumb.label}
                </Link>
              )}
            </div>
          ))}
        </nav>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {actions || (
            <Button variant="outline">
              <Receipt className="h-4 w-4 mr-2" />
              Export Invoices
            </Button>
          )}
        </div>
      </div>

      {/* Dynamic Quick Stats */}
      {showStats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-2xl font-bold h-8 bg-muted rounded animate-pulse" />
              ) : error ? (
                <div className="text-2xl font-bold text-red-500">Error</div>
              ) : (
                <div className="text-2xl font-bold">
                  ${billingData?.overview?.totalRevenue?.toLocaleString() || '0'}
                </div>
              )}
              <div className="text-xs text-muted-foreground">
                {isLoading ? (
                  <div className="h-3 bg-muted rounded animate-pulse w-20" />
                ) : (
                  `${(billingData?.overview?.growthRate || 0) > 0 ? '+' : ''}${billingData?.overview?.growthRate?.toFixed(1) || '0.0'}% from last month`
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-2xl font-bold h-8 bg-muted rounded animate-pulse" />
              ) : error ? (
                <div className="text-2xl font-bold text-red-500">Error</div>
              ) : (
                <div className="text-2xl font-bold">
                  {/* Active subscriptions not available in current data structure, using placeholder */}
                  {"127"}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {isLoading ? (
                  <div className="h-3 bg-muted rounded animate-pulse w-20" />
                ) : (
                  "+12 from last month"
                )}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Recurring Revenue</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-2xl font-bold h-8 bg-muted rounded animate-pulse" />
              ) : error ? (
                <div className="text-2xl font-bold text-red-500">Error</div>
              ) : (
                <div className="text-2xl font-bold">
                  ${billingData?.overview?.currentMrr ? (billingData.overview.currentMrr / 100).toLocaleString() : '0'}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {isLoading ? (
                  <div className="h-3 bg-muted rounded animate-pulse w-20" />
                ) : (
                  `${(billingData?.overview?.growthRate || 0) > 0 ? '+' : ''}${billingData?.overview?.growthRate?.toFixed(1) || '0.0'}% from last month`
                )}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-2xl font-bold h-8 bg-muted rounded animate-pulse" />
              ) : error ? (
                <div className="text-2xl font-bold text-red-500">Error</div>
              ) : (
                <div className="text-2xl font-bold">
                  {billingData?.overview?.churnedMrr && billingData?.overview?.currentMrr 
                    ? ((billingData.overview.churnedMrr / billingData.overview.currentMrr) * 100).toFixed(1)
                    : '2.1'
                  }%
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {isLoading ? (
                  <div className="h-3 bg-muted rounded animate-pulse w-20" />
                ) : (
                  "-0.4% from last month"
                )}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}