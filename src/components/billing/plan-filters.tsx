// components/billing/plan-filters.tsx
'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, Package, Eye, EyeOff } from 'lucide-react';

interface PlanFilters {
  search: string;
  isActive?: boolean;
  page: number;
  pageSize: number;
}

interface PlanFiltersProps {
  filters: PlanFilters;
  onFiltersChange: (filters: Partial<PlanFilters>) => void;
  totalCount?: number;
  filteredCount?: number;
}

export function PlanFilters({ 
  filters, 
  onFiltersChange, 
  totalCount = 0, 
  filteredCount = 0 
}: PlanFiltersProps) {
  const [searchInput, setSearchInput] = React.useState(filters.search || '');

  const handleSearch = () => {
    onFiltersChange({ search: searchInput.trim(), page: 1 });
  };

  const handleClearSearch = () => {
    setSearchInput('');
    onFiltersChange({ search: '', page: 1 });
  };

  const handleStatusFilter = (value: string) => {
    if (value === 'all') {
      onFiltersChange({ isActive: undefined, page: 1 });
    } else {
      onFiltersChange({ isActive: value === 'active', page: 1 });
    }
  };

  const clearAllFilters = () => {
    setSearchInput('');
    onFiltersChange({
      search: '',
      isActive: undefined,
      page: 1,
    });
  };

  const hasActiveFilters = filters.search || filters.isActive !== undefined;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Plan Filters
            </CardTitle>
            <CardDescription>
              Search and filter your billing plans
            </CardDescription>
          </div>
          
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearAllFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search plans by name or description..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch}>
            Search
          </Button>
          {filters.search && (
            <Button variant="outline" onClick={handleClearSearch}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Status:</span>
            <Select
              value={
                filters.isActive === undefined ? 'all' :
                filters.isActive ? 'active' : 'inactive'
              }
              onValueChange={handleStatusFilter}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <span className="text-sm font-medium text-muted-foreground">Active filters:</span>
            
            {filters.search && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Search className="h-3 w-3" />
                Search: "{filters.search}"
                <button
                  onClick={handleClearSearch}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            
            {filters.isActive !== undefined && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {filters.isActive ? (
                  <Eye className="h-3 w-3" />
                ) : (
                  <EyeOff className="h-3 w-3" />
                )}
                Status: {filters.isActive ? 'Active' : 'Inactive'}
                <button
                  onClick={() => onFiltersChange({ isActive: undefined, page: 1 })}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}

        {/* Results Summary */}
        <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span>
              {hasActiveFilters ? (
                <>
                  Showing {filteredCount} of {totalCount} plans
                  {filteredCount !== totalCount && (
                    <span className="ml-1 text-orange-600">
                      (filtered)
                    </span>
                  )}
                </>
              ) : (
                `${totalCount} total plans`
              )}
            </span>
          </div>
          
          <div>
            Page {filters.page}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}