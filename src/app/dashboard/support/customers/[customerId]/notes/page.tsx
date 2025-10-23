'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { SupportNotesTable } from '@/components/SupportNotesTable';
import { useSupportNotes } from '@/hooks/useSupport';
import { useCustomer } from '@/hooks/useCustomers';
import { useSupportStore } from '@/stores/support-store';

export default function CustomerNotesPage() {
  const params = useParams();
  const customerId = params.customerId as string;
  
  const { data: customer, isLoading: customerLoading, error } = useCustomer(customerId);
  const { data: notesData, isLoading } = useSupportNotes(customerId);
  const setIsCreatingNote = useSupportStore((state) => state.setIsCreatingNote);

  if (error) {
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
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-destructive mb-4">Customer not found or failed to load</p>
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
    </div>
  );
}