// app/dashboard/subscribers/[id]/subscriptions/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Play,
  Pause,
  X
} from 'lucide-react';
import Link from 'next/link';
import { useSubscriber } from '@/hooks/useSubscribers';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const mockSubscriptions = [
  {
    id: 'sub_1',
    planName: 'Premium Plan',
    status: 'active',
    billingCycle: 'monthly',
    amount: 49.99,
    currency: 'USD',
    startDate: '2024-01-15',
    nextBillingDate: '2024-02-15',
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'sub_2',
    planName: 'Basic Plan',
    status: 'canceled',
    billingCycle: 'yearly',
    amount: 299.99,
    currency: 'USD',
    startDate: '2023-06-01',
    endDate: '2024-01-10',
    canceledAt: '2024-01-10T14:30:00Z',
    createdAt: '2023-06-01T09:00:00Z'
  }
];

export default function SubscriptionsPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: subscriber, isLoading } = useSubscriber(id);

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      canceled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      paused: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      expired: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    };
    return variants[status as keyof typeof variants] || variants.expired;
  };

  const getBillingCycleBadge = (cycle: string) => {
    return cycle === 'monthly' 
      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 w-48 bg-muted rounded animate-pulse" />
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
          </div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-5 w-48 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/subscribers/${id}`}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Subscription History</h1>
            <p className="text-muted-foreground">
              Manage subscriptions for {subscriber?.firstName} {subscriber?.lastName}
            </p>
          </div>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Subscription
        </Button>
      </div>

      {/* Active Subscriptions */}
      <Card>
        <CardHeader>
          <CardTitle>Active Subscriptions</CardTitle>
          <CardDescription>
            Currently active subscription plans
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockSubscriptions
              .filter(sub => sub.status === 'active')
              .map((subscription) => (
                <div key={subscription.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{subscription.planName}</h3>
                      <Badge className={getStatusBadge(subscription.status)}>
                        {subscription.status}
                      </Badge>
                      <Badge className={getBillingCycleBadge(subscription.billingCycle)}>
                        {subscription.billingCycle}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span>${subscription.amount}/{subscription.billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                      <span className="mx-2">•</span>
                      <span>Next billing: {new Date(subscription.nextBillingDate!).toLocaleDateString()}</span>
                      <span className="mx-2">•</span>
                      <span>Started: {new Date(subscription.startDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Pause className="h-4 w-4 mr-1" />
                      Pause
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            
            {mockSubscriptions.filter(sub => sub.status === 'active').length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No active subscriptions found
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Subscription History */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription History</CardTitle>
          <CardDescription>
            Past and canceled subscriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockSubscriptions
              .filter(sub => sub.status !== 'active')
              .map((subscription) => (
                <div key={subscription.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{subscription.planName}</h3>
                      <Badge className={getStatusBadge(subscription.status)}>
                        {subscription.status}
                      </Badge>
                      <Badge className={getBillingCycleBadge(subscription.billingCycle)}>
                        {subscription.billingCycle}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span>${subscription.amount}/{subscription.billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                      <span className="mx-2">•</span>
                      <span>
                        {subscription.status === 'canceled' 
                          ? `Canceled: ${new Date(subscription.canceledAt!).toLocaleDateString()}`
                          : `Ended: ${new Date(subscription.endDate!).toLocaleDateString()}`
                        }
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Play className="h-4 w-4 mr-1" />
                    Reactivate
                  </Button>
                </div>
              ))}
            
            {mockSubscriptions.filter(sub => sub.status !== 'active').length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No subscription history found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}