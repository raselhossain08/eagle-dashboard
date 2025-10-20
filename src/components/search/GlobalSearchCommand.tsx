'use client';

import { Command } from 'cmdk';
import { Dialog } from '@/components/ui/dialog';
import { useState, useEffect } from 'react';
import { useSearchStore } from '@/store/search-store';
import { Search, User, FileText, Calendar, Receipt } from 'lucide-react';

export function GlobalSearchCommand() {
  const [open, setOpen] = useState(false);
  const { setQuery, searchHistory } = useSearchStore();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = (query: string) => {
    setQuery(query);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Command className="rounded-lg border shadow-md">
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Command.Input 
            placeholder="Type a command or search..." 
            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden">
          <Command.Empty>No results found.</Command.Empty>

          <Command.Group heading="Recent Searches">
            {searchHistory.slice(0, 5).map((history: string, index: number) => (
              <Command.Item
                key={index}
                onSelect={() => handleSelect(history)}
                className="flex items-center space-x-2"
              >
                <Search className="h-4 w-4" />
                <span>{history}</span>
              </Command.Item>
            ))}
          </Command.Group>

          <Command.Group heading="Quick Search">
            <Command.Item onSelect={() => handleSelect('type:user status:active')}>
              <User className="h-4 w-4" />
              <span>Active Users</span>
            </Command.Item>
            <Command.Item onSelect={() => handleSelect('type:contract')}>
              <FileText className="h-4 w-4" />
              <span>All Contracts</span>
            </Command.Item>
            <Command.Item onSelect={() => handleSelect('type:subscription')}>
              <Calendar className="h-4 w-4" />
              <span>Subscriptions</span>
            </Command.Item>
            <Command.Item onSelect={() => handleSelect('type:invoice')}>
              <Receipt className="h-4 w-4" />
              <span>Invoices</span>
            </Command.Item>
          </Command.Group>
        </Command.List>
      </Command>
    </Dialog>
  );
}