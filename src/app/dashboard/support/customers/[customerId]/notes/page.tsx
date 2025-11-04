'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Loader2, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { SupportNotesTable } from '@/components/SupportNotesTable';
import { useSupportNotes } from '@/hooks/useSupport';
import { useCustomer } from '@/hooks/useCustomers';
import { useSupportStore } from '@/stores/support-store';
import { CreateNoteModal } from '@/components/CreateNoteModal';

export default function CustomerNotesPage() {
  const params = useParams();
  const customerId = params.customerId as string;
  
  const { data: customer, isLoading: customerLoading, error, refetch: refetchCustomer } = useCustomer(customerId);
  const { data: notesData, isLoading, error: notesError, refetch: refetchNotes } = useSupportNotes(customerId);
  const { isCreatingNote, setIsCreatingNote } = useSupportStore((state) => ({
    isCreatingNote: state.isCreatingNote,
    setIsCreatingNote: state.setIsCreatingNote,
  }));

  const handleRetry = () => {
    refetchCustomer();
    refetchNotes();
  };

  const hasError = error || notesError;

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
              <h1 className="text-3xl font-bold tracking-tight">Support Notes</h1>
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
              <h3 className="text-lg font-semibold">Failed to Load Support Notes</h3>
              <p className="text-muted-foreground max-w-md">
                {error?.message || notesError?.message || 'An unexpected error occurred while loading support notes.'}
              </p>
              <div className="flex items-center space-x-2 pt-4">
                <Button onClick={handleRetry}>
                  <Loader2 className={`w-4 h-4 mr-2 ${customerLoading || isLoading ? 'animate-spin' : ''}`} />
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

  if (customerLoading) {
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
              <h1 className="text-3xl font-bold tracking-tight">Support Notes</h1>
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

        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 w-48 bg-muted rounded" />
            <div className="h-4 w-72 bg-muted rounded" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <div className="h-4 w-full bg-muted rounded" />
                  <div className="h-4 w-3/4 bg-muted rounded" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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
              <h1 className="text-3xl font-bold tracking-tight">Support Notes</h1>
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href={`/dashboard/support/customers/${customerId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Profile
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Support Notes</h1>
            <p className="text-muted-foreground">
              All support interactions for {customer.name}
            </p>
          </div>
        </div>
        <Button onClick={() => setIsCreatingNote(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Note
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Support History</CardTitle>
          <CardDescription>
            Complete record of all support notes and interactions with {customer.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SupportNotesTable 
            notes={notesData?.notes || []} 
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Create Note Modal */}
      <CreateNoteModal
        customerId={customerId}
        isOpen={isCreatingNote}
        onClose={() => setIsCreatingNote(false)}
        onSuccess={() => refetchNotes()}
      />
    </div>
  );
}