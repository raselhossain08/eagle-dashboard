import { SearchResult } from '@/types/search';

export class ResultProcessor {
  static processResults(
    results: SearchResult[], 
    query: string
  ): SearchResult[] {
    return results
      .map(result => this.calculateRelevance(result, query))
      .sort((a, b) => b.score - a.score)
      .map(result => this.generateSnippets(result, query));
  }

  private static calculateRelevance(result: SearchResult, query: string): SearchResult {
    let score = result.score || 0;
    const queryTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 2);

    // Boost score for title matches
    if (result.title.toLowerCase().includes(query.toLowerCase())) {
      score += 0.3;
    }

    // Boost for exact matches
    queryTerms.forEach(term => {
      if (result.title.toLowerCase() === term) {
        score += 0.2;
      }
      if (result.description?.toLowerCase().includes(term)) {
        score += 0.1;
      }
    });

    return {
      ...result,
      score: Math.min(1, score) // Normalize to 0-1 range
    };
  }

  private static generateSnippets(result: SearchResult, query: string): SearchResult {
    const snippets: string[] = [];
    const queryTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 2);

    // Generate highlight snippets from description
    if (result.description) {
      queryTerms.forEach(term => {
        const regex = new RegExp(`(${term})`, 'gi');
        const highlighted = result.description.replace(regex, '<mark>$1</mark>');
        if (highlighted !== result.description) {
          snippets.push(highlighted);
        }
      });
    }

    return {
      ...result,
      highlight: snippets.slice(0, 3) // Limit to 3 snippets
    };
  }

  static deduplicateResults(results: SearchResult[]): SearchResult[] {
    const seen = new Set();
    return results.filter(result => {
      const key = `${result.type}-${result.id}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  static categorizeResults(results: SearchResult[]): Record<string, SearchResult[]> {
    return results.reduce((acc, result) => {
      if (!acc[result.type]) {
        acc[result.type] = [];
      }
      acc[result.type].push(result);
      return acc;
    }, {} as Record<string, SearchResult[]>);
  }
}