export type SearchResultType = 'user' | 'contract' | 'subscription' | 'invoice';

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle: string;
  description: string;
  highlight: string[];
  score: number;
  metadata: Record<string, any>;
}

export interface SearchQuery {
  query: string;
  filters: SearchFilters;
  sortBy: SortOption;
  limit: number;
  offset: number;
}

export interface SearchFilters {
  role?: string[];
  status?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  type?: SearchResultType[];
}

export type SortOption = 'relevance' | 'date-desc' | 'date-asc' | 'name';

export interface SearchHistory {
  id: string;
  query: string;
  timestamp: Date;
  resultCount: number;
}

export interface SavedSearch {
  id: string;
  name: string;
  query: SearchQuery;
  createdAt: Date;
  isDefault: boolean;
}

export interface PopularSearch {
  query: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
}

export interface SearchAnalytics {
  totalSearches: number;
  successfulSearches: number;
  popularQueries: PopularSearch[];
  averageResponseTime: number;
  conversionRate: number;
}

export interface SearchSuggestion {
  text: string;
  type: 'query' | 'user' | 'resource';
  score: number;
  metadata?: Record<string, any>;
}