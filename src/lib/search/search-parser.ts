import { SearchQuery } from '@/types/search';

export class SearchParser {
  static parseQuery(rawQuery: string): Partial<SearchQuery> {
    const query: Partial<SearchQuery> = {
      query: rawQuery,
      filters: {}
    };

    // Parse advanced search syntax
    const patterns = {
      type: /type:(\w+)/g,
      status: /status:(\w+)/g,
      role: /role:(\w+)/g,
      date: /date:([\w-]+)/g
    };

    let cleanedQuery = rawQuery;

    // Extract filters from query string
    for (const [key, pattern] of Object.entries(patterns)) {
      const matches = [...rawQuery.matchAll(pattern)];
      if (matches.length > 0) {
        const values = matches.map(match => match[1]);
        query.filters = {
          ...query.filters,
          [key]: values
        };
        // Remove filter syntax from main query
        cleanedQuery = cleanedQuery.replace(pattern, '').trim();
      }
    }

    // Update cleaned query
    query.query = cleanedQuery;

    return query;
  }

  static buildQueryString(params: Partial<SearchQuery>): string {
    let queryString = params.query || '';
    
    // Add filters to query string
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, values]) => {
        if (Array.isArray(values)) {
          values.forEach(value => {
            queryString += ` ${key}:${value}`;
          });
        }
      });
    }

    return queryString.trim();
  }

  static extractSearchTerms(query: string): string[] {
    return query
      .split(/\s+/)
      .filter(term => term.length > 2 && !term.includes(':'))
      .map(term => term.toLowerCase());
  }
}