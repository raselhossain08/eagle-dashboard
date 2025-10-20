'use client';

import { useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { AuditLog } from '@/types/audit';
import { useAuditStore } from '@/store/audit-store';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AuditLogDetailsDialog } from '@/components/audit/audit-log-details-dialog';
import { ChevronUp, ChevronDown, Eye } from 'lucide-react';
import { format } from 'date-fns';

interface AuditLogsTableProps {
  data: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  isLoading?: boolean;
  sorting: {
    column: string;
    direction: 'asc' | 'desc';
  };
}

const columns: ColumnDef<AuditLog>[] = [
  {
    accessorKey: 'timestamp',
    header: 'Timestamp',
    cell: ({ row }) => {
      const timestamp = row.getValue('timestamp') as Date;
      return format(new Date(timestamp), 'MMM dd, yyyy HH:mm:ss');
    },
  },
  {
    accessorKey: 'adminUserEmail',
    header: 'Admin',
    cell: ({ row }) => {
      const email = row.getValue('adminUserEmail') as string;
      const role = row.original.adminUserRole;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{email}</span>
          <span className="text-xs text-muted-foreground">{role}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'action',
    header: 'Action',
    cell: ({ row }) => {
      const action = row.getValue('action') as string;
      const parts = action.split('.');
      return (
        <div className="flex flex-col">
          <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
            {parts[parts.length - 1]}
          </code>
          <span className="text-xs text-muted-foreground mt-1">{action}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'resourceType',
    header: 'Resource',
    cell: ({ row }) => {
      const resourceType = row.getValue('resourceType') as string;
      const resourceId = row.original.resourceId;
      return (
        <div className="flex flex-col">
          {resourceType && (
            <span className="font-medium">{resourceType}</span>
          )}
          {resourceId && (
            <code className="text-xs text-muted-foreground font-mono">
              {resourceId.slice(0, 8)}...
            </code>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      const getStatusVariant = (status: string) => {
        switch (status) {
          case 'success': return 'default';
          case 'failure': return 'destructive';
          case 'error': return 'destructive';
          default: return 'secondary';
        }
      };

      const getStatusText = (status: string) => {
        switch (status) {
          case 'success': return 'Success';
          case 'failure': return 'Failure';
          case 'error': return 'Error';
          default: return status;
        }
      };

      return (
        <Badge variant={getStatusVariant(status)}>
          {getStatusText(status)}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'ipAddress',
    header: 'IP Address',
    cell: ({ row }) => {
      const ipAddress = row.getValue('ipAddress') as string;
      return ipAddress || '-';
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const log = row.original;
      return <TableActions log={log} />;
    },
  },
];

function TableActions({ log }: { log: AuditLog }) {
  const { setSelectedLog } = useAuditStore();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setSelectedLog(log.id)}
    >
      <Eye className="h-4 w-4" />
    </Button>
  );
}

export function AuditLogsTable({ data, pagination, isLoading, sorting }: AuditLogsTableProps) {
  const { setPagination, setSorting, selectedLogId, setSelectedLog } = useAuditStore();
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualSorting: true,
    onPaginationChange: (updater) => {
      const newPagination = typeof updater === 'function' 
        ? updater({ pageIndex: pagination.page - 1, pageSize: pagination.limit })
        : updater;
      setPagination({
        page: newPagination.pageIndex + 1,
        limit: newPagination.pageSize,
      });
    },
    onSortingChange: (updater) => {
      const newSorting = typeof updater === 'function' ? updater([{ id: sorting.column, desc: sorting.direction === 'desc' }]) : updater;
      if (newSorting.length > 0) {
        setSorting({
          column: newSorting[0].id,
          direction: newSorting[0].desc ? 'desc' : 'asc',
        });
      }
    },
    state: {
      pagination: {
        pageIndex: pagination.page - 1,
        pageSize: pagination.limit,
      },
      sorting: [{ id: sorting.column, desc: sorting.direction === 'desc' }],
      rowSelection,
    },
    pageCount: pagination.totalPages,
    onRowSelectionChange: setRowSelection,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedLog(row.original.id)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="flex-1 text-sm text-muted-foreground">
          Showing {data.length} of {pagination.total} results
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Details Dialog */}
      <AuditLogDetailsDialog
        logId={selectedLogId}
        isOpen={!!selectedLogId}
        onClose={() => setSelectedLog(undefined)}
      />
    </>
  );
}