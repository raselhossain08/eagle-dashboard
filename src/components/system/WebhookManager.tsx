// src/components/system/WebhookManager.tsx
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface WebhookManagerProps {
  endpoint?: any;
  onSave?: (data: any) => void;
  onTest?: (endpointId: string) => void;
}

export function WebhookManager({ endpoint, onSave, onTest }: WebhookManagerProps) {
  const [formData, setFormData] = useState({
    url: endpoint?.url || '',
    events: endpoint?.events || [],
    secret: endpoint?.secret || '',
    enabled: endpoint?.status === 'active' || true
  });

  const availableEvents = [
    'user.created',
    'user.updated',
    'order.created',
    'order.updated',
    'payment.completed',
    'system.alert'
  ];

  const handleEventToggle = (event: string) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave?.(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Webhook Endpoint Configuration</CardTitle>
        <CardDescription>
          Configure your webhook endpoint settings and event subscriptions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="url">Webhook URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://api.example.com/webhooks"
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Events to Subscribe</Label>
            <div className="grid grid-cols-2 gap-2">
              {availableEvents.map((event) => (
                <div key={event} className="flex items-center space-x-2">
                  <Switch
                    checked={formData.events.includes(event)}
                    onCheckedChange={() => handleEventToggle(event)}
                  />
                  <Label className="text-sm">{event}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="secret">Secret Key</Label>
            <Input
              id="secret"
              type="password"
              placeholder="Enter secret for signature verification"
              value={formData.secret}
              onChange={(e) => setFormData(prev => ({ ...prev, secret: e.target.value }))}
            />
            <p className="text-sm text-gray-500">
              Used to verify webhook signatures (optional)
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.enabled}
              onCheckedChange={(enabled) => setFormData(prev => ({ ...prev, enabled }))}
            />
            <Label>Enable this endpoint</Label>
          </div>

          <div className="flex gap-2">
            <Button type="submit">Save Endpoint</Button>
            {endpoint && (
              <Button type="button" variant="outline" onClick={() => onTest?.(endpoint.id)}>
                Test Endpoint
              </Button>
            )}
          </div>
        </form>

        {formData.events.length > 0 && (
          <div className="mt-6 p-4 border rounded-lg">
            <h4 className="font-semibold mb-2">Subscribed Events:</h4>
            <div className="flex flex-wrap gap-1">
              {formData.events.map((event) => (
                <Badge key={event} variant="secondary">
                  {event}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}