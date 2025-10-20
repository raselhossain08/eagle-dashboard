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

const mockLogs = [
  {
    id: '1',
    endpointId: '1',
    event: 'order.created',
    status: 200,
    statusText: 'OK',
    attempts: 1,
    duration: 245,
    createdAt: '2024-01-15T14:30:00Z',
    payload: { orderId: '12345' },
    response: 'Webhook delivered successfully'
  },
  {
    id: '2',
    endpointId: '2',
    event: 'system.alert', 
    status: 500,
    statusText: 'Internal Server Error',
    attempts: 3,
    duration: 0,
    createdAt: '2024-01-15T14:25:00Z',
    payload: { alert: 'high_cpu' },
    response: 'Endpoint unavailable'
  },
  {
    id: '3',
    endpointId: '1',
    event: 'user.updated',
    status: 200,
    statusText: 'OK', 
    attempts: 1,
    duration: 189,
    createdAt: '2024-01-15T14:20:00Z',
    payload: { userId: 'user-123' },
    response: 'Webhook delivered successfully'
  }
];

export default function WebhookLogsPage() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = mockLogs.filter(log => {
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'success' && log.status === 200) ||
      (statusFilter === 'error' && log.status !== 200);
    const matchesSearch = log.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusVariant = (status: number) => {
    return status === 200 ? 'default' : 'destructive';
  };

  const getStatusText = (status: number) => {
    return status === 200 ? 'Success' : 'Failed';
  };

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
          <Button variant="outline">
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
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-sm">{log.id}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{log.event}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    Endpoint {log.endpointId}
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
        </CardContent>
      </Card>

      {/* Log Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockLogs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Math.round((mockLogs.filter(l => l.status === 200).length / mockLogs.length) * 100)}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(mockLogs.reduce((acc, log) => acc + log.duration, 0) / mockLogs.length)}ms
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Failed Deliveries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {mockLogs.filter(l => l.status !== 200).length}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}