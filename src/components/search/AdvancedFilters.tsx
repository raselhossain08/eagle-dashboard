'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { useSearchStore } from '@/store/search-store';
import { SearchResultType } from '@/types/search';

export function AdvancedFilters() {
  const { activeFilters, setFilters } = useSearchStore();

  const addTypeFilter = (type: SearchResultType) => {
    const currentTypes = activeFilters.type || [];
    if (!currentTypes.includes(type)) {
      setFilters({
        ...activeFilters,
        type: [...currentTypes, type]
      });
    }
  };

  const removeTypeFilter = (type: SearchResultType) => {
    const currentTypes = activeFilters.type || [];
    setFilters({
      ...activeFilters,
      type: currentTypes.filter((t: string) => t !== type)
    });
  };

  const clearAllFilters = () => {
    setFilters({});
  };

  const hasActiveFilters = Object.values(activeFilters).some(
    value => value && (Array.isArray(value) ? value.length > 0 : true)
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Advanced Filters</CardTitle>
            <CardDescription>
              Refine your search with advanced filters
            </CardDescription>
          </div>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearAllFilters}>
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Resource Type Filter */}
        <div className="space-y-3">
          <Label>Resource Types</Label>
          <div className="flex flex-wrap gap-2">
            {(['user', 'contract', 'subscription', 'invoice'] as SearchResultType[]).map((type) => {
              const isSelected = activeFilters.type?.includes(type);
              return (
                <Badge
                  key={type}
                  variant={isSelected ? "default" : "outline"}
                  className="cursor-pointer capitalize"
                  onClick={() => isSelected ? removeTypeFilter(type) : addTypeFilter(type)}
                >
                  {type}
                  {isSelected && <X className="h-3 w-3 ml-1" />}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Status Filter */}
        <div className="space-y-3">
          <Label htmlFor="status-filter">Status</Label>
          <Select
            value={activeFilters.status?.[0] || ''}
            onValueChange={(value) => setFilters({ 
              ...activeFilters, 
              status: value ? [value] : [] 
            })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Range Filter */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <Label htmlFor="start-date">From Date</Label>
            <Input
              id="start-date"
              type="date"
              onChange={(e) => setFilters({
                ...activeFilters,
                dateRange: {
                  start: new Date(e.target.value),
                  end: activeFilters.dateRange?.end || new Date()
                }
              })}
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="end-date">To Date</Label>
            <Input
              id="end-date"
              type="date"
              onChange={(e) => setFilters({
                ...activeFilters,
                dateRange: {
                  start: activeFilters.dateRange?.start || new Date('2020-01-01'),
                  end: new Date(e.target.value)
                }
              })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}