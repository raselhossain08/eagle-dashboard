// app/dashboard/billing/invoices/new/page.tsx
'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { BillingDashboardShell } from '@/components/billing/billing-dashboard-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Plus, Trash2, Calculator, Search, CreditCard, AlertTriangle } from 'lucide-react';
import { useCreateInvoice } from '@/hooks/use-invoices';
import { useUsers } from '@/hooks/use-users';
import { useSubscriptions } from '@/hooks/use-subscriptions';
import { CreateInvoiceDto, InvoiceLineItem, User as BillingUser, Subscription } from '@/types/billing';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import { ApiErrorHandler } from '@/components/api-error-handler';
import { ErrorBoundary } from '@/components/error-boundary';
import Link from 'next/link';

interface LineItemForm extends Omit<InvoiceLineItem, 'id' | 'amount'> {
  description: string;
  quantity: number;
  unitPrice: number;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const createInvoiceMutation = useCreateInvoice();
  
  // Refs for dropdown click outside detection
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const subscriptionDropdownRef = useRef<HTMLDivElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    userId: '',
    subscriptionId: '',
    currency: 'usd',
    dueDate: '',
    notes: '',
  });

  const [lineItems, setLineItems] = useState<LineItemForm[]>([
    { description: '', quantity: 1, unitPrice: 0 }
  ]);

  // User and subscription search
  const [userSearch, setUserSearch] = useState('');
  const [subscriptionSearch, setSubscriptionSearch] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showSubscriptionDropdown, setShowSubscriptionDropdown] = useState(false);
  const [selectedUser, setSelectedUser] = useState<BillingUser | null>(null);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
      if (subscriptionDropdownRef.current && !subscriptionDropdownRef.current.contains(event.target as Node)) {
        setShowSubscriptionDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // API queries
  const { data: usersData, isLoading: usersLoading, error: usersError } = useUsers({
    search: userSearch,
    limit: 10,
  });

  const { data: subscriptionsData, isLoading: subscriptionsLoading, error: subscriptionsError } = useSubscriptions({
    search: subscriptionSearch,
    pageSize: 10,
  });

  const [taxRate, setTaxRate] = useState(0);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState(0);

  // Memoized filtered data
  const filteredUsers = useMemo(() => {
    if (!usersData?.data) return [];
    return userSearch 
      ? usersData.data.filter(user => 
          user.email.toLowerCase().includes(userSearch.toLowerCase()) ||
          user.firstName?.toLowerCase().includes(userSearch.toLowerCase()) ||
          user.lastName?.toLowerCase().includes(userSearch.toLowerCase())
        )
      : usersData.data;
  }, [usersData?.data, userSearch]);

  const filteredSubscriptions = useMemo(() => {
    if (!subscriptionsData?.data) return [];
    return subscriptionSearch
      ? subscriptionsData.data.filter(sub => sub.id.toLowerCase().includes(subscriptionSearch.toLowerCase()))
      : subscriptionsData.data;
  }, [subscriptionsData?.data, subscriptionSearch]);

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Billing', href: '/dashboard/billing' },
    { label: 'Invoices', href: '/dashboard/billing/invoices' },
    { label: 'New Invoice', href: '#', active: true }
  ];

  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  const updateLineItem = (index: number, field: keyof LineItemForm, value: string | number) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    setLineItems(updated);
  };

  const calculateSubtotal = () => {
    return lineItems.reduce((total, item) => total + (item.quantity * item.unitPrice), 0);
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    return subtotal * (taxRate / 100);
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    if (discountType === 'percentage') {
      return subtotal * (discountValue / 100);
    }
    return discountValue;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax();
    const discount = calculateDiscount();
    return subtotal + tax - discount;
  };

  // User selection handlers
  const handleUserSelect = (user: BillingUser) => {
    setSelectedUser(user);
    setFormData({ ...formData, userId: user.id });
    setUserSearch(user.email);
    setShowUserDropdown(false);
  };

  const handleSubscriptionSelect = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setFormData({ ...formData, subscriptionId: subscription.id });
    setSubscriptionSearch(subscription.id);
    setShowSubscriptionDropdown(false);
  };

  const clearUserSelection = () => {
    setSelectedUser(null);
    setFormData({ ...formData, userId: '' });
    setUserSearch('');
  };

  const clearSubscriptionSelection = () => {
    setSelectedSubscription(null);
    setFormData({ ...formData, subscriptionId: '' });
    setSubscriptionSearch('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!selectedUser) {
      toast.error('Please select a user for this invoice');
      return;
    }

    if (lineItems.some(item => !item.description?.trim())) {
      toast.error('Please provide descriptions for all line items');
      return;
    }

    if (lineItems.some(item => item.quantity <= 0)) {
      toast.error('All line items must have a quantity greater than 0');
      return;
    }

    if (lineItems.some(item => item.unitPrice < 0)) {
      toast.error('Unit prices cannot be negative');
      return;
    }

    if (calculateTotal() <= 0) {
      toast.error('Invoice total must be greater than 0');
      return;
    }

    const invoiceData: CreateInvoiceDto = {
      userId: selectedUser.id,
      subscriptionId: selectedSubscription?.id,
      lineItems: lineItems.map(item => ({
        description: item.description.trim(),
        quantity: item.quantity,
        unitPrice: Math.round(item.unitPrice * 100), // Convert to cents
        amount: Math.round(item.quantity * item.unitPrice * 100), // Convert to cents
      })),
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      taxDetails: taxRate > 0 ? {
        rate: taxRate,
        amount: Math.round(calculateTax() * 100), // Convert to cents
      } : undefined,
      discount: discountValue > 0 ? {
        type: discountType,
        value: Math.round(calculateDiscount() * 100), // Convert to cents
      } : undefined,
    };

    try {
      const result = await createInvoiceMutation.mutateAsync(invoiceData);
      toast.success('Invoice created successfully');
      router.push(`/dashboard/billing/invoices/${result.id}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create invoice';
      toast.error(errorMessage);
      console.error('Invoice creation error:', error);
    }
  };

  return (
    <ErrorBoundary>
      <BillingDashboardShell
        title="Create New Invoice"
        description="Generate a new invoice for a customer"
        breadcrumbs={breadcrumbs}
        actions={
          <Link href="/dashboard/billing/invoices">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Invoices
            </Button>
          </Link>
        }
      >
        {/* Error Alerts */}
        {(usersError || subscriptionsError || createInvoiceMutation.error) && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {usersError && "Failed to load users. "}
              {subscriptionsError && "Failed to load subscriptions. "}
              {createInvoiceMutation.error && "Failed to create invoice. "}
              Please try refreshing the page or contact support if the issue persists.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Invoice Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
                <CardDescription>
                  Search and select the customer for this invoice
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* User Selection */}
                <div className="space-y-2">
                  <Label htmlFor="userSearch">Customer *</Label>
                  <div className="relative" ref={userDropdownRef}>
                    {selectedUser ? (
                      <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="text-sm font-medium">
                              {selectedUser.firstName?.[0] || selectedUser.email[0].toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">
                              {selectedUser.firstName && selectedUser.lastName 
                                ? `${selectedUser.firstName} ${selectedUser.lastName}`
                                : selectedUser.name || 'Unknown Name'
                              }
                            </p>
                            <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                          </div>
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm"
                          onClick={clearUserSelection}
                        >
                          Change
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="relative">
                          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="userSearch"
                            value={userSearch}
                            onChange={(e) => {
                              setUserSearch(e.target.value);
                              setShowUserDropdown(true);
                            }}
                            onFocus={() => setShowUserDropdown(true)}
                            placeholder="Search by email, name..."
                            className="pl-10"
                            required
                          />
                        </div>
                        
                        {showUserDropdown && (
                          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border rounded-lg shadow-lg max-h-48 overflow-auto">
                            {usersLoading ? (
                              <div className="p-3">
                                <Skeleton className="h-4 w-3/4 mb-2" />
                                <Skeleton className="h-4 w-1/2" />
                              </div>
                            ) : usersError ? (
                              <div className="p-3">
                                <ApiErrorHandler error={usersError} />
                              </div>
                            ) : filteredUsers.length > 0 ? (
                              filteredUsers.map((user) => (
                                <div
                                  key={user.id}
                                  className="p-3 hover:bg-muted/50 cursor-pointer border-b last:border-0"
                                  onClick={() => handleUserSelect(user)}
                                >
                                  <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                      <span className="text-sm font-medium">
                                        {user.firstName?.[0] || user.email[0].toUpperCase()}
                                      </span>
                                    </div>
                                    <div>
                                      <p className="font-medium">
                                        {user.firstName && user.lastName 
                                          ? `${user.firstName} ${user.lastName}`
                                          : user.name || 'Unknown Name'
                                        }
                                      </p>
                                      <p className="text-sm text-muted-foreground">{user.email}</p>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="p-3 text-center text-muted-foreground">
                                {userSearch ? 'No users found' : 'Start typing to search users'}
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
                
                {/* Subscription Selection */}
                <div className="space-y-2">
                  <Label htmlFor="subscriptionSearch">Subscription (Optional)</Label>
                  <div className="relative" ref={subscriptionDropdownRef}>
                    {selectedSubscription ? (
                      <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                        <div className="flex items-center space-x-3">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Subscription #{selectedSubscription.id.slice(-8)}</p>
                            <p className="text-sm text-muted-foreground">
                              Status: <Badge variant={selectedSubscription.status === 'active' ? 'default' : 'secondary'}>
                                {selectedSubscription.status}
                              </Badge>
                            </p>
                          </div>
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm"
                          onClick={clearSubscriptionSelection}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="relative">
                          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="subscriptionSearch"
                            value={subscriptionSearch}
                            onChange={(e) => {
                              setSubscriptionSearch(e.target.value);
                              setShowSubscriptionDropdown(true);
                            }}
                            onFocus={() => setShowSubscriptionDropdown(true)}
                            placeholder="Search subscriptions..."
                            className="pl-10"
                          />
                        </div>
                        
                        {showSubscriptionDropdown && (
                          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border rounded-lg shadow-lg max-h-48 overflow-auto">
                            {subscriptionsLoading ? (
                              <div className="p-3">
                                <Skeleton className="h-4 w-3/4 mb-2" />
                                <Skeleton className="h-4 w-1/2" />
                              </div>
                            ) : subscriptionsError ? (
                              <div className="p-3">
                                <ApiErrorHandler error={subscriptionsError} />
                              </div>
                            ) : filteredSubscriptions.length > 0 ? (
                              filteredSubscriptions.map((subscription) => (
                                <div
                                  key={subscription.id}
                                  className="p-3 hover:bg-muted/50 cursor-pointer border-b last:border-0"
                                  onClick={() => handleSubscriptionSelect(subscription)}
                                >
                                  <div className="flex items-center space-x-3">
                                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                      <p className="font-medium">Subscription #{subscription.id.slice(-8)}</p>
                                      <p className="text-sm text-muted-foreground">
                                        Status: <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                                          {subscription.status}
                                        </Badge>
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="p-3 text-center text-muted-foreground">
                                {subscriptionSearch ? 'No subscriptions found' : 'Start typing to search subscriptions'}
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Link this invoice to an existing subscription (optional)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Line Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Line Items</span>
                  <Button type="button" onClick={addLineItem} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </CardTitle>
                <CardDescription>
                  Add products or services to this invoice
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {lineItems.map((item, index) => (
                  <div key={index} className="grid gap-4 p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Item {index + 1}</Badge>
                      {lineItems.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLineItem(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="md:col-span-2">
                        <Label>Description *</Label>
                        <Input
                          value={item.description}
                          onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                          placeholder="Service or product description"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label>Quantity *</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(index, 'quantity', parseInt(e.target.value) || 1)}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label>Unit Price *</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateLineItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label>Line Total</Label>
                        <div className="flex items-center h-10 px-3 bg-muted rounded-md">
                          <span className="font-medium">
                            {formatCurrency(item.quantity * item.unitPrice, formData.currency)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Invoice Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Invoice Settings</CardTitle>
                <CardDescription>
                  Configure invoice terms and settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="usd">USD - US Dollar</SelectItem>
                        <SelectItem value="eur">EUR - Euro</SelectItem>
                        <SelectItem value="gbp">GBP - British Pound</SelectItem>
                        <SelectItem value="cad">CAD - Canadian Dollar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes or terms for this invoice"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            {/* Tax and Discount */}
            <Card>
              <CardHeader>
                <CardTitle>Tax & Discount</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Tax Rate (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={taxRate}
                    onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Discount Type</Label>
                  <Select value={discountType} onValueChange={(value: 'percentage' | 'fixed') => setDiscountType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Discount Value</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Invoice Total */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calculator className="h-5 w-5 mr-2" />
                  Invoice Total
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(calculateSubtotal(), formData.currency)}</span>
                </div>
                
                {taxRate > 0 && (
                  <div className="flex justify-between">
                    <span>Tax ({taxRate}%):</span>
                    <span>{formatCurrency(calculateTax(), formData.currency)}</span>
                  </div>
                )}
                
                {discountValue > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>
                      Discount ({discountType === 'percentage' ? `${discountValue}%` : 'Fixed'}):
                    </span>
                    <span>-{formatCurrency(calculateDiscount(), formData.currency)}</span>
                  </div>
                )}
                
                <hr />
                
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>{formatCurrency(calculateTotal(), formData.currency)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Validation Summary */}
            {!selectedUser && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Please select a customer to create the invoice.
                </AlertDescription>
              </Alert>
            )}

            {lineItems.some(item => !item.description?.trim()) && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  All line items must have a description.
                </AlertDescription>
              </Alert>
            )}

            {calculateTotal() <= 0 && lineItems.some(item => item.description?.trim()) && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Invoice total must be greater than $0.00.
                </AlertDescription>
              </Alert>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={
                  createInvoiceMutation.isPending || 
                  !selectedUser || 
                  lineItems.some(item => !item.description?.trim()) ||
                  calculateTotal() <= 0
                }
              >
                {createInvoiceMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-t-transparent border-white rounded-full animate-spin" />
                    Creating Invoice...
                  </>
                ) : (
                  'Create Invoice'
                )}
              </Button>
              
              <Link href="/dashboard/billing/invoices" className="block">
                <Button variant="outline" className="w-full" disabled={createInvoiceMutation.isPending}>
                  Cancel
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </form>
      </BillingDashboardShell>
    </ErrorBoundary>
  );
}