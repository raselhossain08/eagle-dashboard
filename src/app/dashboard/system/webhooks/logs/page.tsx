// src/app/dashboard/system/webhooks/logs/page.tsx
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Download, Eye, RefreshCw } from 'lucide-react';
import { useWebhookLogs } from '@/hooks/useWebhooks';

export default function WebhookLogsPage() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: logsData, isLoading, refetch } = useWebhookLogs({
    page,
    limit,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  const getStatusVariant = (status: number) => {
    return status === 200 ? 'default' : 'destructive';
  };

  const getStatusText = (status: number) => {
    return status === 200 ? 'Success' : 'Failed';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Webhook Delivery Logs</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Detailed delivery logs and response history
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Delivery Logs</CardTitle>
          <CardDescription>
            Complete history of webhook delivery attempts and responses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="error">Errors</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Log ID</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Endpoint</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Attempts</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logsData?.logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-sm">{log.id.slice(-8)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{log.event}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {log.endpointId?.name || `Endpoint ${log.endpointId?.id || 'Unknown'}`}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(log.status)}>
                      {log.status} {getStatusText(log.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{log.attempts}</TableCell>
                  <TableCell>{log.duration}ms</TableCell>
                  <TableCell className="text-sm">
                    {new Date(log.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {logsData && logsData.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, logsData.total)} of {logsData.total} logs
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {page} of {logsData.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(logsData.totalPages, p + 1))}
                  disabled={page === logsData.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Log Statistics */}
      {logsData?.stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{logsData.stats.totalLogs}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {logsData.stats.totalLogs > 0 
                  ? Math.round((logsData.stats.successCount / logsData.stats.totalLogs) * 100)
                  : 0}%
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average Duration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {logsData.stats.averageDuration}ms
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Failed Deliveries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {logsData.stats.failureCount}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}