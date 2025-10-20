'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSearchStore } from '@/store/search-store';
import { SearchResultType } from '@/types/search';

export function SearchFilters() {
  const { activeFilters, setFilters } = useSearchStore();

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="type-filter">Resource Type</Label>
            <Select
              value={activeFilters.type?.[0] || ''}
              onValueChange={(value) => setFilters({ 
                ...activeFilters, 
                type: value ? [value as SearchResultType] : [] 
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Users</SelectItem>
                <SelectItem value="contract">Contracts</SelectItem>
                <SelectItem value="subscription">Subscriptions</SelectItem>
                <SelectItem value="invoice">Invoices</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Add more filter fields as needed */}
        </div>
      </CardContent>
    </Card>
  );
}