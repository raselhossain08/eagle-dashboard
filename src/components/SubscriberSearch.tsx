// components/SubscriberSearch.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  X, 
  Save,
  Clock
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface SearchFilter {
  field: string;
  operator: string;
  value: string;
}

interface SavedSearch {
  id: string;
  name: string;
  filters: SearchFilter[];
  createdAt: string;
}

export function SubscriberSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilter[]>([]);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [savedSearches] = useState<SavedSearch[]>([
    {
      id: '1',
      name: 'High Value Customers',
      filters: [
        { field: 'lifetimeValue', operator: 'greater_than', value: '1000' }
      ],
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'Recent Signups',
      filters: [
        { field: 'createdAt', operator: 'last_30_days', value: '' }
      ],
      createdAt: '2024-01-10'
    }
  ]);

  const addFilter = (filter: SearchFilter) => {
    setFilters(prev => [...prev, filter]);
  };

  const removeFilter = (index: number) => {
    setFilters(prev => prev.filter((_, i) => i !== index));
  };

  const saveSearch = () => {
    // Implement save search logic
    console.log('Saving search:', { name: 'Custom Search', filters, searchQuery });
  };

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search subscribers by name, email, company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4"
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
              {filters.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {filters.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <div className="p-2">
              <h4 className="font-semibold mb-2">Quick Filters</h4>
              <div className="space-y-1">
                <DropdownMenuItem onClick={() => addFilter({ field: 'status', operator: 'equals', value: 'active' })}>
                  Active Subscribers
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => addFilter({ field: 'kycStatus', operator: 'equals', value: 'verified' })}>
                  KYC Verified
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => addFilter({ field: 'lifetimeValue', operator: 'greater_than', value: '1000' })}>
                  High LTV (&gt;$1000)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => addFilter({ field: 'createdAt', operator: 'last_7_days', value: '' })}>
                  New This Week
                </DropdownMenuItem>
              </div>
            </div>
            
            <DropdownMenuSeparator />
            
            <div className="p-2">
              <h4 className="font-semibold mb-2">Saved Searches</h4>
              <div className="space-y-1">
                {savedSearches.map((search) => (
                  <DropdownMenuItem key={search.id} className="flex items-center justify-between">
                    <span>{search.name}</span>
                    <Clock className="h-3 w-3 text-muted-foreground" />
                  </DropdownMenuItem>
                ))}
              </div>
            </div>

            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={() => setIsAdvancedOpen(true)}>
              Advanced Search...
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Dialog open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Advanced</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Advanced Search</DialogTitle>
              <DialogDescription>
                Create complex search queries with multiple filters
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Current Filters */}
              {filters.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Active Filters</h4>
                  <div className="flex flex-wrap gap-2">
                    {filters.map((filter, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {filter.field} {filter.operator} {filter.value}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => removeFilter(index)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Add New Filter */}
              <div className="grid grid-cols-3 gap-2">
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option>Field</option>
                  <option value="status">Status</option>
                  <option value="kycStatus">KYC Status</option>
                  <option value="lifetimeValue">Lifetime Value</option>
                  <option value="createdAt">Created Date</option>
                </select>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option>Operator</option>
                  <option value="equals">Equals</option>
                  <option value="contains">Contains</option>
                  <option value="greater_than">Greater Than</option>
                  <option value="less_than">Less Than</option>
                </select>
                <Input placeholder="Value" />
              </div>
              <Button variant="outline" className="w-full">
                Add Filter
              </Button>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAdvancedOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveSearch}>
                <Save className="h-4 w-4 mr-2" />
                Save Search
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Filters Display */}
      {filters.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {filter.field} {filter.operator} {filter.value}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeFilter(index)}
                />
              </Badge>
            ))}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setFilters([])}
            className="text-red-600 hover:text-red-700"
          >
            Clear All
          </Button>
        </div>
      )}
    </div>
  );
}