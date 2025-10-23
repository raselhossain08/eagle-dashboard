'use client';

import { useAuditStore } from '@/store/audit-store';
import { useAuditFilterOptions } from '@/hooks/use-audit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/date-range-picker';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, FilterX, Database } from 'lucide-react';
import { AuditFilters as AuditFiltersType } from '@/types/audit';
import { format } from 'date-fns';

export function AuditFilters() {
  const { filters, setFilters, resetFilters } = useAuditStore();
  const { data: filterOptions, isLoading } = useAuditFilterOptions();

  const handleFilterChange = (key: keyof AuditFiltersType, value: any) => {
    setFilters({ [key]: value });
  };

  // Loading skeleton for filters
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
      {/* Search */}
      <div className="space-y-2">
        <Label htmlFor="search">Search</Label>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            placeholder="Search logs..."
            className="pl-8"
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>
      </div>

      {/* Admin User */}
      <div className="space-y-2">
        <Label htmlFor="adminUserId">Admin User</Label>
        <Select
          value={filters.adminUserId || 'all'}
          onValueChange={(value) => handleFilterChange('adminUserId', value === 'all' ? undefined : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All admins" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All admins</SelectItem>
            {filterOptions?.adminUsers?.map((admin) => (
              <SelectItem key={admin.id} value={admin.id}>
                <div className="flex flex-col">
                  <span>{admin.email}</span>
                  <span className="text-xs text-muted-foreground">{admin.role}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Action */}
      <div className="space-y-2">
        <Label htmlFor="action">Action</Label>
        <Select
          value={filters.action || 'all'}
          onValueChange={(value) => handleFilterChange('action', value === 'all' ? undefined : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All actions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All actions</SelectItem>
            {filterOptions?.actions?.map((action) => (
              <SelectItem key={action} value={action}>
                {action}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Resource Type */}
      <div className="space-y-2">
        <Label htmlFor="resourceType">Resource Type</Label>
        <Select
          value={filters.resourceType || 'all'}
          onValueChange={(value) => handleFilterChange('resourceType', value === 'all' ? undefined : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All resources" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All resources</SelectItem>
            {filterOptions?.resourceTypes?.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={filters.status || 'all'}
          onValueChange={(value) => handleFilterChange('status', value === 'all' ? undefined : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {filterOptions?.statuses?.map((status) => (
              <SelectItem key={status} value={status}>
                <div className="flex items-center space-x-2">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      status === 'success'
                        ? 'bg-green-500'
                        : status === 'failure'
                        ? 'bg-red-500'
                        : 'bg-yellow-500'
                    }`}
                  />
                  <span className="capitalize">{status}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Date Range */}
      <div className="space-y-2 md:col-span-2">
        <Label>Date Range</Label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Input
              type="date"
              value={filters.dateRange?.from ? format(filters.dateRange.from, 'yyyy-MM-dd') : ''}
              onChange={(e) => {
                const newDate = e.target.value ? new Date(e.target.value) : undefined;
                handleFilterChange('dateRange', {
                  ...filters.dateRange,
                  from: newDate,
                });
              }}
              placeholder="From date"
            />
          </div>
          <div>
            <Input
              type="date"
              value={filters.dateRange?.to ? format(filters.dateRange.to, 'yyyy-MM-dd') : ''}
              onChange={(e) => {
                const newDate = e.target.value ? new Date(e.target.value) : undefined;
                handleFilterChange('dateRange', {
                  ...filters.dateRange,
                  to: newDate,
                });
              }}
              placeholder="To date"
            />
          </div>
        </div>
      </div>

      {/* Reset Button */}
      <div className="flex items-end">
        <Button
          variant="outline"
          onClick={resetFilters}
          className="w-full"
        >
          <FilterX className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>
    </div>
  );
}