'use client';

import { AuditDashboardShell } from '@/components/audit/audit-dashboard-shell';
import { AuditFilters } from '@/components/audit/audit-filters';
import { AuditLogsTable } from '@/components/audit/audit-logs-table';
import { BulkOperations } from '@/components/audit/bulk-operations';
import { AdvancedExport } from '@/components/audit/advanced-export';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useAuditLogs, useExportAuditLogs } from '@/hooks/use-audit';
import { useAuditStore } from '@/store/audit-store';
import { transformFiltersWithPagination } from '@/utils/audit-utils';
import { RefreshCw, AlertTriangle, Database, Shield, Activity } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function AuditLogsPage() {
  const { filters, pagination, sorting, setExportLoading, selectedLogs, setSelectedLogs } = useAuditStore();
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  
  // Transform filters to match backend API expectations
  const queryParams = transformFiltersWithPagination(filters, pagination);
  
  const { data, isLoading, error, refetch, isFetching } = useAuditLogs(queryParams);

  const exportMutation = useExportAuditLogs();

  // Auto refresh every 30 seconds when the page is active
  useEffect(() => {
    const interval = setInterval(() => {
      if (!document.hidden && !isLoading && !isFetching) {
        refetch();
        setLastRefresh(new Date());
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [refetch, isLoading, isFetching]);

  const handleRefresh = async () => {
    await refetch();
    setLastRefresh(new Date());
  };

  // Enhanced error handling for different error types
  if (error) {
    const isNetworkError = error.message?.includes('fetch') || error.message?.includes('network');
    const isAuthError = error.message?.includes('401') || error.message?.includes('unauthorized');
    const isServerError = error.message?.includes('500') || error.message?.includes('server');

    return (
      <AuditDashboardShell
        title="Audit Logs"
        description="Real-time system audit events and admin activity tracking"
        actions={null}
        filters={<AuditFilters />}
      >
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {isNetworkError && "Network connection failed. Please check your internet connection."}
            {isAuthError && "Authentication required. Please log in again."}
            {isServerError && "Server error occurred. The backend service may be unavailable."}
            {!isNetworkError && !isAuthError && !isServerError && "Failed to load audit logs. Please try again."}
            <div className="mt-3 flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Retry
              </Button>
              {isAuthError && (
                <Button variant="default" size="sm" asChild>
                  <a href="/login">Re-authenticate</a>
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      </AuditDashboardShell>
    );
  }

  // Enhanced loading state with better UX
  if (isLoading) {
    return (
      <AuditDashboardShell
        title="Audit Logs"
        description="Real-time system audit events and admin activity tracking"
        actions={
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="animate-pulse">
              <Activity className="h-3 w-3 mr-1" />
              Loading...
            </Badge>
            <Button variant="outline" size="sm" disabled>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Loading...
            </Button>
          </div>
        }
        filters={<AuditFilters />}
      >
        <div className="space-y-4">
          {/* Loading state for data status */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          
          {/* Loading state for bulk operations */}
          <Skeleton className="h-12 w-full" />
          
          {/* Loading state for table */}
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </AuditDashboardShell>
    );
  }

  // Enhanced empty state with better messaging
  if (data && data.logs.length === 0) {
    const hasActiveFilters = Object.keys(filters).some(key => {
      const value = filters[key as keyof typeof filters];
      return value !== undefined && value !== null && 
             (typeof value !== 'object' || (value.from && value.to));
    });

    return (
      <AuditDashboardShell
        title="Audit Logs"
        description="Real-time system audit events and admin activity tracking"
        actions={
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading || isFetching}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${(isLoading || isFetching) ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Badge variant="outline">
              <Shield className="h-3 w-3 mr-1" />
              No Data
            </Badge>
          </div>
        }
        filters={<AuditFilters />}
      >
        <div className="text-center py-12">
          <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">
            {hasActiveFilters ? 'No matching audit logs' : 'No audit logs available'}
          </h3>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            {hasActiveFilters 
              ? 'No logs match your current filters. Try adjusting your search criteria or expanding the date range.'
              : 'No audit events have been recorded yet. Admin activities and system events will appear here as they occur.'
            }
          </p>
          {hasActiveFilters && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                // Reset filters to show all data
                window.location.reload();
              }}
            >
              Clear All Filters
            </Button>
          )}
        </div>
      </AuditDashboardShell>
    );
  }

  // Enhanced actions with real-time indicators
  const actions = (
    <div className="flex items-center space-x-2">
      <Badge variant={data ? "outline" : "secondary"} className="text-xs">
        <Activity className="h-3 w-3 mr-1" />
        {data ? 'Live' : 'Connecting...'}
      </Badge>
      <Button
        variant="outline"
        size="sm"
        onClick={handleRefresh}
        disabled={isLoading || isFetching}
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${(isLoading || isFetching) ? 'animate-spin' : ''}`} />
        Refresh
      </Button>
      <AdvancedExport 
        filters={queryParams}
        onExportStart={() => setExportLoading(true)}
        onExportComplete={() => setExportLoading(false)}
      />
    </div>
  );

  return (
    <AuditDashboardShell
      title="Audit Logs"
      description="Real-time system audit events and admin activity tracking"
      actions={actions}
      filters={<AuditFilters />}
    >
      {/* Enhanced Data Status Indicator */}
      {data && (
        <div className="mb-4 p-3 bg-muted/50 rounded-lg border">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <Shield className="h-4 w-4 mr-1 text-green-600" />
                Showing {data.logs.length} of {data.pagination.total.toLocaleString()} total logs
              </span>
              {isFetching && (
                <Badge variant="secondary" className="animate-pulse">
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Updating...
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-4 text-muted-foreground">
              <span>
                Last updated: {lastRefresh.toLocaleTimeString()}
              </span>
              <span>
                Page {data.pagination.page} of {data.pagination.totalPages}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Operations */}
      <BulkOperations
        selectedLogs={selectedLogs}
        onSelectionChange={setSelectedLogs}
        logs={data?.logs || []}
        onBulkActionComplete={() => {
          setSelectedLogs([]);
          handleRefresh();
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
        isLoading={isLoading || isFetching}
        sorting={sorting}
      />

      {/* Real-time Status Footer */}
      {data && (
        <div className="mt-4 pt-4 border-t text-xs text-muted-foreground flex items-center justify-between">
          <span>
            Data source: Live production database
          </span>
          <span className="flex items-center">
            <div className="h-2 w-2 bg-green-500 rounded-full mr-2 animate-pulse" />
            Connected to backend API
          </span>
        </div>
      )}
    </AuditDashboardShell>
  );
}