'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Filter, Download } from 'lucide-react';
import Link from 'next/link';
import { SupportTimeline } from '@/components/SupportTimeline';
import { useSupportNotes } from '@/hooks/useSupport';

const mockCustomer = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com'
};

export default function CustomerTimelinePage() {
  const params = useParams();
  const customerId = params.customerId as string;
  const { data: notesData, isLoading } = useSupportNotes(customerId);

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
            <h1 className="text-3xl font-bold tracking-tight">Support Timeline</h1>
            <p className="text-muted-foreground">
              Complete history of interactions with {mockCustomer.name}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <SupportTimeline 
        notes={notesData?.notes || []} 
        customerId={customerId}
        showFilters={true}
      />
    </div>
  );
}