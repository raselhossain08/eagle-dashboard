import { SearchResult, SearchQuery, SearchSuggestion, SearchAnalytics } from '@/types/search';

class SearchService {
  private baseUrl = '/api/search';

  async searchUsers(params: {
    query: string;
    filters?: any;
    limit?: number;
    offset?: number;
  }): Promise<{ results: SearchResult[]; total: number }> {
    const response = await fetch(`${this.baseUrl}/users?${new URLSearchParams({
      query: params.query,
      ...params.filters,
      limit: params.limit?.toString() || '20',
      offset: params.offset?.toString() || '0'
    })}`);

    if (!response.ok) {
      throw new Error('Failed to search users');
    }

    return response.json();
  }

  async globalSearch(params: {
    query: string;
    filters?: any;
    limit?: number;
    offset?: number;
  }): Promise<{ results: SearchResult[]; total: number }> {
    const response = await fetch(`${this.baseUrl}/global?${new URLSearchParams({
      query: params.query,
      ...params.filters,
      limit: params.limit?.toString() || '20',
      offset: params.offset?.toString() || '0'
    })}`);

    if (!response.ok) {
      throw new Error('Failed to perform global search');
    }

    return response.json();
  }

  async getSearchSuggestions(query: string): Promise<SearchSuggestion[]> {
    if (!query.trim()) return [];

    const response = await fetch(`${this.baseUrl}/suggestions?query=${encodeURIComponent(query)}`);

    if (!response.ok) {
      throw new Error('Failed to get search suggestions');
    }

    return response.json();
  }

  async getSearchAnalytics(): Promise<SearchAnalytics> {
    const response = await fetch(`${this.baseUrl}/analytics`);

    if (!response.ok) {
      throw new Error('Failed to get search analytics');
    }

    return response.json();
  }
}

export const searchService = new SearchService();