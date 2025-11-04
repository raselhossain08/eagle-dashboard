// components/billing/subscription-details-panel.tsx
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  User, 
  Package, 
  Calendar, 
  DollarSign, 
  Users, 
  Pause, 
  Play, 
  X,
  Edit,
  Save,
  Copy
} from 'lucide-react';
import { Subscription, User as UserType, Plan, Invoice, UpdateSubscriptionDto } from '@/types/billing';
import { formatCurrency, formatDate } from '@/lib/utils';

interface SubscriptionDetailsPanelProps {
  subscription: Subscription;
  customer: UserType;
  plan: Plan;
  invoices: Invoice[];
  onUpdate: (data: UpdateSubscriptionDto) => Promise<void>;
  onCancel: (reason?: string) => Promise<void>;
  onPause: (until: Date) => Promise<void>;
  onResume: () => Promise<void>;
}

export function SubscriptionDetailsPanel({
  subscription,
  customer,
  plan,
  invoices,
  onUpdate,
  onCancel,
  onPause,
  onResume
}: SubscriptionDetailsPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [quantity, setQuantity] = useState(subscription.quantity);
  const [cancelReason, setCancelReason] = useState('');

  const getStatusConfig = (status: Subscription['status']) => {
    const configs = {
      active: { variant: 'default' as const, label: 'Active' },
      canceled: { variant: 'secondary' as const, label: 'Canceled' },
      past_due: { variant: 'destructive' as const, label: 'Past Due' },
      paused: { variant: 'outline' as const, label: 'Paused' },
      trialing: { variant: 'default' as const, label: 'Trialing' },
    };
    return configs[status];
  };

  const statusConfig = getStatusConfig(subscription.status);

  const handleSave = async () => {
    if (quantity !== subscription.quantity) {
      await onUpdate({ quantity });
    }
    setIsEditing(false);
  };

  const handleCancel = async () => {
    if (cancelReason.trim() || window.confirm('Are you sure you want to cancel this subscription?')) {
      await onCancel(cancelReason.trim());
      setCancelReason('');
    }
  };

  const recentInvoices = invoices.slice(0, 5);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Subscription Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Subscription Details</span>
            <Badge variant={statusConfig.variant}>
              {statusConfig.label}
            </Badge>
          </CardTitle>
          <CardDescription>
            Subscription #{subscription.id.slice(0, 8)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Customer</Label>
              <div className="flex items-center mt-1">
                <User className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{customer.firstName} {customer.lastName}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {customer.email}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Plan</Label>
              <div className="flex items-center mt-1">
                <Package className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{plan.name}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {formatCurrency(plan.price, plan.currency)}/{plan.interval}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Current Period</Label>
              <div className="flex items-center mt-1">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <div className="text-sm">
                  <div>Start: {formatDate(subscription.currentPeriodStart)}</div>
                  <div>End: {formatDate(subscription.currentPeriodEnd)}</div>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Seats</Label>
              <div className="flex items-center mt-1">
                <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                {isEditing ? (
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    min="1"
                    className="w-20"
                  />
                ) : (
                  <span>{subscription.quantity}</span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">MRR</Label>
              <div className="flex items-center mt-1">
                <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{formatCurrency(subscription.mrr)}</span>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Processor</Label>
              <div className="mt-1">
                <Badge variant="outline" className="capitalize">
                  {subscription.processor}
                </Badge>
              </div>
            </div>
          </div>

          {subscription.cancelAtPeriodEnd && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <X className="h-4 w-4 text-yellow-600 mr-2" />
                <span className="text-sm font-medium text-yellow-800">
                  Will cancel at period end
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-4">
            {!isEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={handleSave}
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            )}

            {subscription.status === 'active' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPause(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))}
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </>
            )}

            {subscription.status === 'paused' && (
              <Button
                variant="outline"
                size="sm"
                onClick={onResume}
              >
                <Play className="h-4 w-4 mr-2" />
                Resume
              </Button>
            )}
          </div>

          {subscription.status === 'active' && (
            <div className="space-y-2">
              <Label htmlFor="cancelReason" className="text-sm">
                Cancellation Reason (Optional)
              </Label>
              <Textarea
                id="cancelReason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Why is this subscription being canceled?"
                rows={2}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Invoices */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
          <CardDescription>
            Last 5 invoices for this subscription
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentInvoices.length > 0 ? (
            <div className="space-y-3">
              {recentInvoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{invoice.invoiceNumber}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(invoice.createdAt)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {formatCurrency(invoice.amountDue, invoice.currency)}
                    </div>
                    <Badge variant={
                      invoice.status === 'open' ? 'default' :
                      invoice.status === 'void' || invoice.status === 'uncollectible' ? 'destructive' : 'outline'
                    }>
                      {invoice.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Copy className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No invoices found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}