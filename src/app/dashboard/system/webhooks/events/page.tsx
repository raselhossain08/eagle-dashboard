// src/app/dashboard/system/webhooks/events/page.tsx
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Play, Eye, RefreshCw, RotateCcw } from 'lucide-react';
import { useWebhookEvents, useRetryWebhookEvent } from '@/hooks/useWebhooks';
import { toast } from 'sonner';

export default function WebhookEventsPage() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: eventsData, isLoading, refetch } = useWebhookEvents({
    page,
    limit,
    status: statusFilter === 'all' ? undefined : statusFilter,
    event: searchTerm || undefined,
  });

  const retryEventMutation = useRetryWebhookEvent();

  const handleRetryEvent = async (eventId: string) => {
    try {
      await retryEventMutation.mutateAsync(eventId);
      toast.success('Event queued for retry');
      refetch();
    } catch (error) {
      toast.error('Failed to retry event');
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'delivered': return 'default';
      case 'pending': return 'secondary';
      case 'failed': return 'destructive';
      case 'retrying': return 'secondary';
      default: return 'outline';
    }
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Webhook Events</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Monitor and manage webhook event deliveries
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event History</CardTitle>
          <CardDescription>
            Recent webhook events and their delivery status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search events..."
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
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="retrying">Retrying</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event ID</TableHead>
                <TableHead>Event Type</TableHead>
                <TableHead>Endpoint</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Attempts</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {eventsData?.events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-mono text-sm">{event.id.slice(-8)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{event.event}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {event.endpointId?.name || `Endpoint ${event.endpointId?.id || 'Unknown'}`}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(event.status)}>
                      {event.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{event.attemptCount}</TableCell>
                  <TableCell className="text-sm">
                    {new Date(event.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {(event.status === 'failed' || event.status === 'retrying') && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleRetryEvent(event.id)}
                          disabled={retryEventMutation.isPending}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {eventsData && eventsData.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, eventsData.total)} of {eventsData.total} events
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
                  Page {page} of {eventsData.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(eventsData.totalPages, p + 1))}
                  disabled={page === eventsData.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}