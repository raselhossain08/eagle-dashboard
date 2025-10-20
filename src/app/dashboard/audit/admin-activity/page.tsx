'use client';

import { AuditDashboardShell } from '@/components/audit/audit-dashboard-shell';
import { AdminActivityOverview } from '@/components/audit/admin-activity-overview';
import { useAdminActivitySummary } from '@/hooks/use-audit';
import { useAuditStore } from '@/store/audit-store';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminActivityPage() {
  const { dateRange } = useAuditStore();
  const { data: adminActivity, isLoading } = useAdminActivitySummary(dateRange);

  return (
    <AuditDashboardShell
      title="Admin Activity"
      description="Monitor administrator actions and activity patterns"
    >
      <Card>
        <CardHeader>
          <CardTitle>Admin Activity Overview</CardTitle>
          <CardDescription>
            Track administrator actions, success rates, and risk scores
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <AdminActivityOverview 
              data={adminActivity || []}
              dateRange={dateRange}
            />
          )}
        </CardContent>
      </Card>
    </AuditDashboardShell>
  );
}