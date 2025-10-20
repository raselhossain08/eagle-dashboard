'use client';

import { AuditDashboardShell } from '@/components/audit/audit-dashboard-shell';
import { AdminActivityTimeline } from '@/components/audit/admin-activity-timeline';
import { useAdminActivity, useAdminActivitySummary } from '@/hooks/use-audit';
import { useAuditStore } from '@/store/audit-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, User, Mail, Shield, Activity } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminActivityDetailPage() {
  const params = useParams();
  const adminId = params.adminId as string;
  const { dateRange } = useAuditStore();
  
  const { data: adminActivities, isLoading: activitiesLoading } = useAdminActivity(adminId, 30);
  const { data: adminSummary, isLoading: summaryLoading } = useAdminActivitySummary(dateRange);

  const admin = adminSummary?.find(a => a.adminId === adminId);

  if (summaryLoading) {
    return (
      <AuditDashboardShell
        title={
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/audit/admin-activity">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <Skeleton className="h-8 w-48" />
          </div>
        }
      >
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AuditDashboardShell>
    );
  }

  if (!admin) {
    return (
      <AuditDashboardShell
        title={
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/audit/admin-activity">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <span>Admin Not Found</span>
          </div>
        }
      >
        <div className="text-center py-12">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Admin not found</h3>
          <p className="text-muted-foreground mt-2">
            The requested administrator could not be found.
          </p>
        </div>
      </AuditDashboardShell>
    );
  }

  return (
    <AuditDashboardShell
      title={
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/audit/admin-activity">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <span>Admin Activity</span>
              <Badge variant="secondary">{admin.adminRole}</Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              {admin.adminEmail}
            </div>
          </div>
        </div>
      }
      description={`Detailed activity timeline for ${admin.adminEmail}`}
    >
      {/* Admin Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{admin.actionsCount.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{admin.successRate.toFixed(1)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{admin.riskScore}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Active</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date(admin.lastActive).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminActivityTimeline
            adminId={adminId}
            activities={adminActivities || []}
            isLoading={activitiesLoading}
          />
        </CardContent>
      </Card>
    </AuditDashboardShell>
  );
}