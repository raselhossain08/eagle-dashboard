// app/dashboard/users/[id]/subscriptions/page.tsx
'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Plus, 
  CreditCard, 
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  RefreshCw,
  AlertCircle,
  FileText,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import { 
  useUserSubscriptions, 
  useSubscriptionPlans, 
  useSubscriptionMetrics,
  useCreateSubscription,
  useCancelSubscription,
  usePauseSubscription,
  useResumeSubscription,
  useSubscriptionInvoices 
} from '@/hooks/useSubscriptions';
import { toast } from 'sonner';

export default function SubscriptionsPage() {
  const params = useParams();
  const userId = params.id as string;
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [newSubscriptionOpen, setNewSubscriptionOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<string | null>(null);

  const { 
    data: subscriptionsData, 
    isLoading: subscriptionsLoading, 
    error: subscriptionsError, 
    refetch: refetchSubscriptions 
  } = useUserSubscriptions(userId, {
    page: 1,
    limit: 20,
    ...(selectedStatus !== 'all' && { status: selectedStatus })
  });

  const { data: plans } = useSubscriptionPlans();
  const { data: metrics } = useSubscriptionMetrics(userId);
  const { data: invoices } = useSubscriptionInvoices(selectedSubscription || '');

  const createSubscription = useCreateSubscription();
  const cancelSubscription = useCancelSubscription();
  const pauseSubscription = usePauseSubscription();
  const resumeSubscription = useResumeSubscription();

  const [subscriptionForm, setSubscriptionForm] = useState({
    planId: '',
    billingCycle: 'monthly',
    startDate: new Date().toISOString().split('T')[0]
  });

  const handleCreateSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSubscription.mutateAsync({
        userId,
        planId: subscriptionForm.planId,
        billingCycle: subscriptionForm.billingCycle,
        startDate: subscriptionForm.startDate
      });
      toast.success('Subscription created successfully');
      setNewSubscriptionOpen(false);
      setSubscriptionForm({ planId: '', billingCycle: 'monthly', startDate: new Date().toISOString().split('T')[0] });
    } catch (error: any) {
      toast.error(error.message || 'Failed to create subscription');
    }
  };

  const handleCancelSubscription = async (subscriptionId: string, immediate: boolean = false) => {
    if (window.confirm(`Are you sure you want to ${immediate ? 'immediately cancel' : 'cancel'} this subscription?`)) {
      try {
        await cancelSubscription.mutateAsync({ id: subscriptionId, immediate });
        toast.success('Subscription cancelled successfully');
      } catch (error: any) {
        toast.error(error.message || 'Failed to cancel subscription');
      }
    }
  };

  const handlePauseSubscription = async (subscriptionId: string) => {
    try {
      await pauseSubscription.mutateAsync({ id: subscriptionId });
      toast.success('Subscription paused successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to pause subscription');
    }
  };

  const handleResumeSubscription = async (subscriptionId: string) => {
    try {
      await resumeSubscription.mutateAsync(subscriptionId);
      toast.success('Subscription resumed successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to resume subscription');
    }
  };

  const handleRefresh = () => {
    refetchSubscriptions();
    toast.success('Subscription data refreshed');
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'active': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'cancelled': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'paused': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'expired': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      'pending': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
      case 'expired':
        return <XCircle className="h-4 w-4" />;
      case 'paused':
        return <Pause className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (subscriptionsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/users/${userId}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to User
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
              <p className="text-muted-foreground">
                Manage user subscriptions and billing
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Loading subscription data...</p>
          </div>
        </div>
      </div>
    );
  }

  const subscriptions = subscriptionsData?.subscriptions || [];
  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active').length;
  const totalRevenue = subscriptions.reduce((sum, sub) => sum + sub.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/users/${userId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to User
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
            <p className="text-muted-foreground">
              Manage user subscriptions and billing
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={newSubscriptionOpen} onOpenChange={setNewSubscriptionOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Subscription
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Subscription</DialogTitle>
                <DialogDescription>
                  Add a new subscription for this user
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateSubscription} className="space-y-4">
                <div>
                  <Label htmlFor="planId">Subscription Plan</Label>
                  <Select value={subscriptionForm.planId} onValueChange={(value) => setSubscriptionForm(prev => ({ ...prev, planId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {plans?.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name} - ${plan.price}/{plan.billingCycle}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="billingCycle">Billing Cycle</Label>
                    <Select value={subscriptionForm.billingCycle} onValueChange={(value) => setSubscriptionForm(prev => ({ ...prev, billingCycle: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={subscriptionForm.startDate}
                      onChange={(e) => setSubscriptionForm(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setNewSubscriptionOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createSubscription.isPending}>
                    {createSubscription.isPending ? 'Creating...' : 'Create Subscription'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Error Alert */}
      {subscriptionsError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load subscription data: {subscriptionsError.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Subscription Metrics */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <Badge variant="outline">{activeSubscriptions}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground">
              Currently active subscriptions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Lifetime revenue from user
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscriptions.length}</div>
            <p className="text-xs text-muted-foreground">
              All-time subscriptions
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="subscriptions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="billing">Billing History</TabsTrigger>
        </TabsList>

        <TabsContent value="subscriptions">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Subscription Management</CardTitle>
                  <CardDescription>
                    All subscription plans and their current status
                  </CardDescription>
                </div>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {subscriptions.length > 0 ? (
                <div className="space-y-4">
                  {subscriptions.map((subscription) => (
                    <div key={subscription.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(subscription.status)} variant="secondary">
                              {getStatusIcon(subscription.status)}
                              {subscription.status}
                            </Badge>
                            <Badge variant="outline">{subscription.billingCycle}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Plan ID: {subscription.planId}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold">
                            ${subscription.amount.toFixed(2)} {subscription.currency.toUpperCase()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            per {subscription.billingCycle}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Start Date:</span>
                          <div>{new Date(subscription.startDate).toLocaleDateString()}</div>
                        </div>
                        {subscription.endDate && (
                          <div>
                            <span className="text-muted-foreground">End Date:</span>
                            <div>{new Date(subscription.endDate).toLocaleDateString()}</div>
                          </div>
                        )}
                        {subscription.nextBillingDate && (
                          <div>
                            <span className="text-muted-foreground">Next Billing:</span>
                            <div>{new Date(subscription.nextBillingDate).toLocaleDateString()}</div>
                          </div>
                        )}
                        {subscription.trial?.isTrialPeriod && (
                          <div>
                            <span className="text-muted-foreground">Trial Ends:</span>
                            <div>{subscription.trial.trialEndDate ? new Date(subscription.trial.trialEndDate).toLocaleDateString() : 'N/A'}</div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          Created {new Date(subscription.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex gap-2">
                          {subscription.status === 'active' && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handlePauseSubscription(subscription.id)}
                              >
                                <Pause className="h-4 w-4 mr-1" />
                                Pause
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleCancelSubscription(subscription.id)}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Cancel
                              </Button>
                            </>
                          )}
                          {subscription.status === 'paused' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleResumeSubscription(subscription.id)}
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Resume
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedSubscription(subscription.id)}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            View Invoices
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CreditCard className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">No Subscriptions</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    This user doesn't have any subscription history. Add a subscription to get started.
                  </p>
                  <Button onClick={() => setNewSubscriptionOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Subscription
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>
                Invoice history and payment records
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedSubscription && invoices && invoices.length > 0 ? (
                <div className="space-y-4">
                  {invoices.map((invoice: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <div className="font-medium">Invoice #{invoice.id || index + 1}</div>
                        <div className="text-sm text-muted-foreground">
                          {invoice.date ? new Date(invoice.date).toLocaleDateString() : 'Date not available'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${invoice.amount || '0.00'}</div>
                        <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                          {invoice.status || 'pending'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">No Billing History</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    {selectedSubscription 
                      ? 'No invoices found for the selected subscription.'
                      : 'Select a subscription to view its billing history.'
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}