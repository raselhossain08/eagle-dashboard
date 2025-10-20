import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { SearchResult, SearchFilters, SortOption, SearchHistory, SearchSuggestion } from '@/types/search';

interface SearchStore {
  // Current search state
  currentQuery: string;
  searchResults: SearchResult[];
  isSearching: boolean;
  totalResults: number;
  
  // Filters and sorting
  activeFilters: SearchFilters;
  sortBy: SortOption;
  resultsPerPage: number;
  currentPage: number;
  
  // UI state
  isAdvancedSearch: boolean;
  selectedResults: string[];
  searchHistory: SearchHistory[];
  
  // Search suggestions
  suggestions: SearchSuggestion[];
  showSuggestions: boolean;
  
  // Actions
  setQuery: (query: string) => void;
  setFilters: (filters: SearchFilters) => void;
  setSortBy: (sortBy: SortOption) => void;
  setSearchResults: (results: SearchResult[], total: number) => void;
  setIsSearching: (searching: boolean) => void;
  toggleAdvancedSearch: () => void;
  selectResult: (id: string) => void;
  clearSelection: () => void;
  addToHistory: (query: string, resultCount: number) => void;
  clearHistory: () => void;
  setSuggestions: (suggestions: SearchSuggestion[]) => void;
  setShowSuggestions: (show: boolean) => void;
}

export const useSearchStore = create<SearchStore>()(
  devtools((set, get) => ({
    // Initial state
    currentQuery: '',
    searchResults: [],
    isSearching: false,
    totalResults: 0,
    activeFilters: {},
    sortBy: 'relevance',
    resultsPerPage: 20,
    currentPage: 1,
    isAdvancedSearch: false,
    selectedResults: [],
    searchHistory: [],
    suggestions: [],
    showSuggestions: false,

    // Actions
    setQuery: (query: string) => set({ currentQuery: query }),
    
    setFilters: (filters: SearchFilters) => set({ activeFilters: filters }),
    
    setSortBy: (sortBy: SortOption) => set({ sortBy }),
    
    setSearchResults: (results: SearchResult[], total: number) => 
      set({ searchResults: results, totalResults: total }),
    
    setIsSearching: (searching: boolean) => set({ isSearching: searching }),
    
    toggleAdvancedSearch: () => set((state) => ({ 
      isAdvancedSearch: !state.isAdvancedSearch 
    })),
    
    selectResult: (id: string) => set((state) => ({
      selectedResults: state.selectedResults.includes(id)
        ? state.selectedResults.filter(resultId => resultId !== id)
        : [...state.selectedResults, id]
    })),
    
    clearSelection: () => set({ selectedResults: [] }),
    
    addToHistory: (query: string, resultCount: number) => set((state) => ({
      searchHistory: [
        {
          id: Date.now().toString(),
          query,
          timestamp: new Date(),
          resultCount
        },
        ...state.searchHistory.slice(0, 49) // Keep last 50
      ]
    })),
    
    clearHistory: () => set({ searchHistory: [] }),
    
    setSuggestions: (suggestions: SearchSuggestion[]) => set({ suggestions }),
    
    setShowSuggestions: (show: boolean) => set({ showSuggestions: show })
  }))
);