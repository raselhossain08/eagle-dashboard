'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useSearchStore } from '@/stores/search-store';
import { useGlobalSearch } from '@/hooks/use-search';
import { SearchResult } from '@/types/search';
import { User, FileText, Receipt, Calendar } from 'lucide-react';

const ResultIcon = ({ type }: { type: SearchResult['type'] }) => {
  switch (type) {
    case 'user':
      return <User className="h-4 w-4" />;
    case 'contract':
      return <FileText className="h-4 w-4" />;
    case 'subscription':
      return <Calendar className="h-4 w-4" />;
    case 'invoice':
      return <Receipt className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

const ResultCard = ({ result }: { result: SearchResult }) => {
  const { selectedResults, selectResult } = useSearchStore();
  const isSelected = selectedResults.includes(result.id);

  return (
    <Card 
      className={`cursor-pointer transition-colors ${
        isSelected ? 'border-primary bg-muted/50' : ''
      }`}
      onClick={() => selectResult(result.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className="mt-1">
              <ResultIcon type={result.type} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold truncate">{result.title}</h3>
                <Badge variant="outline" className="capitalize">
                  {result.type}
                </Badge>
                <Badge variant="secondary" className="ml-auto">
                  {Math.round(result.score * 100)}%
                </Badge>
              </div>
              {result.subtitle && (
                <p className="text-sm text-muted-foreground mb-1">{result.subtitle}</p>
              )}
              {result.description && (
                <p className="text-sm line-clamp-2">{result.description}</p>
              )}
              {result.highlight && result.highlight.length > 0 && (
                <div className="mt-2 space-y-1">
                  {result.highlight.slice(0, 2).map((text, index) => (
                    <p
                      key={index}
                      className="text-xs text-muted-foreground"
                      dangerouslySetInnerHTML={{ __html: text }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export function SearchResults() {
  const { currentQuery, searchResults, isSearching, totalResults } = useSearchStore();
  const { data, isLoading, error } = useGlobalSearch({
    query: currentQuery,
    limit: 50
  });

  if (!currentQuery.trim()) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground">
            Enter a search query to find users, contracts, subscriptions, and invoices
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading || isSearching) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-destructive">
            Error loading search results. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  const results = data?.results || searchResults;
  const total = data?.total || totalResults;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {total} results found for "{currentQuery}"
        </div>
      </div>

      <div className="space-y-4">
        {results.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-muted-foreground">
                No results found for "{currentQuery}". Try adjusting your search terms or filters.
              </div>
            </CardContent>
          </Card>
        ) : (
          results.map((result) => (
            <ResultCard key={result.id} result={result} />
          ))
        )}
      </div>
    </div>
  );
}