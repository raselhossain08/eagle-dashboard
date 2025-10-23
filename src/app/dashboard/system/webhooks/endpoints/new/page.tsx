// src/app/dashboard/system/webhooks/endpoints/new/page.tsx
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCreateWebhookEndpoint } from '@/hooks/useWebhooks';
import { toast } from 'sonner';

const availableEvents = [
  'user.created',
  'user.updated',
  'user.deleted',
  'order.created',
  'order.updated',
  'order.cancelled',
  'payment.success',
  'payment.failed',
  'subscription.created',
  'subscription.updated',
  'subscription.cancelled',
  'system.alert',
  'system.maintenance',
];

export default function NewWebhookEndpointPage() {
  const router = useRouter();
  const createEndpointMutation = useCreateWebhookEndpoint();

  const [formData, setFormData] = useState({
    name: '',
    url: '',
    events: [] as string[],
    secret: '',
    isActive: true,
    timeout: 5000,
    maxRetries: 3,
    deliveryMode: 'immediate',
    headers: {} as Record<string, string>,
  });

  const [newEvent, setNewEvent] = useState('');
  const [newHeaderKey, setNewHeaderKey] = useState('');
  const [newHeaderValue, setNewHeaderValue] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.url || formData.events.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await createEndpointMutation.mutateAsync(formData);
      toast.success('Webhook endpoint created successfully');
      router.push('/dashboard/system/webhooks/endpoints');
    } catch (error) {
      toast.error('Failed to create webhook endpoint');
    }
  };

  const addEvent = (event: string) => {
    if (event && !formData.events.includes(event)) {
      setFormData(prev => ({
        ...prev,
        events: [...prev.events, event],
      }));
    }
    setNewEvent('');
  };

  const removeEvent = (event: string) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.filter(e => e !== event),
    }));
  };

  const addHeader = () => {
    if (newHeaderKey && newHeaderValue) {
      setFormData(prev => ({
        ...prev,
        headers: {
          ...prev.headers,
          [newHeaderKey]: newHeaderValue,
        },
      }));
      setNewHeaderKey('');
      setNewHeaderValue('');
    }
  };

  const removeHeader = (key: string) => {
    setFormData(prev => ({
      ...prev,
      headers: Object.fromEntries(
        Object.entries(prev.headers).filter(([k]) => k !== key)
      ),
    }));
  };

  const generateSecret = () => {
    const secret = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    setFormData(prev => ({ ...prev, secret }));
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <Button variant="outline" asChild className="mb-4">
          <Link href="/dashboard/system/webhooks/endpoints">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Endpoints
          </Link>
        </Button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Create Webhook Endpoint
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Configure a new webhook endpoint to receive event notifications
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Configure the basic settings for your webhook endpoint
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Order Notifications"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </div>

            <div>
              <Label htmlFor="url">Endpoint URL *</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://api.example.com/webhooks"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="secret">Secret Key</Label>
              <div className="flex gap-2">
                <Input
                  id="secret"
                  placeholder="Enter or generate a secret key"
                  value={formData.secret}
                  onChange={(e) => setFormData(prev => ({ ...prev, secret: e.target.value }))}
                />
                <Button type="button" variant="outline" onClick={generateSecret}>
                  Generate
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Used for HMAC signature verification
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Events</CardTitle>
            <CardDescription>
              Select which events should trigger this webhook
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Select value={newEvent} onValueChange={setNewEvent}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select an event to add" />
                </SelectTrigger>
                <SelectContent>
                  {availableEvents
                    .filter(event => !formData.events.includes(event))
                    .map(event => (
                      <SelectItem key={event} value={event}>
                        {event}
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => addEvent(newEvent)}
                disabled={!newEvent}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.events.map(event => (
                <Badge key={event} variant="secondary" className="flex items-center gap-1">
                  {event}
                  <button
                    type="button"
                    onClick={() => removeEvent(event)}
                    className="ml-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            {formData.events.length === 0 && (
              <p className="text-sm text-gray-500">No events selected. Please add at least one event.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>
              Advanced settings for webhook delivery
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="timeout">Timeout (ms)</Label>
                <Input
                  id="timeout"
                  type="number"
                  placeholder="5000"
                  value={formData.timeout}
                  onChange={(e) => setFormData(prev => ({ ...prev, timeout: parseInt(e.target.value) || 5000 }))}
                />
              </div>
              <div>
                <Label htmlFor="maxRetries">Max Retries</Label>
                <Input
                  id="maxRetries"
                  type="number"
                  placeholder="3"
                  value={formData.maxRetries}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxRetries: parseInt(e.target.value) || 3 }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="deliveryMode">Delivery Mode</Label>
              <Select 
                value={formData.deliveryMode} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, deliveryMode: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Custom Headers</CardTitle>
            <CardDescription>
              Additional headers to include with webhook requests
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Header name"
                value={newHeaderKey}
                onChange={(e) => setNewHeaderKey(e.target.value)}
              />
              <Input
                placeholder="Header value"
                value={newHeaderValue}
                onChange={(e) => setNewHeaderValue(e.target.value)}
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={addHeader}
                disabled={!newHeaderKey || !newHeaderValue}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {Object.entries(formData.headers).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-2 border rounded">
                  <span className="font-mono text-sm">{key}: {value}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeHeader(key)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" asChild>
            <Link href="/dashboard/system/webhooks/endpoints">Cancel</Link>
          </Button>
          <Button type="submit" disabled={createEndpointMutation.isPending}>
            {createEndpointMutation.isPending ? 'Creating...' : 'Create Endpoint'}
          </Button>
        </div>
      </form>
    </div>
  );
}