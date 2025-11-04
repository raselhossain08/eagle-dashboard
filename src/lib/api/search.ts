import { apiClient } from './api-client';

export interface SearchResult {
  id: string;
  _index: string;
  _type: string;
  _score: number;
  email?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  title?: string;
  description?: string;
  status?: string;
  createdAt: string;
  [key: string]: any;
}

export interface SearchSuggestion {
  type: string;
  value: string;
  id: string;
  email?: string;
  company?: string;
}

export interface SearchAnalytics {
  totalSearches: number;
  uniqueSearchers: number;
  popularQueries: Array<{ query: string; count: number }>;
  searchesByCategory: Record<string, number>;
  averageResultsPerSearch: number;
  noResultsQueries: string[];
  timeRanges: {
    last24h: number;
    last7d: number;
    last30d: number;
  };
  peakSearchHours: Array<{ hour: number; count: number }>;
  resourceCounts?: {
    totalUsers: number;
    totalSubscribers: number;
    totalContracts: number;
    activeUsers: number;
  };
}

export interface SearchFilters {
  userFilters: {
    roles: string[];
    statuses: string[];
  };
  subscriberFilters: {
    statuses: string[];
  };
  contractFilters: {
    statuses: string[];
  };
  categories: string[];
  sortOptions: Array<{ label: string; value: string }>;
}

class SearchService {
  private baseUrl = '/api/search';

  async searchUsers(params: {
    query: string;
    role?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    results: SearchResult[];
    total: number;
    query: string;
    filters: any;
  }> {
    const searchParams = new URLSearchParams({
      q: params.query,
      ...(params.role && { role: params.role }),
      ...(params.status && { status: params.status }),
      ...(params.limit && { limit: params.limit.toString() }),
      ...(params.offset && { offset: params.offset.toString() })
    });

    return await apiClient.get(`${this.baseUrl}/users?${searchParams}`);
  }

  async globalSearch(params: {
    query: string;
    type?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    results: SearchResult[];
    total: number;
    query: string;
    filters: any;
    limit: number;
  }> {
    const searchParams = new URLSearchParams({
      q: params.query,
      ...(params.type && { type: params.type }),
      ...(params.limit && { limit: params.limit.toString() }),
      ...(params.offset && { offset: params.offset.toString() })
    });

    return await apiClient.get(`${this.baseUrl}/global?${searchParams}`);
  }

  async getSearchSuggestions(query: string, category?: string): Promise<{
    suggestions: SearchSuggestion[];
    query: string;
    category?: string;
  }> {
    if (!query.trim()) return { suggestions: [], query, category };

    const searchParams = new URLSearchParams({
      q: query,
      ...(category && { category })
    });

    return await apiClient.get(`${this.baseUrl}/suggestions?${searchParams}`);
  }

  async getSearchAnalytics(): Promise<SearchAnalytics> {
    return await apiClient.get(`${this.baseUrl}/analytics`);
  }

  async getSearchFilters(): Promise<SearchFilters> {
    return await apiClient.get(`${this.baseUrl}/filters`);
  }

  // Utility method to format search results for display
  formatSearchResult(result: SearchResult): {
    title: string;
    subtitle: string;
    description: string;
    type: string;
    badge?: string;
  } {
    switch (result._type) {
      case 'user':
        return {
          title: `${result.firstName || ''} ${result.lastName || ''}`.trim() || result.email || 'Unknown User',
          subtitle: result.email || '',
          description: result.company || 'No company information',
          type: 'User',
          badge: result.status || undefined,
        };
      case 'subscriber':
        return {
          title: `${result.firstName || ''} ${result.lastName || ''}`.trim() || result.email || 'Unknown Subscriber',
          subtitle: result.email || '',
          description: 'Subscriber',
          type: 'Subscriber',
          badge: result.status || undefined,
        };
      case 'contract':
        return {
          title: result.title || 'Untitled Contract',
          subtitle: result.clientName || 'Unknown Client',
          description: result.description || 'No description available',
          type: 'Contract',
          badge: result.status || undefined,
        };
      default:
        return {
          title: result.title || result.name || 'Unknown Item',
          subtitle: result.subtitle || '',
          description: result.description || 'No description available',
          type: result._type || 'Unknown',
        };
    }
  }

  // Utility method to highlight search terms in text
  highlightSearchTerms(text: string, searchTerm: string): string {
    if (!searchTerm || !text) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  // Utility method to get search suggestions based on recent searches
  getRecentSearches(): string[] {
    if (typeof window === 'undefined') return [];
    
    const recent = localStorage.getItem('eagle_recent_searches');
    return recent ? JSON.parse(recent) : [];
  }

  // Utility method to save search terms for suggestions
  saveSearchTerm(term: string): void {
    if (typeof window === 'undefined' || !term.trim()) return;
    
    const recent = this.getRecentSearches();
    const updated = [term, ...recent.filter(t => t !== term)].slice(0, 10);
    localStorage.setItem('eagle_recent_searches', JSON.stringify(updated));
  }

  // Utility method to clear recent searches
  clearRecentSearches(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('eagle_recent_searches');
  }
}

export const searchService = new SearchService();