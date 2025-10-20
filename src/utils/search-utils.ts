import { SearchResult, SearchResultType } from '@/types/search';

export const formatSearchResults = (results: SearchResult[]): SearchResult[] => {
  return results.map(result => ({
    ...result,
    score: Math.round(result.score * 100) / 100,
    highlight: result.highlight || []
  }));
};

export const filterResultsByType = (results: SearchResult[], types: SearchResultType[]): SearchResult[] => {
  if (!types.length) return results;
  return results.filter(result => types.includes(result.type));
};

export const sortResults = (results: SearchResult[], sortBy: string): SearchResult[] => {
  switch (sortBy) {
    case 'date-desc':
      return [...results].sort((a, b) => 
        new Date(b.metadata?.date || 0).getTime() - new Date(a.metadata?.date || 0).getTime()
      );
    case 'date-asc':
      return [...results].sort((a, b) => 
        new Date(a.metadata?.date || 0).getTime() - new Date(b.metadata?.date || 0).getTime()
      );
    case 'name':
      return [...results].sort((a, b) => a.title.localeCompare(b.title));
    case 'relevance':
    default:
      return [...results].sort((a, b) => b.score - a.score);
  }
};