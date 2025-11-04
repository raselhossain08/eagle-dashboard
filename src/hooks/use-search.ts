import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { searchService, SearchResult, SearchSuggestion, SearchAnalytics } from '@/lib/api/search';

// Search queries
export function useSearchUsers(params: {
  query: string;
  role?: string;
  status?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ['search', 'users', params],
    queryFn: () => searchService.searchUsers(params),
    enabled: params.query.length >= 2, // Only search if query is at least 2 characters
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useGlobalSearch(params: {
  query: string;
  type?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ['search', 'global', params],
    queryFn: () => searchService.globalSearch(params),
    enabled: params.query.length >= 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useSearchSuggestions(query: string, category?: string) {
  return useQuery({
    queryKey: ['search', 'suggestions', query, category],
    queryFn: () => searchService.getSearchSuggestions(query, category),
    enabled: query.length >= 1,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useSearchAnalytics(enabled: boolean = false) {
  return useQuery({
    queryKey: ['search', 'analytics'],
    queryFn: () => searchService.getSearchAnalytics(),
    enabled: enabled, // Only fetch when explicitly enabled
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
}

export function useSearchFilters(enabled: boolean = false) {
  return useQuery({
    queryKey: ['search', 'filters'],
    queryFn: () => searchService.getSearchFilters(),
    enabled: enabled, // Only fetch when explicitly enabled
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

// Advanced search hook with debouncing and state management
export function useAdvancedSearch() {
  const [searchState, setSearchState] = useState({
    query: '',
    type: '',
    filters: {} as Record<string, any>,
    results: [] as SearchResult[],
    isSearching: false,
    hasSearched: false,
  });

  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search query
  const updateQuery = useCallback((query: string) => {
    setSearchState(prev => ({ ...prev, query }));
    
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // Global search query
  const searchQuery = useGlobalSearch({
    query: debouncedQuery,
    type: searchState.type,
    limit: 50,
  });

  // Update results when query changes
  const results = useMemo(() => {
    if (searchQuery.data?.results) {
      return searchQuery.data.results.map(result => ({
        ...result,
        formatted: searchService.formatSearchResult(result),
      }));
    }
    return [];
  }, [searchQuery.data]);

  // Search suggestions
  const suggestions = useSearchSuggestions(searchState.query);

  // Recent searches
  const recentSearches = useMemo(() => {
    return searchService.getRecentSearches();
  }, []);

  const executeSearch = useCallback(async (query: string, type?: string) => {
    if (!query.trim()) return;

    setSearchState(prev => ({
      ...prev,
      query,
      type: type || '',
      isSearching: true,
      hasSearched: true,
    }));

    // Save search term for suggestions
    searchService.saveSearchTerm(query);
    
    setDebouncedQuery(query);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchState({
      query: '',
      type: '',
      filters: {},
      results: [],
      isSearching: false,
      hasSearched: false,
    });
    setDebouncedQuery('');
  }, []);

  const clearRecentSearches = useCallback(() => {
    searchService.clearRecentSearches();
  }, []);

  return {
    // State
    query: searchState.query,
    type: searchState.type,
    filters: searchState.filters,
    results,
    isSearching: searchQuery.isLoading,
    hasSearched: searchState.hasSearched,
    
    // Data
    suggestions: suggestions.data?.suggestions || [],
    recentSearches,
    totalResults: searchQuery.data?.total || 0,
    
    // Loading states
    isLoadingSuggestions: suggestions.isLoading,
    
    // Error states
    error: searchQuery.error,
    
    // Actions
    updateQuery,
    executeSearch,
    clearSearch,
    clearRecentSearches,
    
    // Utilities
    formatResult: searchService.formatSearchResult,
    highlightTerms: (text: string) => searchService.highlightSearchTerms(text, searchState.query),
  };
}

// Search filters hook
export function useSearchFiltersState() {
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    category: '',
    dateRange: null as { start: Date; end: Date } | null,
    sortBy: 'relevance',
  });

  const updateFilter = useCallback((key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      role: '',
      status: '',
      category: '',
      dateRange: null,
      sortBy: 'relevance',
    });
  }, []);

  const hasActiveFilters = useMemo(() => {
    return filters.role || filters.status || filters.category || filters.dateRange;
  }, [filters]);

  return {
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
  };
}

// Search history hook
export function useSearchHistory() {
  const [history, setHistory] = useState<string[]>([]);

  const addToHistory = useCallback((query: string) => {
    if (!query.trim()) return;
    
    setHistory(prev => {
      const updated = [query, ...prev.filter(q => q !== query)].slice(0, 20);
      if (typeof window !== 'undefined') {
        localStorage.setItem('eagle_search_history', JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('eagle_search_history');
    }
  }, []);

  const removeFromHistory = useCallback((query: string) => {
    setHistory(prev => {
      const updated = prev.filter(q => q !== query);
      if (typeof window !== 'undefined') {
        localStorage.setItem('eagle_search_history', JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  // Load history on mount
  const loadHistory = useCallback(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('eagle_search_history');
      if (saved) {
        try {
          setHistory(JSON.parse(saved));
        } catch (error) {
          console.warn('Failed to parse search history:', error);
        }
      }
    }
  }, []);

  return {
    history,
    addToHistory,
    clearHistory,
    removeFromHistory,
    loadHistory,
  };
}