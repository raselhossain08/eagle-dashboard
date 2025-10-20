// src/app/dashboard/system/webhooks/events/page.tsx
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Play, Eye } from 'lucide-react';

const mockEvents = [
  {
    id: '1',
    endpointId: '1',
    event: 'order.created',
    payload: { orderId: '12345', amount: 99.99 },
    status: 'success' as const,
    attempts: 1,
    createdAt: '2024-01-15T14:30:00Z',
    lastAttempt: '2024-01-15T14:30:02Z'
  },
  {
    id: '2',
    endpointId: '2', 
    event: 'system.alert',
    payload: { alert: 'high_cpu', level: 'warning' },
    status: 'pending' as const,
    attempts: 0,
    createdAt: '2024-01-15T14:25:00Z'
  },
  {
    id: '3',
    endpointId: '1',
    event: 'user.updated',
    payload: { userId: 'user-123', action: 'profile_update' },
    status: 'failed' as const,
    attempts: 3,
    createdAt: '2024-01-15T14:20:00Z',
    lastAttempt: '2024-01-15T14:22:00Z'
  }
];

export default function WebhookEventsPage() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEvents = mockEvents.filter(event => {
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    const matchesSearch = event.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'success': return 'default';
      case 'pending': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Webhook Events</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Monitor and manage webhook event deliveries
          </p>
        </div>
        <Button>
          <Play className="h-4 w-4 mr-2" />
          Trigger Event
        </Button>
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
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
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
              {filteredEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-mono text-sm">{event.id}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{event.event}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    Endpoint {event.endpointId}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(event.status)}>
                      {event.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{event.attempts}</TableCell>
                  <TableCell className="text-sm">
                    {new Date(event.createdAt).toLocaleString()}
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
        </CardContent>
      </Card>
    </div>
  );
}