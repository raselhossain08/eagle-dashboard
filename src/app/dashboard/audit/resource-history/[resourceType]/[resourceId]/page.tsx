'use client';

import { AuditDashboardShell } from '@/components/audit/audit-dashboard-shell';
import { AuditLogsTable } from '@/components/audit/audit-logs-table';
import { useResourceAudit, useExportAuditLogs } from '@/hooks/use-audit';
import { useAuditStore } from '@/store/audit-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Download, AlertTriangle, Calendar, User, Activity } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { format } from 'date-fns';
import { AuditLog } from '@/types/audit';

export default function ResourceHistoryDetailPage() {
  const params = useParams();
  const resourceType = params.resourceType as string;
  const resourceId = params.resourceId as string;
  
  const { pagination, sorting } = useAuditStore();
  const { data: resourceLogs, isLoading, error } = useResourceAudit(resourceType, resourceId);
  const exportMutation = useExportAuditLogs();
  const [isExporting, setIsExporting] = useState(false);

  const formattedResourceType = resourceType.charAt(0).toUpperCase() + resourceType.slice(1);

  // Calculate summary statistics
  const summary = resourceLogs ? {
    totalEvents: resourceLogs.length,
    successfulEvents: resourceLogs.filter(log => log.status === 'success').length,
    failedEvents: resourceLogs.filter(log => log.status !== 'success').length,
    uniqueAdmins: new Set(resourceLogs.map(log => log.adminUserId)).size,
    dateRange: resourceLogs.length > 0 ? {
      earliest: new Date(Math.min(...resourceLogs.map(log => new Date(log.timestamp).getTime()))),
      latest: new Date(Math.max(...resourceLogs.map(log => new Date(log.timestamp).getTime())))
    } : null,
    lastModified: resourceLogs.length > 0 ? resourceLogs[0]?.timestamp : null
  } : null;

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await exportMutation.mutateAsync({
        resourceType,
        resourceId,
        limit: 10000 // Export all logs for this resource
      });
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const renderError = () => (
    <Alert className="mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        Failed to load resource history: {error?.message || 'Unknown error'}
      </AlertDescription>
    </Alert>
  );

  return (
    <AuditDashboardShell
      title="Resource History"
      description={`Complete audit history for ${formattedResourceType} resource`}
    >
      <div className="space-y-6">
        {/* Header with navigation and actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/audit/resource-history">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-semibold">Resource History</span>
                <Badge variant="secondary">{formattedResourceType}</Badge>
              </div>
              <div className="text-sm text-muted-foreground font-mono mt-1">
                {resourceId}
              </div>
            </div>
          </div>
          
          <Button
            onClick={handleExport}
            disabled={isExporting || !resourceLogs?.length}
            variant="outline"
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export History'}
          </Button>
        </div>

        {/* Error state */}
        {error && renderError()}

        {/* Summary Cards */}
        {!isLoading && !error && summary && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.totalEvents}</div>
                <p className="text-xs text-muted-foreground">
                  {summary.successfulEvents} successful, {summary.failedEvents} failed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unique Admins</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.uniqueAdmins}</div>
                <p className="text-xs text-muted-foreground">
                  Different administrators
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Date Range</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium">
                  {summary.dateRange ? format(summary.dateRange.earliest, 'MMM dd, yyyy') : 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">
                  to {summary.dateRange ? format(summary.dateRange.latest, 'MMM dd, yyyy') : 'N/A'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Last Modified</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium">
                  {summary.lastModified ? format(new Date(summary.lastModified), 'MMM dd, yyyy') : 'Never'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {summary.lastModified ? format(new Date(summary.lastModified), 'HH:mm:ss') : ''}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Loading state for summary cards */}
        {isLoading && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-[120px] mt-1" />
                  <Skeleton className="h-3 w-[160px] mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Audit Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Audit History</CardTitle>
            <CardDescription>
              Complete chronological history of all changes to this resource
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isLoading && !error && resourceLogs?.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No History Found</p>
                <p className="text-sm">
                  No audit logs found for this {formattedResourceType.toLowerCase()} resource.
                </p>
              </div>
            ) : (
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
            )}
          </CardContent>
        </Card>
      </div>
    </AuditDashboardShell>
  );
}