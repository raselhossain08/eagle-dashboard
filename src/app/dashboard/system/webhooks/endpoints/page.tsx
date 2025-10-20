// src/app/dashboard/system/webhooks/endpoints/page.tsx
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2, Play } from 'lucide-react';
import Link from 'next/link';

const mockEndpoints = [
  {
    id: '1',
    url: 'https://api.example.com/webhooks/orders',
    events: ['order.created', 'order.updated'],
    status: 'active' as const,
    createdAt: '2024-01-10T10:00:00Z',
    lastTriggered: '2024-01-15T14:30:00Z',
    successRate: 98.5
  },
  {
    id: '2',
    url: 'https://hooks.slack.com/services/xxx',
    events: ['system.alert'],
    status: 'active' as const,
    createdAt: '2024-01-12T15:00:00Z',
    lastTriggered: '2024-01-15T12:15:00Z',
    successRate: 99.2
  },
  {
    id: '3',
    url: 'https://api.analytics.com/events',
    events: ['user.registered', 'user.updated'],
    status: 'inactive' as const,
    createdAt: '2024-01-08T09:00:00Z',
    lastTriggered: '2024-01-14T16:45:00Z',
    successRate: 95.1
  }
];

export default function WebhookEndpointsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEndpoints = mockEndpoints.filter(endpoint =>
    endpoint.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
    endpoint.events.some(event => event.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Webhook Endpoints</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage and configure your webhook endpoints
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/system/webhooks/endpoints/new">
            <Plus className="h-4 w-4 mr-2" />
            New Endpoint
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Endpoints</CardTitle>
          <CardDescription>
            All configured webhook endpoints and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search endpoints..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>URL</TableHead>
                <TableHead>Events</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Success Rate</TableHead>
                <TableHead>Last Triggered</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEndpoints.map((endpoint) => (
                <TableRow key={endpoint.id}>
                  <TableCell className="font-mono text-sm">
                    {endpoint.url}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {endpoint.events.map((event) => (
                        <Badge key={event} variant="outline" className="text-xs">
                          {event}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={endpoint.status === 'active' ? 'default' : 'secondary'}>
                      {endpoint.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${endpoint.successRate}%` }}
                        ></div>
                      </div>
                      <span className="text-sm">{endpoint.successRate}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(endpoint.lastTriggered).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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