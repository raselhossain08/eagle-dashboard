'use client';

import { AdminActivityTimeline } from '@/components/audit/admin-activity-timeline';
import { useAdminActivity, useAdminActivitySummary } from '@/hooks/use-audit';
import { useAuditStore } from '@/store/audit-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, User, Mail, Shield, Activity, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

export default function AdminActivityDetailPage() {
  const params = useParams();
  const adminId = params.adminId as string;
  const { dateRange } = useAuditStore();
  
  const { 
    data: adminActivities, 
    isLoading: activitiesLoading, 
    error: activitiesError 
  } = useAdminActivity(adminId, 30);
  
  const { 
    data: adminSummary, 
    isLoading: summaryLoading, 
    error: summaryError 
  } = useAdminActivitySummary(dateRange);

  const admin = adminSummary?.find(a => a.adminId === adminId);

  // Handle loading states
  if (summaryLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/audit/admin-activity">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Handle errors
  if (summaryError || activitiesError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/audit/admin-activity">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Admin Activity</h1>
        </div>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load admin activity data. Please check your connection and try again.
            {summaryError && <div className="mt-2 text-sm">Summary Error: {summaryError.message}</div>}
            {activitiesError && <div className="mt-2 text-sm">Activities Error: {activitiesError.message}</div>}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Handle admin not found
  if (!admin && !summaryLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/audit/admin-activity">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Admin Not Found</h1>
        </div>
        <div className="text-center py-12">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Admin not found</h3>
          <p className="text-muted-foreground mt-2">
            The requested administrator (ID: {adminId}) could not be found in the selected date range.
          </p>
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">
              Try adjusting the date range or check if the admin ID is correct.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Admin is guaranteed to exist here due to early returns above
  if (!admin) {
    return null; // This should never happen but satisfies TypeScript
  }

  // Calculate additional metrics
  const totalActivities = adminActivities?.length || 0;
  const hasActivities = totalActivities > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/audit/admin-activity">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-3xl font-bold">Admin Activity</h1>
            <Badge variant="secondary">{admin.adminRole}</Badge>
            {admin.riskScore > 2 && (
              <Badge variant="destructive">High Risk</Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {admin.adminEmail}
          </div>
        </div>
      </div>

      <p className="text-muted-foreground">
        Detailed activity timeline for {admin.adminEmail}
      </p>

      {/* Status Indicators */}
      {!hasActivities && !activitiesLoading && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No activity found for this admin in the last 30 days. This could indicate:
            <ul className="mt-2 ml-4 list-disc text-sm">
              <li>The admin has not performed any actions recently</li>
              <li>Audit logging was not enabled for this period</li>
              <li>The admin account is inactive</li>
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Admin Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{admin.actionsCount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {totalActivities} in last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{admin.successRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {admin.successRate >= 95 ? 'Excellent' : admin.successRate >= 80 ? 'Good' : 'Needs attention'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
            <Shield className={`h-4 w-4 ${admin.riskScore > 2 ? 'text-red-500' : admin.riskScore > 1.5 ? 'text-yellow-500' : 'text-green-500'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{admin.riskScore.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              {admin.riskScore > 2 ? 'High Risk' : admin.riskScore > 1.5 ? 'Medium Risk' : 'Low Risk'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Active</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {format(new Date(admin.lastActive), 'MMM dd')}
            </div>
            <p className="text-xs text-muted-foreground">
              {format(new Date(admin.lastActive), 'yyyy, HH:mm')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Activity Timeline (Last 30 Days)</span>
            {hasActivities && (
              <Badge variant="outline">
                {totalActivities} {totalActivities === 1 ? 'activity' : 'activities'}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AdminActivityTimeline
            adminId={adminId}
            activities={adminActivities || []}
            isLoading={activitiesLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}