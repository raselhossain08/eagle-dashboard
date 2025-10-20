'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Users, Send, Clock, X } from 'lucide-react';
import { useBulkNotification } from '@/hooks/useNotifications';
import { toast } from 'sonner';

export default function BulkNotificationForm() {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'success' | 'warning' | 'error' | 'alert',
    category: 'system' as 'system' | 'billing' | 'security' | 'feature' | 'maintenance',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    userIds: [''] as string[],
    schedule: false,
    scheduleAt: '',
  });

  const { mutate: sendBulk, isPending } = useBulkNotification();

  const handleAddUser = () => {
    setFormData(prev => ({
      ...prev,
      userIds: [...prev.userIds, '']
    }));
  };

  const handleUserChange = (index: number, value: string) => {
    const newUserIds = [...formData.userIds];
    newUserIds[index] = value;
    setFormData(prev => ({ ...prev, userIds: newUserIds }));
  };

  const handleRemoveUser = (index: number) => {
    setFormData(prev => ({
      ...prev,
      userIds: prev.userIds.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validUserIds = formData.userIds.filter(id => id.trim() !== '');
    if (validUserIds.length === 0) {
      toast.error('Please add at least one user ID');
      return;
    }

    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (!formData.message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    sendBulk({
      title: formData.title,
      message: formData.message,
      type: formData.type,
      category: formData.category,
      priority: formData.priority,
      userIds: validUserIds,
      scheduleAt: formData.schedule ? formData.scheduleAt : undefined,
    }, {
      onSuccess: () => {
        toast.success('Bulk notification sent successfully');
        setFormData({
          title: '',
          message: '',
          type: 'info',
          category: 'system',
          priority: 'medium',
          userIds: [''],
          schedule: false,
          scheduleAt: '',
        });
      },
      onError: () => {
        toast.error('Failed to send bulk notification');
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send Bulk Notification</CardTitle>
        <CardDescription>
          Send notifications to multiple users at once
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Notification Title</Label>
                <Input
                  id="title"
                  placeholder="Important Update"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Enter your notification message..."
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="alert">Alert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value: any) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="billing">Billing</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="feature">Feature</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Recipients</Label>
                {formData.userIds.map((userId, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="User ID"
                      value={userId}
                      onChange={(e) => handleUserChange(index, e.target.value)}
                      required
                    />
                    {formData.userIds.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleRemoveUser(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={handleAddUser}>
                  <Users className="h-4 w-4 mr-2" />
                  Add Recipient
                </Button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="schedule" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Schedule Notification
                  </Label>
                  <Switch
                    id="schedule"
                    checked={formData.schedule}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, schedule: checked }))}
                  />
                </div>

                {formData.schedule && (
                  <div className="space-y-2">
                    <Label htmlFor="scheduleAt">Schedule Date & Time</Label>
                    <Input
                      id="scheduleAt"
                      type="datetime-local"
                      value={formData.scheduleAt}
                      onChange={(e) => setFormData(prev => ({ ...prev, scheduleAt: e.target.value }))}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Summary</Label>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Recipients:</span>
                    <Badge variant="secondary">
                      {formData.userIds.filter(id => id.trim() !== '').length}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <Badge variant="outline">{formData.type}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Priority:</span>
                    <Badge variant="outline">{formData.priority}</Badge>
                  </div>
                  {formData.schedule && formData.scheduleAt && (
                    <div className="flex justify-between">
                      <span>Scheduled for:</span>
                      <Badge variant="outline">
                        {new Date(formData.scheduleAt).toLocaleString()}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            <Send className="h-4 w-4 mr-2" />
            {isPending ? 'Sending...' : 'Send Bulk Notification'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}