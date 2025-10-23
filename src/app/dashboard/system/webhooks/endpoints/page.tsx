// src/app/dashboard/system/webhooks/endpoints/page.tsx
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2, Play, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useWebhookEndpoints, useDeleteWebhookEndpoint, useTestWebhookEndpoint } from '@/hooks/useWebhooks';
import { toast } from 'sonner';

export default function WebhookEndpointsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: endpointsData, isLoading, refetch } = useWebhookEndpoints({
    page,
    limit,
    search: searchTerm || undefined,
  });

  const deleteEndpointMutation = useDeleteWebhookEndpoint();
  const testEndpointMutation = useTestWebhookEndpoint();

  const handleDeleteEndpoint = async (id: string) => {
    if (!confirm('Are you sure you want to delete this endpoint?')) return;
    
    try {
      await deleteEndpointMutation.mutateAsync(id);
      toast.success('Endpoint deleted successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to delete endpoint');
    }
  };

  const handleTestEndpoint = async (id: string) => {
    try {
      const result = await testEndpointMutation.mutateAsync(id);
      if (result.success) {
        toast.success('Test webhook sent successfully');
      } else {
        toast.error(`Test failed: ${result.message}`);
      }
    } catch (error) {
      toast.error('Failed to test endpoint');
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Webhook Endpoints</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage and configure your webhook endpoints
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button asChild>
            <Link href="/dashboard/system/webhooks/endpoints/new">
              <Plus className="h-4 w-4 mr-2" />
              New Endpoint
            </Link>
          </Button>
        </div>
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
                <TableHead>Name</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Events</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Success Rate</TableHead>
                <TableHead>Last Triggered</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {endpointsData?.endpoints.map((endpoint) => {
                const successRate = endpoint.successCount + endpoint.failureCount > 0 
                  ? Math.round((endpoint.successCount / (endpoint.successCount + endpoint.failureCount)) * 100)
                  : 0;

                return (
                  <TableRow key={endpoint.id}>
                    <TableCell className="font-medium">{endpoint.name}</TableCell>
                    <TableCell className="font-mono text-sm max-w-xs truncate">
                      {endpoint.url}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {endpoint.events.slice(0, 2).map((event) => (
                          <Badge key={event} variant="outline" className="text-xs">
                            {event}
                          </Badge>
                        ))}
                        {endpoint.events.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{endpoint.events.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={endpoint.isActive ? 'default' : 'secondary'}>
                        {endpoint.isActive ? 'active' : 'inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${successRate}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">{successRate}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {endpoint.lastDelivery 
                        ? new Date(endpoint.lastDelivery).toLocaleDateString()
                        : 'Never'
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleTestEndpoint(endpoint.id)}
                          disabled={testEndpointMutation.isPending}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/system/webhooks/endpoints/${endpoint.id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteEndpoint(endpoint.id)}
                          disabled={deleteEndpointMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Pagination */}
          {endpointsData && endpointsData.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, endpointsData.total)} of {endpointsData.total} endpoints
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
                  Page {page} of {endpointsData.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(endpointsData.totalPages, p + 1))}
                  disabled={page === endpointsData.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {endpointsData?.endpoints.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No webhook endpoints configured yet.
              </p>
              <Button asChild>
                <Link href="/dashboard/system/webhooks/endpoints/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create your first endpoint
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}