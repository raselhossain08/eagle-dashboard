'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSearchStore } from '@/store/search-store';
import { Search, User, FileText, Calendar, Receipt, Clock } from 'lucide-react';

const quickSearches = [
  { query: 'status:active', label: 'Active Users', icon: User, type: 'user' },
  { query: 'type:contract status:pending', label: 'Pending Contracts', icon: FileText, type: 'contract' },
  { query: 'type:subscription', label: 'All Subscriptions', icon: Calendar, type: 'subscription' },
  { query: 'type:invoice status:unpaid', label: 'Unpaid Invoices', icon: Receipt, type: 'invoice' },
];

export function QuickSearch() {
  const { setQuery, addToHistory, searchHistory } = useSearchStore();

  const handleQuickSearch = (query: string, label: string) => {
    setQuery(query);
    addToHistory(query);
  };

  const recentSearches = searchHistory.slice(0, 3);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Quick Searches */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Searches</CardTitle>
          <CardDescription>
            Frequently used search queries
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {quickSearches.map((search, index) => (
            <Button
              key={index}
              variant="outline"
              className="w-full justify-start h-auto py-3"
              onClick={() => handleQuickSearch(search.query, search.label)}
            >
              <search.icon className="h-4 w-4 mr-3" />
              <div className="text-left flex-1">
                <div className="font-medium">{search.label}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {search.query}
                </div>
              </div>
              <Badge variant="secondary" className="ml-2 capitalize">
                {search.type}
              </Badge>
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Recent Searches */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Searches</CardTitle>
          <CardDescription>
            Your recently executed searches
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentSearches.length > 0 ? (
            recentSearches.map((history: string, index: number) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start h-auto py-3"
                onClick={() => handleQuickSearch(history, history)}
              >
                <Clock className="h-4 w-4 mr-3" />
                <div className="text-left flex-1">
                  <div className="font-medium truncate">{history}</div>
                  <div className="text-xs text-muted-foreground">
                    Recent search
                  </div>
                </div>
                <Search className="h-4 w-4 ml-2" />
              </Button>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No recent searches</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}