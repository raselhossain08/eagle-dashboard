// src/app/dashboard/system/webhooks/endpoints/[id]/page.tsx
'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { WebhookManager } from '@/components/system/WebhookManager';
import { ArrowLeft, Edit, Play, Copy, Trash2, Activity, Settings } from 'lucide-react';
import Link from 'next/link';

// Mock endpoint data
const mockEndpoint = {
  id: '1',
  url: 'https://api.example.com/webhooks/orders',
  events: ['order.created', 'order.updated', 'payment.completed'],
  status: 'active' as const,
  secret: 'whsec_1234567890',
  createdAt: '2024-01-10T10:00:00Z',
  lastTriggered: '2024-01-15T14:30:00Z',
  successRate: 98.5
};

const mockEndpointStats = {
  total: 1250,
  successful: 1220,
  failed: 30,
  pending: 0,
  successRate: 97.6,
  averageResponseTime: 245,
  lastTriggered: '2024-01-15T14:30:00Z'
};

const mockRecentEvents = [
  {
    id: '1',
    event: 'order.created',
    status: 200,
    attempts: 1,
    duration: 245,
    createdAt: '2024-01-15T14:30:00Z'
  },
  {
    id: '2',
    event: 'order.updated',
    status: 200,
    attempts: 1,
    duration: 189,
    createdAt: '2024-01-15T14:25:00Z'
  },
  {
    id: '3',
    event: 'payment.completed',
    status: 500,
    attempts: 3,
    duration: 0,
    createdAt: '2024-01-15T14:20:00Z'
  }
];

export default function WebhookEndpointPage() {
  const params = useParams();
  const endpointId = params.id as string;
  const [isEditing, setIsEditing] = useState(false);
  const [endpoint, setEndpoint] = useState(mockEndpoint);

  const handleSaveEndpoint = (data: any) => {
    setEndpoint(prev => ({
      ...prev,
      ...data,
      status: data.enabled ? 'active' : 'inactive'
    }));
    setIsEditing(false);
  };

  const handleTestEndpoint = () => {
    // Implement test endpoint logic
    console.log('Testing endpoint:', endpointId);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getStatusVariant = (status: number) => {
    return status === 200 ? 'default' : 'destructive';
  };

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
            Webhook Endpoint
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {endpoint.url}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleTestEndpoint}>
            <Play className="h-4 w-4 mr-2" />
            Test Endpoint
          </Button>
          <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
            <Edit className="h-4 w-4 mr-2" />
            {isEditing ? 'Cancel Edit' : 'Edit'}
          </Button>
        </div>
      </div>

      {isEditing ? (
        <WebhookManager endpoint={endpoint} onSave={handleSaveEndpoint} />
      ) : (
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
                  <div className="text-2xl font-bold">{mockEndpointStats.total.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {mockEndpointStats.successRate}%
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockEndpointStats.averageResponseTime}ms</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant={endpoint.status === 'active' ? 'default' : 'secondary'}>
                    {endpoint.status}
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
                    <Label className="text-sm font-medium">Created</Label>
                    <p className="text-sm mt-1">{new Date(endpoint.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Last Triggered</Label>
                    <p className="text-sm mt-1">
                      {endpoint.lastTriggered ? new Date(endpoint.lastTriggered).toLocaleString() : 'Never'}
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
                  Last 50 webhook events for this endpoint
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event ID</TableHead>
                      <TableHead>Event Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Attempts</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockRecentEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-mono text-sm">{event.id}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{event.event}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(event.status)}>
                            {event.status} {event.status === 200 ? 'Success' : 'Failed'}
                          </Badge>
                        </TableCell>
                        <TableCell>{event.attempts}</TableCell>
                        <TableCell>{event.duration}ms</TableCell>
                        <TableCell className="text-sm">
                          {new Date(event.createdAt).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
              <CardContent className="space-y-4">
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
                    checked={endpoint.status === 'active'}
                    onCheckedChange={(checked) => setEndpoint(prev => ({
                      ...prev,
                      status: checked ? 'active' : 'inactive'
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhook-payload">Test Payload</Label>
                  <Textarea
                    id="webhook-payload"
                    placeholder='{"event": "test", "data": {"message": "Hello World"}}'
                    rows={6}
                    className="font-mono text-sm"
                  />
                  <Button variant="outline" size="sm">
                    Send Test Payload
                  </Button>
                </div>

                <div className="pt-4 border-t">
                  <Label className="text-base font-semibold text-red-600">Danger Zone</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Permanently delete this webhook endpoint
                  </p>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Endpoint
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}