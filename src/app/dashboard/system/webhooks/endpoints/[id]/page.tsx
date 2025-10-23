// src/app/dashboard/system/webhooks/endpoints/[id]/page.tsx
'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Edit, Play, Copy, Trash2, Settings, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { 
  useWebhookEndpoint, 
  useWebhookEndpointStats, 
  useWebhookEvents,
  useUpdateWebhookEndpoint,
  useDeleteWebhookEndpoint,
  useTestWebhookEndpoint,
  useTriggerWebhook
} from '@/hooks/useWebhooks';
import { toast } from 'sonner';

export default function WebhookEndpointPage() {
  const params = useParams();
  const router = useRouter();
  const endpointId = params.id as string;
  const [isEditing, setIsEditing] = useState(false);
  const [testPayload, setTestPayload] = useState('{"event": "test", "data": {"message": "Hello World"}}');

  // Data fetching
  const { data: endpoint, isLoading: loadingEndpoint, refetch: refetchEndpoint } = useWebhookEndpoint(endpointId);
  const { data: stats, isLoading: loadingStats } = useWebhookEndpointStats(endpointId);
  const { data: eventsData, isLoading: loadingEvents } = useWebhookEvents({
    endpointId,
    limit: 50,
  });

  // Mutations
  const updateEndpointMutation = useUpdateWebhookEndpoint();
  const deleteEndpointMutation = useDeleteWebhookEndpoint();
  const testEndpointMutation = useTestWebhookEndpoint();
  const triggerWebhookMutation = useTriggerWebhook();

  const handleToggleStatus = async (enabled: boolean) => {
    if (!endpoint) return;
    
    try {
      await updateEndpointMutation.mutateAsync({
        id: endpointId,
        data: { isActive: enabled },
      });
      toast.success(`Endpoint ${enabled ? 'enabled' : 'disabled'}`);
      refetchEndpoint();
    } catch (error) {
      toast.error('Failed to update endpoint status');
    }
  };

  const handleTestEndpoint = async () => {
    try {
      const result = await testEndpointMutation.mutateAsync(endpointId);
      if (result.success) {
        toast.success('Test webhook sent successfully');
      } else {
        toast.error(`Test failed: ${result.message}`);
      }
    } catch (error) {
      toast.error('Failed to test endpoint');
    }
  };

  const handleSendTestPayload = async () => {
    try {
      const payload = JSON.parse(testPayload);
      await triggerWebhookMutation.mutateAsync({
        event: 'test.webhook',
        payload,
      });
      toast.success('Test payload sent successfully');
    } catch (error) {
      if (error instanceof SyntaxError) {
        toast.error('Invalid JSON payload');
      } else {
        toast.error('Failed to send test payload');
      }
    }
  };

  const handleDeleteEndpoint = async () => {
    if (!confirm('Are you sure you want to delete this endpoint? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteEndpointMutation.mutateAsync(endpointId);
      toast.success('Endpoint deleted successfully');
      router.push('/dashboard/system/webhooks/endpoints');
    } catch (error) {
      toast.error('Failed to delete endpoint');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const getStatusVariant = (status: number) => {
    return status === 200 ? 'default' : 'destructive';
  };

  if (loadingEndpoint || loadingStats) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!endpoint) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Endpoint not found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The webhook endpoint you're looking for doesn't exist.
          </p>
          <Button asChild>
            <Link href="/dashboard/system/webhooks/endpoints">
              Back to Endpoints
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/system/webhooks/endpoints">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Endpoints
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {endpoint.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 font-mono text-sm">
            {endpoint.url}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleTestEndpoint}
            disabled={testEndpointMutation.isPending}
          >
            <Play className="h-4 w-4 mr-2" />
            Test Endpoint
          </Button>
          <Button variant="outline" onClick={() => refetchEndpoint()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="events">Recent Events</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalEvents?.toLocaleString() || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stats?.deliveryRate || 0}%
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Delivered</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats?.delivered || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant={endpoint.isActive ? 'default' : 'secondary'}>
                  {endpoint.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Endpoint Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Endpoint Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Webhook URL</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input value={endpoint.url} readOnly className="font-mono text-sm" />
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(endpoint.url)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Secret Key</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input type="password" value={endpoint.secret} readOnly className="font-mono text-sm" />
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(endpoint.secret)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Timeout</Label>
                  <p className="text-sm mt-1">{endpoint.timeout}ms</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Max Retries</Label>
                  <p className="text-sm mt-1">{endpoint.maxRetries}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <p className="text-sm mt-1">{new Date(endpoint.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Last Triggered</Label>
                  <p className="text-sm mt-1">
                    {endpoint.lastDelivery ? new Date(endpoint.lastDelivery).toLocaleString() : 'Never'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subscribed Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {endpoint.events.map((event) => (
                    <div key={event} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm font-medium">{event}</span>
                      <Badge variant="outline">Active</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Recent Events</CardTitle>
              <CardDescription>
                Recent webhook events for this endpoint
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingEvents ? (
                <div className="animate-pulse space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-200 rounded"></div>
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event ID</TableHead>
                      <TableHead>Event Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Attempts</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {eventsData?.events.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-mono text-sm">{event.id.slice(-8)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{event.event}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            event.status === 'delivered' ? 'default' :
                            event.status === 'pending' ? 'secondary' : 'destructive'
                          }>
                            {event.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{event.attemptCount}</TableCell>
                        <TableCell className="text-sm">
                          {new Date(event.createdAt).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {eventsData?.events.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">
                    No events found for this endpoint.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Endpoint Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="endpoint-status" className="text-base font-semibold">
                    Endpoint Status
                  </Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Enable or disable this webhook endpoint
                  </p>
                </div>
                <Switch
                  id="endpoint-status"
                  checked={endpoint.isActive}
                  onCheckedChange={handleToggleStatus}
                  disabled={updateEndpointMutation.isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhook-payload">Test Payload</Label>
                <Textarea
                  id="webhook-payload"
                  value={testPayload}
                  onChange={(e) => setTestPayload(e.target.value)}
                  rows={6}
                  className="font-mono text-sm"
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleSendTestPayload}
                  disabled={triggerWebhookMutation.isPending}
                >
                  {triggerWebhookMutation.isPending ? 'Sending...' : 'Send Test Payload'}
                </Button>
              </div>

              <div className="pt-4 border-t">
                <Label className="text-base font-semibold text-red-600">Danger Zone</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Permanently delete this webhook endpoint and all its events
                </p>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteEndpoint}
                  disabled={deleteEndpointMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {deleteEndpointMutation.isPending ? 'Deleting...' : 'Delete Endpoint'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}