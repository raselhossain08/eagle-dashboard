import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { searchService } from '@/lib/api/search';
import { useSearchStore } from '@/store/search-store';
import { useDebounce } from '@/hooks/use-debounce';

export const useSearchUsers = () => {
  const { currentQuery, activeFilters, sortBy, resultsPerPage, currentPage } = useSearchStore();
  const debouncedQuery = useDebounce(currentQuery, 300);

  return useQuery({
    queryKey: ['search', 'users', debouncedQuery, activeFilters, sortBy, currentPage],
    queryFn: () => searchService.searchUsers({
      query: debouncedQuery,
      filters: activeFilters,
      limit: resultsPerPage,
      offset: (currentPage - 1) * resultsPerPage
    }),
    enabled: !!debouncedQuery.trim(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useGlobalSearch = () => {
  const { currentQuery, activeFilters, sortBy, resultsPerPage, currentPage } = useSearchStore();
  const debouncedQuery = useDebounce(currentQuery, 300);

  return useQuery({
    queryKey: ['search', 'global', debouncedQuery, activeFilters, sortBy, currentPage],
    queryFn: () => searchService.globalSearch({
      query: debouncedQuery,
      filters: activeFilters,
      limit: resultsPerPage,
      offset: (currentPage - 1) * resultsPerPage
    }),
    enabled: !!debouncedQuery.trim(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useSearchSuggestions = () => {
  const { currentQuery } = useSearchStore();
  const debouncedQuery = useDebounce(currentQuery, 200);

  return useQuery({
    queryKey: ['search', 'suggestions', debouncedQuery],
    queryFn: () => searchService.getSearchSuggestions(debouncedQuery),
    enabled: debouncedQuery.length > 2,
    staleTime: 2 * 60 * 1000,
  });
};

export const useSearchAnalytics = () => {
  return useQuery({
    queryKey: ['search', 'analytics'],
    queryFn: () => searchService.getSearchAnalytics(),
    staleTime: 10 * 60 * 1000,
  });
};