// app/dashboard/support/tickets/page.tsx
'use client';

import { SupportNotesTable } from '@/components/SupportNotesTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Filter, Download } from 'lucide-react';
import { useSupportNotes } from '@/hooks/useSupport';
import { useSupportStore } from '@/stores/support-store';
import { useState } from 'react';

export default function SupportTicketsPage() {
  const { data: notesData, isLoading } = useSupportNotes();
  const setIsCreatingNote = useSupportStore((state) => state.setIsCreatingNote);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Support Tickets</h1>
          <p className="text-muted-foreground">
            Manage and track all customer support interactions
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setIsCreatingNote(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Ticket
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tickets..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      <SupportNotesTable 
        notes={notesData?.notes || []} 
        isLoading={isLoading}
      />
    </div>
  );
}