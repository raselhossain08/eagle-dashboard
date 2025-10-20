'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useSearchStore } from '@/store/search-store';
import { useSearchSuggestions } from '@/hooks/use-search';
import { SearchFilters } from './SearchFilters';
import { SearchSuggestions } from './SearchSuggestions';

export function SearchInterface() {
  const {
    currentQuery,
    setQuery,
    isAdvancedSearch,
    toggleAdvancedSearch,
    activeFilters,
    setShowSuggestions,
    showSuggestions
  } = useSearchStore();

  const { data: suggestions } = useSearchSuggestions();
  const [localQuery, setLocalQuery] = useState(currentQuery);

  useEffect(() => {
    setLocalQuery(currentQuery);
  }, [currentQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalQuery(value);
    setQuery(value);
    setShowSuggestions(value.length > 0);
  };

  const handleSuggestionSelect = (suggestion: string) => {
    setQuery(suggestion);
    setLocalQuery(suggestion);
    setShowSuggestions(false);
  };

  const clearSearch = () => {
    setQuery('');
    setLocalQuery('');
    setShowSuggestions(false);
  };

  const activeFilterCount = Object.values(activeFilters).filter(
    value => value && (Array.isArray(value) ? value.length > 0 : true)
  ).length;

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search users, contracts, subscriptions, invoices..."
            value={localQuery}
            onChange={handleInputChange}
            className="pl-10 pr-20 py-2 text-base"
            onFocus={() => setShowSuggestions(localQuery.length > 0)}
          />
          {localQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-12 h-6 w-6 p-0"
              onClick={clearSearch}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant={isAdvancedSearch ? "secondary" : "ghost"}
            size="sm"
            className="absolute right-2 h-7"
            onClick={toggleAdvancedSearch}
          >
            <Filter className="h-4 w-4 mr-1" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </div>

        {showSuggestions && suggestions && suggestions.length > 0 && (
          <SearchSuggestions
            suggestions={suggestions}
            onSelect={handleSuggestionSelect}
            onClose={() => setShowSuggestions(false)}
          />
        )}
      </div>

      {isAdvancedSearch && <SearchFilters />}
    </div>
  );
}