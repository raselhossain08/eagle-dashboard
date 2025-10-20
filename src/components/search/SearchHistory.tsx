'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSearchStore } from '@/lib/stores/search-store';
import { Clock, Trash2, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function SearchHistory() {
  const { searchHistory, clearHistory, setQuery, addToHistory } = useSearchStore();

  const handleSearchAgain = (query: string, resultCount: number) => {
    setQuery(query);
    addToHistory(query, resultCount);
  };

  if (searchHistory.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground">
            No search history yet. Your recent searches will appear here.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Search History</CardTitle>
          <CardDescription>
            Your recent search queries
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={clearHistory}>
          <Trash2 className="h-4 w-4 mr-2" />
          Clear All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {searchHistory.map((history) => (
            <div
              key={history.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center space-x-3 flex-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium truncate">{history.query}</span>
                    <Badge variant="secondary">{history.resultCount} results</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(history.timestamp, { addSuffix: true })}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSearchAgain(history.query, history.resultCount)}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}