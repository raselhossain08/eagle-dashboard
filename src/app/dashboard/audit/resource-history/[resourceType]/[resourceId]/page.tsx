'use client';

import { AuditDashboardShell } from '@/components/audit/audit-dashboard-shell';
import { AuditLogsTable } from '@/components/audit/audit-logs-table';
import { useResourceAudit } from '@/hooks/use-audit';
import { useAuditStore } from '@/store/audit-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function ResourceHistoryDetailPage() {
  const params = useParams();
  const resourceType = params.resourceType as string;
  const resourceId = params.resourceId as string;
  
  const { pagination, sorting } = useAuditStore();
  const { data: resourceLogs, isLoading } = useResourceAudit(resourceType, resourceId);

  const formattedResourceType = resourceType.charAt(0).toUpperCase() + resourceType.slice(1);

  return (
    <AuditDashboardShell
      title={
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/audit/resource-history">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <span>Resource History</span>
              <Badge variant="secondary">{formattedResourceType}</Badge>
            </div>
            <div className="text-sm text-muted-foreground font-mono">
              {resourceId}
            </div>
          </div>
        </div>
      }
      description={`Complete audit history for ${formattedResourceType} resource`}
    >
      <AuditLogsTable
        data={resourceLogs || []}
        pagination={{
          page: 1,
          limit: resourceLogs?.length || 0,
          total: resourceLogs?.length || 0,
          totalPages: 1
        }}
        isLoading={isLoading}
        sorting={sorting}
      />
    </AuditDashboardShell>
  );
}