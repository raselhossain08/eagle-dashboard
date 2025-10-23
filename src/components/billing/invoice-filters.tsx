// components/billing/invoice-filters.tsx
'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, Calendar } from 'lucide-react';
import { InvoiceStatus } from '@/types/billing';

interface InvoiceFilters {
  status?: InvoiceStatus;
  search?: string;
  dateRange?: { from: Date; to: Date };
  page?: number;
  pageSize?: number;
}

interface InvoiceFiltersProps {
  filters: InvoiceFilters;
  onFiltersChange: (filters: InvoiceFilters) => void;
  totalCount?: number;
  filteredCount?: number;
}

export function InvoiceFilters({
  filters,
  onFiltersChange,
  totalCount = 0,
  filteredCount = 0
}: InvoiceFiltersProps) {
  const handleStatusChange = (status: string) => {
    onFiltersChange({
      ...filters,
      status: status === 'all' ? undefined : (status as InvoiceStatus)
    });
  };

  const handleSearchChange = (search: string) => {
    onFiltersChange({
      ...filters,
      search: search || undefined
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = filters.status || filters.search || filters.dateRange;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filter Invoices
            </CardTitle>
            <CardDescription>
              Filter and search through invoices
              {totalCount > 0 && (
                <span className="ml-2">
                  • Showing {filteredCount} of {totalCount} invoices
                </span>
              )}
            </CardDescription>
          </div>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground"
            >
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Invoice number, customer..."
                className="pl-8"
                value={filters.search || ''}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select 
              value={filters.status || 'all'} 
              onValueChange={handleStatusChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">
                  <div className="flex items-center">
                    <Badge variant="outline" className="mr-2">Draft</Badge>
                    Draft Invoices
                  </div>
                </SelectItem>
                <SelectItem value="open">
                  <div className="flex items-center">
                    <Badge variant="default" className="mr-2">Open</Badge>
                    Open Invoices
                  </div>
                </SelectItem>
                <SelectItem value="paid">
                  <div className="flex items-center">
                    <Badge variant="default" className="mr-2 bg-green-500 hover:bg-green-600 text-white">Paid</Badge>
                    Paid Invoices
                  </div>
                </SelectItem>
                <SelectItem value="void">
                  <div className="flex items-center">
                    <Badge variant="secondary" className="mr-2">Void</Badge>
                    Void Invoices
                  </div>
                </SelectItem>
                <SelectItem value="uncollectible">
                  <div className="flex items-center">
                    <Badge variant="destructive" className="mr-2">Uncollectible</Badge>
                    Uncollectible Invoices
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range - Placeholder for future implementation */}
          <div className="space-y-2">
            <Label>Date Range</Label>
            <Button variant="outline" className="w-full justify-start text-left" disabled>
              <Calendar className="h-4 w-4 mr-2" />
              <span className="text-muted-foreground">Coming soon</span>
            </Button>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium">Active filters:</span>
              
              {filters.status && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Status: {filters.status}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleStatusChange('all')}
                  />
                </Badge>
              )}
              
              {filters.search && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: "{filters.search}"
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleSearchChange('')}
                  />
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}