// components/billing/subscriptions-table.tsx
'use client';

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Pause, Play, X } from 'lucide-react';
import { Subscription, PaginationState, SubscriptionStatus } from '@/types/billing';
import { formatCurrency, formatDate } from '@/lib/utils';

interface SubscriptionFilters {
  status?: SubscriptionStatus;
  planId?: string;
  search?: string;
}

interface SubscriptionsTableProps {
  data: Subscription[];
  pagination: PaginationState;
  filters: SubscriptionFilters;
  onFiltersChange: (filters: SubscriptionFilters) => void;
  onCancel: (subscriptionId: string, reason?: string) => void;
  onPause: (subscriptionId: string, until: Date) => void;
  onResume: (subscriptionId: string) => void;
  isLoading?: boolean;
}

export function SubscriptionsTable({
  data,
  pagination,
  filters,
  onFiltersChange,
  onCancel,
  onPause,
  onResume,
  isLoading
}: SubscriptionsTableProps) {
  const getStatusBadge = (status: SubscriptionStatus) => {
    const statusConfig = {
      active: { variant: "default" as const, label: "Active" },
      canceled: { variant: "secondary" as const, label: "Canceled" },
      past_due: { variant: "destructive" as const, label: "Past Due" },
      paused: { variant: "outline" as const, label: "Paused" },
      trialing: { variant: "default" as const, label: "Trialing" },
    };
    
    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const isActionable = (subscription: Subscription) => {
    return subscription.status === 'active' || subscription.status === 'trialing';
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 bg-muted rounded animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>MRR</TableHead>
            <TableHead>Current Period</TableHead>
            <TableHead>Seats</TableHead>
            <TableHead>Processor</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((subscription) => (
            <TableRow key={subscription.id}>
              <TableCell className="font-medium">
                User #{subscription.userId.slice(0, 8)}
              </TableCell>
              <TableCell>Plan #{subscription.planId.slice(0, 8)}</TableCell>
              <TableCell>
                {getStatusBadge(subscription.status)}
                {subscription.cancelAtPeriodEnd && (
                  <Badge variant="outline" className="ml-2">
                    Cancels
                  </Badge>
                )}
              </TableCell>
              <TableCell className="font-medium">
                {formatCurrency(subscription.mrr)}
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <div>Start: {formatDate(subscription.currentPeriodStart)}</div>
                  <div>End: {formatDate(subscription.currentPeriodEnd)}</div>
                </div>
              </TableCell>
              <TableCell>
                {subscription.quantity}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {subscription.processor}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {isActionable(subscription) && (
                  <div className="flex justify-end space-x-2">
                    {subscription.status === 'active' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onPause(subscription.id, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))}
                        >
                          <Pause className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onCancel(subscription.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    {subscription.status === 'paused' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onResume(subscription.id)}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {data.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No subscriptions found.
        </div>
      )}
    </div>
  );
}