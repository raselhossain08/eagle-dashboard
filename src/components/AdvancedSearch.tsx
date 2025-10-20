// components/AdvancedSearch.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, Calendar } from 'lucide-react';
import { SupportFilters } from '@/types/support';

interface AdvancedSearchProps {
  filters: SupportFilters;
  onFiltersChange: (filters: SupportFilters) => void;
  onSearch: (query: string) => void;
}

export function AdvancedSearch({ filters, onFiltersChange, onSearch }: AdvancedSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearch = () => {
    onSearch(searchQuery);
  };

  const clearFilters = () => {
    onFiltersChange({});
    setSearchQuery('');
  };

  const activeFilterCount = Object.keys(filters).filter(key => 
    filters[key as keyof SupportFilters] !== undefined && 
    filters[key as keyof SupportFilters] !== ''
  ).length;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Basic Search */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search support notes, customers, or content..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch}>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Advanced Filters */}
          {showAdvanced && (
            <div className="p-4 border rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Advanced Filters</h3>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-1" />
                  Clear All
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={filters.category || ''}
                    onValueChange={(value) => onFiltersChange({ ...filters, category: value || undefined })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="billing">Billing</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="account">Account</SelectItem>
                      <SelectItem value="fraud">Fraud</SelectItem>
                      <SelectItem value="high_priority">High Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={filters.status || 'all'}
                    onValueChange={(value) => onFiltersChange({ ...filters, status: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="followUp">Follow-up Required</Label>
                  <Select
                    value={filters.requiresFollowUp?.toString() || ''}
                    onValueChange={(value) => onFiltersChange({ 
                      ...filters, 
                      requiresFollowUp: value === 'true' ? true : value === 'false' ? false : undefined 
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any</SelectItem>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Date Range Filter */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dateFrom">From Date</Label>
                  <Input
                    type="date"
                    id="dateFrom"
                    value={filters.dateRange?.from || ''}
                    onChange={(e) => onFiltersChange({
                      ...filters,
                      dateRange: {
                        from: e.target.value,
                        to: filters.dateRange?.to || ''
                      }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateTo">To Date</Label>
                  <Input
                    type="date"
                    id="dateTo"
                    value={filters.dateRange?.to || ''}
                    onChange={(e) => onFiltersChange({
                      ...filters,
                      dateRange: {
                        from: filters.dateRange?.from || '',
                        to: e.target.value
                      }
                    })}
                  />
                </div>
              </div>

              {/* Active Filters Display */}
              {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {filters.category && filters.category !== 'all' && (
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      <span>Category: {filters.category}</span>
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => onFiltersChange({ ...filters, category: undefined })}
                      />
                    </Badge>
                  )}
                  {filters.status && filters.status !== 'all' && (
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      <span>Status: {filters.status}</span>
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => onFiltersChange({ ...filters, status: undefined })}
                      />
                    </Badge>
                  )}
                  {filters.requiresFollowUp !== undefined && (
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      <span>Follow-up: {filters.requiresFollowUp ? 'Yes' : 'No'}</span>
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => onFiltersChange({ ...filters, requiresFollowUp: undefined })}
                      />
                    </Badge>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}