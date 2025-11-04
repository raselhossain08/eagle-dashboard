'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Plus, User, Mail, Phone, Calendar, MessageSquare, Shield, Download, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { CustomerProfile } from '@/components/CustomerProfile';
import { SupportNotesTable } from '@/components/SupportNotesTable';
import { SupportTimeline } from '@/components/SupportTimeline';
import { useSupportNotes, useSupportStats } from '@/hooks/useSupport';
import { useCustomer, useCustomerSupportSummary } from '@/hooks/useCustomers';
import { useSupportStore } from '@/stores/support-store';
import { CreateNoteModal } from '@/components/CreateNoteModal';
import { toast } from 'sonner';

export default function CustomerDetailPage() {
  const params = useParams();
  const customerId = params.customerId as string;
  
  const { data: customer, isLoading: customerLoading, error, refetch: refetchCustomer } = useCustomer(customerId);
  const { data: notesData, isLoading: notesLoading, error: notesError, refetch: refetchNotes } = useSupportNotes(customerId);
  const { data: supportSummary, isLoading: summaryLoading, error: summaryError, refetch: refetchSummary } = useCustomerSupportSummary(customerId);
  const { data: stats } = useSupportStats();
  const { isCreatingNote, setIsCreatingNote } = useSupportStore((state) => ({
    isCreatingNote: state.isCreatingNote,
    setIsCreatingNote: state.setIsCreatingNote,
  }));

  const handleStartImpersonation = (customerId: string) => {
    console.log('Start impersonation for:', customerId);
    // TODO: Implement impersonation logic with real API call
  };

  const handleAddNote = (customerId: string) => {
    setIsCreatingNote(true);
  };

  const handleRetry = () => {
    refetchCustomer();
    refetchNotes();
    refetchSummary();
  };

  const handleExportCustomerData = async () => {
    if (!customer || !notesData) return;

    try {
      const exportData = {
        customer: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          company: customer.company,
          supportTier: customer.supportTier,
          status: customer.status,
          createdAt: customer.createdAt,
          lastContact: customer.lastContact,
        },
        supportSummary,
        notes: notesData.notes.map(note => ({
          id: note.id,
          content: note.content,
          category: note.category,
          isInternal: note.isInternal,
          isResolved: note.isResolved,
          requiresFollowUp: note.requiresFollowUp,
          followUpDate: note.followUpDate,
          createdAt: note.createdAt,
          adminUser: note.adminUser?.name,
        })),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `customer-${customer.id}-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Customer data exported successfully');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export customer data');
    }
  };

  const isLoading = customerLoading || summaryLoading;
  const hasError = error || notesError || summaryError;

  if (hasError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/support/customers">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Customers
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Customer Profile</h1>
              <p className="text-muted-foreground">
                Failed to load customer information
              </p>
            </div>
          </div>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold">Failed to Load Customer Data</h3>
              <p className="text-muted-foreground max-w-md">
                {error?.message || notesError?.message || summaryError?.message || 'An unexpected error occurred while loading customer information.'}
              </p>
              <div className="flex items-center space-x-2 pt-4">
                <Button onClick={handleRetry}>
                  <Loader2 className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Retry
                </Button>
                <Link href="/dashboard/support/customers">
                  <Button variant="outline">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Customers
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/support/customers">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Customers
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Customer Profile</h1>
              <p className="text-muted-foreground">
                Loading customer information...
              </p>
            </div>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Loading...
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader>
                <div className="h-5 w-32 bg-muted rounded" />
                <div className="h-4 w-48 bg-muted rounded" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-4 w-full bg-muted rounded" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/support/customers">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Customers
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Customer Profile</h1>
              <p className="text-muted-foreground">
                Customer not found
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Customer not found</p>
            <Link href="/dashboard/support/customers">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Customers
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const customerNotes = notesData?.notes || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/support/customers">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Customers
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Customer Profile</h1>
            <p className="text-muted-foreground">
              Complete customer support history and management
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline"
            onClick={() => handleExportCustomerData()}
            disabled={isLoading}
          >
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="notes">Support Notes ({customerNotes.length})</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <CustomerProfile
            customer={customer}
            supportNotes={customerNotes}
            supportSummary={supportSummary}
            onStartImpersonation={handleStartImpersonation}
            onAddNote={handleAddNote}
          />
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle>Support Notes</CardTitle>
              <CardDescription>
                All support interactions and notes for {customer.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SupportNotesTable notes={customerNotes} isLoading={notesLoading} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <SupportTimeline notes={customerNotes} customerId={customerId} isLoading={notesLoading} />
        </TabsContent>

        <TabsContent value="settings">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
                <CardDescription>
                  Basic customer details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg">{customer.name}</div>
                    {customer.company && (
                      <div className="text-sm text-muted-foreground">{customer.company}</div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{customer.email}</span>
                  </div>
                  {customer.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{customer.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Customer since {new Date(customer.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Support Settings</CardTitle>
                <CardDescription>
                  Manage customer-specific support preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Support Tier</h4>
                    <p className="text-sm text-muted-foreground">Current support level</p>
                  </div>
                  <Badge variant="secondary">{customer.supportTier}</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Priority Support</h4>
                    <p className="text-sm text-muted-foreground">Enhanced response times</p>
                  </div>
                  <Button variant="outline" size="sm">Enable</Button>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Communication</h4>
                    <p className="text-sm text-muted-foreground">Preferred contact methods</p>
                  </div>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Security Level</h4>
                    <p className="text-sm text-muted-foreground">Account security settings</p>
                  </div>
                  <Badge variant="outline" className="flex items-center space-x-1">
                    <Shield className="w-3 h-3" />
                    <span>Standard</span>
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Note Modal */}
      <CreateNoteModal
        customerId={customerId}
        isOpen={isCreatingNote}
        onClose={() => setIsCreatingNote(false)}
        onSuccess={() => {
          refetchNotes();
          refetchSummary();
        }}
      />
    </div>
  );
}