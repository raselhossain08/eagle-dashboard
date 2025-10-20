import { create } from 'zustand';
import { SearchFilters, SearchResult, SortOption } from '@/types/search';

interface SearchState {
  query: string;
  currentQuery: string;
  filters: SearchFilters;
  activeFilters: SearchFilters;
  results: SearchResult[];
  isLoading: boolean;
  searchHistory: string[];
  sortBy: SortOption;
  resultsPerPage: number;
  currentPage: number;
  isAdvancedSearch: boolean;
  showSuggestions: boolean;
  setQuery: (query: string) => void;
  setCurrentQuery: (query: string) => void;
  setFilters: (filters: SearchFilters) => void;
  setActiveFilters: (filters: SearchFilters) => void;
  setResults: (results: SearchResult[]) => void;
  setLoading: (loading: boolean) => void;
  addToHistory: (query: string) => void;
  clearHistory: () => void;
  setSortBy: (sortBy: SortOption) => void;
  setResultsPerPage: (resultsPerPage: number) => void;
  setCurrentPage: (currentPage: number) => void;
  toggleAdvancedSearch: () => void;
  setShowSuggestions: (show: boolean) => void;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  query: '',
  currentQuery: '',
  filters: {
    type: [],
    dateRange: undefined,
    status: [],
  },
  activeFilters: {
    type: [],
    dateRange: undefined,
    status: [],
  },
  results: [],
  isLoading: false,
  searchHistory: [],
  sortBy: 'relevance',
  resultsPerPage: 20,
  currentPage: 1,
  isAdvancedSearch: false,
  showSuggestions: false,
  
  setQuery: (query) => set({ query }),
  
  setCurrentQuery: (currentQuery) => set({ currentQuery }),
  
  setFilters: (filters) => set({ filters }),
  
  setActiveFilters: (activeFilters) => set({ activeFilters }),
  
  setResults: (results) => set({ results }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setSortBy: (sortBy) => set({ sortBy }),
  
  setResultsPerPage: (resultsPerPage) => set({ resultsPerPage }),
  
  setCurrentPage: (currentPage) => set({ currentPage }),
  
  toggleAdvancedSearch: () => set((state) => ({ isAdvancedSearch: !state.isAdvancedSearch })),
  
  setShowSuggestions: (showSuggestions) => set({ showSuggestions }),
  
  addToHistory: (query) => {
    const { searchHistory } = get();
    if (query && !searchHistory.includes(query)) {
      set({ 
        searchHistory: [query, ...searchHistory].slice(0, 10) 
      });
    }
  },
  
  clearHistory: () => set({ searchHistory: [] }),
}));