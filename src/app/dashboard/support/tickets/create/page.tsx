// app/dashboard/support/tickets/create/page.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, User, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useCreateSupportNote } from '@/hooks/useSupport';
import { useSupportStore } from '@/stores/support-store';

export default function CreateTicketPage() {
  const { mutate: createNote, isPending } = useCreateSupportNote();
  const currentCustomer = useSupportStore((state) => state.currentCustomer);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general' as const,
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    requiresFollowUp: false,
    followUpDate: '',
    isInternal: false,
    assignedTo: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentCustomer) {
      alert('Please select a customer first');
      return;
    }

    createNote({
      userId: currentCustomer.id,
      content: formData.content,
      category: formData.category,
      isInternal: formData.isInternal,
      requiresFollowUp: formData.requiresFollowUp,
      followUpDate: formData.followUpDate || undefined
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/support/tickets">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tickets
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Create New Ticket</h1>
          <p className="text-muted-foreground">
            Create a new support ticket for customer issue
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Ticket Details</CardTitle>
              <CardDescription>
                Provide detailed information about the customer issue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Brief description of the issue"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Description</Label>
                  <Textarea
                    id="content"
                    placeholder="Detailed description of the issue, steps to reproduce, error messages, etc."
                    rows={8}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="billing">Billing</SelectItem>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="account">Account</SelectItem>
                        <SelectItem value="fraud">Fraud</SelectItem>
                        <SelectItem value="high_priority">High Priority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="requiresFollowUp"
                      checked={formData.requiresFollowUp}
                      onChange={(e) => setFormData({ ...formData, requiresFollowUp: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="requiresFollowUp">Requires Follow-up</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isInternal"
                      checked={formData.isInternal}
                      onChange={(e) => setFormData({ ...formData, isInternal: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="isInternal">Internal Note</Label>
                  </div>
                </div>

                {formData.requiresFollowUp && (
                  <div className="space-y-2">
                    <Label htmlFor="followUpDate">Follow-up Date</Label>
                    <Input
                      type="datetime-local"
                      id="followUpDate"
                      value={formData.followUpDate}
                      onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                    />
                  </div>
                )}

                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    <Save className="h-4 w-4 mr-2" />
                    {isPending ? 'Creating...' : 'Create Ticket'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              {currentCustomer ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-medium">{currentCustomer.name}</div>
                      <div className="text-sm text-muted-foreground">{currentCustomer.email}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <div className="text-muted-foreground">Support Tier</div>
                      <Badge variant="secondary">{currentCustomer.supportTier}</Badge>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Total Tickets</div>
                      <div>{currentCustomer.ticketCount}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No customer selected
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Call
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <User className="w-4 h-4 mr-2" />
                Impersonate User
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}