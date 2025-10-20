'use client';

import { AuditDashboardShell } from '@/components/audit/audit-dashboard-shell';
import { AuditFilters } from '@/components/audit/audit-filters';
import { AuditLogsTable } from '@/components/audit/audit-logs-table';
import { BulkOperations } from '@/components/audit/bulk-operations';
import { AdvancedExport } from '@/components/audit/advanced-export';
import { Button } from '@/components/ui/button';
import { useAuditLogs, useExportAuditLogs } from '@/hooks/use-audit';
import { useAuditStore } from '@/store/audit-store';
import { Download, RefreshCw } from 'lucide-react';
import { useEffect } from 'react';

export default function AuditLogsPage() {
  const { filters, pagination, sorting, setExportLoading, selectedLogs, setSelectedLogs } = useAuditStore();
  const { data, isLoading, refetch } = useAuditLogs({
    ...filters,
    page: pagination.page,
    limit: pagination.limit,
    sortBy: sorting.column,
    sortOrder: sorting.direction,
  });

  const exportMutation = useExportAuditLogs();

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const blob = await exportMutation.mutateAsync({
        ...filters,
        page: 1,
        limit: 10000,
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExportLoading(false);
    }
  };

  const actions = (
    <div className="flex space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => refetch()}
        disabled={isLoading}
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Refresh
      </Button>
      <AdvancedExport 
        filters={filters}
        onExportStart={() => setExportLoading(true)}
        onExportComplete={() => setExportLoading(false)}
      />
    </div>
  );

  return (
    <AuditDashboardShell
      title="Audit Logs"
      description="Detailed view of all system audit events"
      actions={actions}
      filters={<AuditFilters />}
    >
      {/* Bulk Operations */}
      <BulkOperations
        selectedLogs={selectedLogs}
        onSelectionChange={setSelectedLogs}
        logs={data?.logs || []}
        onBulkActionComplete={() => {
          setSelectedLogs([]);
          refetch();
        }}
      />

      {/* Audit Logs Table */}
      <AuditLogsTable
        data={data?.logs || []}
        pagination={data?.pagination || {
          page: pagination.page,
          limit: pagination.limit,
          total: 0,
          totalPages: 0
        }}
        isLoading={isLoading}
        sorting={sorting}
      />
    </AuditDashboardShell>
  );
}