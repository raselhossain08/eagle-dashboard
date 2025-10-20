'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Trash2, Download, Archive, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { AuditLog } from '@/types/audit';
import { useCleanupOldLogs } from '@/hooks/use-audit';

interface BulkOperationsProps {
  selectedLogs: string[];
  onSelectionChange: (selected: string[]) => void;
  logs: AuditLog[];
  onBulkActionComplete?: () => void;
}

export function BulkOperations({ 
  selectedLogs, 
  onSelectionChange, 
  logs,
  onBulkActionComplete 
}: BulkOperationsProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [cleanupDays, setCleanupDays] = useState(30);
  
  const cleanupMutation = useCleanupOldLogs();

  const selectedLogsData = logs.filter(log => selectedLogs.includes(log.id));

  const handleSelectAll = (checked: boolean) => {
    onSelectionChange(checked ? logs.map(log => log.id) : []);
  };

  const handleBulkExport = () => {
    const selectedData = selectedLogsData;
    const csvContent = convertToCSV(selectedData);
    downloadCSV(csvContent, `bulk-audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
    onBulkActionComplete?.();
  };

  const handleBulkDelete = async () => {
    // Implement bulk delete logic
    console.log('Deleting logs:', selectedLogs);
    setIsDeleteDialogOpen(false);
    onSelectionChange([]);
    onBulkActionComplete?.();
  };

  const handleCleanupOldLogs = async () => {
    try {
      await cleanupMutation.mutateAsync(cleanupDays);
      setIsArchiveDialogOpen(false);
      onBulkActionComplete?.();
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  };

  const convertToCSV = (data: AuditLog[]) => {
    const headers = ['Timestamp', 'Admin Email', 'Action', 'Resource Type', 'Resource ID', 'Status', 'IP Address'];
    const csvRows = [
      headers.join(','),
      ...data.map(log => [
        new Date(log.timestamp).toISOString(),
        `"${log.adminUserEmail}"`,
        `"${log.action}"`,
        `"${log.resourceType || ''}"`,
        `"${log.resourceId || ''}"`,
        `"${log.status}"`,
        `"${log.ipAddress || ''}"`
      ].join(','))
    ];
    return csvRows.join('\n');
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Selection Bar */}
      {selectedLogs.length > 0 && (
        <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={selectedLogs.length === logs.length}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm font-medium">
                {selectedLogs.length} of {logs.length} selected
              </span>
            </div>

            <Badge variant="secondary">
              <CheckCircle className="h-3 w-3 mr-1" />
              {selectedLogs.length} selected
            </Badge>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkExport}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Selected
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  More Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsArchiveDialogOpen(true)}>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive Selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelectionChange([])}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Super Admin Operations */}
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div>
          <h4 className="font-medium">System Maintenance</h4>
          <p className="text-sm text-muted-foreground">
            Administrative operations for log management
          </p>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Archive className="h-4 w-4 mr-2" />
              System Operations
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsArchiveDialogOpen(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Cleanup Old Logs
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleBulkExport}>
              <Download className="h-4 w-4 mr-2" />
              Export All Logs
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Delete Selected Logs
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete {selectedLogs.length} audit log entries.
            </DialogDescription>
          </DialogHeader>

          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Deleting audit logs may affect compliance reporting and security monitoring.
            </AlertDescription>
          </Alert>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBulkDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete {selectedLogs.length} Logs
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cleanup Dialog */}
      <Dialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cleanup Old Logs</DialogTitle>
            <DialogDescription>
              Remove audit logs older than the specified number of days.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Retention Period</label>
              <select
                className="w-full p-2 border rounded-md"
                value={cleanupDays}
                onChange={(e) => setCleanupDays(Number(e.target.value))}
              >
                <option value={7}>7 days</option>
                <option value={30}>30 days</option>
                <option value={90}>90 days</option>
                <option value={365}>1 year</option>
              </select>
              <p className="text-sm text-muted-foreground">
                Logs older than {cleanupDays} days will be permanently deleted.
              </p>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This operation cannot be undone. Make sure you have backups if needed.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsArchiveDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCleanupOldLogs}
              disabled={cleanupMutation.isPending}
            >
              {cleanupMutation.isPending ? 'Cleaning...' : `Cleanup Old Logs`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}