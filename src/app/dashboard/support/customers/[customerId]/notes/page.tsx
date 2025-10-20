'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';
import { SupportNotesTable } from '@/components/SupportNotesTable';
import { useSupportNotes } from '@/hooks/useSupport';
import { useSupportStore } from '@/stores/support-store';

const mockCustomer = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com'
};

export default function CustomerNotesPage() {
  const params = useParams();
  const customerId = params.customerId as string;
  const { data: notesData, isLoading } = useSupportNotes(customerId);
  const setIsCreatingNote = useSupportStore((state) => state.setIsCreatingNote);

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
              All support interactions for {mockCustomer.name}
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
            Complete record of all support notes and interactions with {mockCustomer.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SupportNotesTable 
            notes={notesData?.notes || []} 
            isLoading={isLoading}
            showCustomer={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}