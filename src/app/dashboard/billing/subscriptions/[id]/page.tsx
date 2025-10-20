// app/dashboard/billing/subscriptions/[id]/page.tsx
'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { BillingDashboardShell } from '@/components/billing/billing-dashboard-shell';
import { BillingNavigation } from '@/components/billing/billing-navigation';
import { SubscriptionDetailsPanel } from '@/components/billing/subscription-details-panel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, TrendingUp, Users } from 'lucide-react';
import { useSubscription } from '@/hooks/use-subscriptions';
import { UpdateSubscriptionDto } from '@/types/billing';
import Link from 'next/link';

// Mock data - replace with actual API calls
const mockCustomer = {
  id: 'user_123',
  email: 'customer@example.com',
  firstName: 'John',
  lastName: 'Doe',
  company: 'Example Corp'
};

const mockPlan = {
  id: 'plan_123',
  name: 'Pro Plan',
  price: 29900,
  currency: 'USD',
  interval: 'month' as const,
  intervalCount: 1,
  trialPeriodDays: 0,
  features: ['Feature 1', 'Feature 2', 'Feature 3'],
  sortOrder: 1,
  isActive: true,
  isVisible: true,
  baseSeats: 1,
  pricePerSeat: 1000,
  createdAt: new Date(),
  updatedAt: new Date()
};

const mockInvoices = [
  {
    id: 'inv_1',
    userId: 'user_123',
    subscriptionId: 'sub_123',
    invoiceNumber: 'INV-2024-001',
    amountDue: 29900,
    amountPaid: 29900,
    currency: 'USD',
    status: 'paid' as const,
    dueDate: new Date('2024-01-15'),
    paidAt: new Date('2024-01-10'),
    lineItems: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: 'inv_2',
    userId: 'user_123',
    subscriptionId: 'sub_123',
    invoiceNumber: 'INV-2024-002',
    amountDue: 29900,
    amountPaid: 0,
    currency: 'USD',
    status: 'open' as const,
    dueDate: new Date('2024-02-15'),
    lineItems: [],
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01')
  }
];

export default function SubscriptionDetailsPage() {
  const params = useParams();
  const subscriptionId = params.id as string;
  
  const { data: subscription, isLoading } = useSubscription(subscriptionId);

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Billing', href: '/dashboard/billing' },
    { label: 'Subscriptions', href: '/dashboard/billing/subscriptions' },
    { label: `Subscription #${subscriptionId.slice(0, 8)}`, href: '#', active: true }
  ];

  const handleUpdate = async (data: UpdateSubscriptionDto) => {
    console.log('Update subscription:', data);
    // Implement update logic
  };

  const handleCancel = async (reason?: string) => {
    console.log('Cancel subscription:', reason);
    // Implement cancel logic
  };

  const handlePause = async (until: Date) => {
    console.log('Pause subscription until:', until);
    // Implement pause logic
  };

  const handleResume = async () => {
    console.log('Resume subscription');
    // Implement resume logic
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen">
        <div className="hidden w-64 lg:block border-r">
          <div className="p-6">
            <BillingNavigation />
          </div>
        </div>
        <BillingDashboardShell
          title="Loading..."
          description="Loading subscription details"
          breadcrumbs={breadcrumbs}
        >
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded animate-pulse w-1/3" />
            <div className="h-64 bg-muted rounded animate-pulse" />
          </div>
        </BillingDashboardShell>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="flex min-h-screen">
        <div className="hidden w-64 lg:block border-r">
          <div className="p-6">
            <BillingNavigation />
          </div>
        </div>
        <BillingDashboardShell
          title="Subscription Not Found"
          description="The requested subscription could not be found"
          breadcrumbs={breadcrumbs}
        >
          <div className="text-center py-12">
            <Users className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Subscription Not Found</h3>
            <p className="text-muted-foreground mb-6">
              The subscription you're looking for doesn't exist or has been deleted.
            </p>
            <Link href="/dashboard/billing/subscriptions">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Subscriptions
              </Button>
            </Link>
          </div>
        </BillingDashboardShell>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar Navigation */}
      <div className="hidden w-64 lg:block border-r">
        <div className="p-6">
          <BillingNavigation />
        </div>
      </div>

      {/* Main Content */}
      <BillingDashboardShell
        title={`Subscription #${subscriptionId.slice(0, 8)}`}
        description="Manage subscription details and billing"
        breadcrumbs={breadcrumbs}
        actions={
          <Link href="/dashboard/billing/subscriptions">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Subscriptions
            </Button>
          </Link>
        }
      >
        <div className="space-y-6">
          {/* Subscription Details Panel */}
          <SubscriptionDetailsPanel
            subscription={subscription}
            customer={mockCustomer}
            plan={mockPlan}
            invoices={mockInvoices}
            onUpdate={handleUpdate}
            onCancel={handleCancel}
            onPause={handlePause}
            onResume={handleResume}
          />

          {/* Additional Analytics */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$598.00</div>
                <p className="text-xs text-muted-foreground">
                  Lifetime value
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Months Active</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
                <p className="text-xs text-muted-foreground">
                  Since January 2024
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Next Invoice</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Feb 15</div>
                <p className="text-xs text-muted-foreground">
                  Next billing date
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </BillingDashboardShell>
    </div>
  );
}