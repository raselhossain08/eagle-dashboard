'use client';

import { useAuditStore } from '@/store/audit-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/date-range-picker';
import { Search, FilterX } from 'lucide-react';
import { AuditFilters as AuditFiltersType } from '@/types/audit';

// Mock data - replace with actual API calls
const adminUsers = [
  { id: '1', email: 'admin@company.com', role: 'Super Admin' },
  { id: '2', email: 'manager@company.com', role: 'Manager' },
  { id: '3', email: 'auditor@company.com', role: 'Auditor' },
];

const resourceTypes = ['User', 'Subscription', 'Role', 'Permission', 'System'];
const actions = ['user.create', 'user.update', 'user.delete', 'subscription.create', 'subscription.update'];

export function AuditFilters() {
  const { filters, setFilters, resetFilters } = useAuditStore();

  const handleFilterChange = (key: keyof AuditFiltersType, value: any) => {
    setFilters({ [key]: value });
  };

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
          value={filters.adminUserId || ''}
          onValueChange={(value) => handleFilterChange('adminUserId', value || undefined)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All admins" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All admins</SelectItem>
            {adminUsers.map((admin) => (
              <SelectItem key={admin.id} value={admin.id}>
                {admin.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Action */}
      <div className="space-y-2">
        <Label htmlFor="action">Action</Label>
        <Select
          value={filters.action || ''}
          onValueChange={(value) => handleFilterChange('action', value || undefined)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All actions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All actions</SelectItem>
            {actions.map((action) => (
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
          value={filters.resourceType || ''}
          onValueChange={(value) => handleFilterChange('resourceType', value || undefined)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All resources" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All resources</SelectItem>
            {resourceTypes.map((type) => (
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
          value={filters.status || ''}
          onValueChange={(value) => handleFilterChange('status', value || undefined)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All statuses</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="failure">Failure</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Date Range */}
      <div className="space-y-2">
        <Label>Date Range</Label>
        <DateRangePicker
          value={filters.dateRange}
          onChange={(range) => handleFilterChange('dateRange', range)}
        />
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