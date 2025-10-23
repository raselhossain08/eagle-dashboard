'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, History, Bookmark, TrendingUp, Users, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { LoadingSpinner } from '@/components/loading-spinner';
import { 
  useAdvancedSearch, 
  useSearchAnalytics, 
  useSearchFilters,
  useSearchHistory 
} from '@/hooks/use-search';
import { formatDistanceToNow } from 'date-fns';

export default function SearchDashboard() {
  const [activeTab, setActiveTab] = useState('search');
  const [localQuery, setLocalQuery] = useState('');
  
  const {
    query,
    results,
    isSearching,
    hasSearched,
    suggestions,
    recentSearches,
    totalResults,
    isLoadingSuggestions,
    error,
    executeSearch,
    clearSearch,
    formatResult,
    highlightTerms,
  } = useAdvancedSearch();

  const { data: analytics, isLoading: analyticsLoading } = useSearchAnalytics();
  const { data: searchFilters, isLoading: filtersLoading } = useSearchFilters();
  const { history, addToHistory } = useSearchHistory();

  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  const handleSearch = async (searchQuery?: string) => {
    const queryToSearch = searchQuery || localQuery;
    if (!queryToSearch.trim()) return;
    
    await executeSearch(queryToSearch);
    addToHistory(queryToSearch);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleQuickSearch = (searchTerm: string) => {
    setLocalQuery(searchTerm);
    handleSearch(searchTerm);
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'user': return <Users className="h-4 w-4" />;
      case 'contract': return <FileText className="h-4 w-4" />;
      case 'subscriber': return <Users className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Search Dashboard</h1>
          <p className="text-muted-foreground">
            Enterprise search across all your resources
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:max-w-md">
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="saved">Saved</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-6">
          {/* Search Interface */}
          <Card>
            <CardHeader>
              <CardTitle>Advanced Search</CardTitle>
              <CardDescription>
                Search across users, contracts, subscriptions, and more
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search Input */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search for users, contracts, or any content..."
                    value={localQuery}
                    onChange={(e) => setLocalQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-10"
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <LoadingSpinner className="h-4 w-4" />
                    </div>
                  )}
                </div>
                <Button 
                  onClick={() => handleSearch()} 
                  disabled={isSearching || !localQuery.trim()}
                >
                  Search
                </Button>
                {hasSearched && (
                  <Button variant="outline" onClick={clearSearch}>
                    Clear
                  </Button>
                )}
              </div>

              {/* Search Suggestions */}
              {localQuery && suggestions.length > 0 && !hasSearched && (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h4 className="text-sm font-medium mb-2">Suggestions</h4>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.slice(0, 6).map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickSearch(suggestion.value)}
                      >
                        {suggestion.value}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Searches */}
              {!hasSearched && recentSearches.length > 0 && (
                <div className="border rounded-lg p-4">
                  <h4 className="text-sm font-medium mb-2 flex items-center">
                    <History className="h-4 w-4 mr-2" />
                    Recent Searches
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.slice(0, 5).map((search, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuickSearch(search)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {search}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Search Results */}
              {hasSearched && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      {isSearching ? 'Searching...' : `${totalResults} results for "${query}"`}
                    </p>
                    {!filtersLoading && searchFilters && (
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <Select defaultValue="">
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Filter by type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">All types</SelectItem>
                            {searchFilters.categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                      <p className="text-red-600">Error: {error.message}</p>
                    </div>
                  )}

                  {isSearching ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="border rounded-lg p-4">
                          <Skeleton className="h-4 w-1/4 mb-2" />
                          <Skeleton className="h-3 w-3/4 mb-1" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      ))}
                    </div>
                  ) : results.length > 0 ? (
                    <div className="space-y-4">
                      {results.map((result) => {
                        const formatted = formatResult(result);
                        return (
                          <div key={result.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  {getResultIcon(result._type)}
                                  <h3 
                                    className="font-medium"
                                    dangerouslySetInnerHTML={{ 
                                      __html: highlightTerms(formatted.title) 
                                    }}
                                  />
                                  <Badge variant="outline">{formatted.type}</Badge>
                                  {formatted.badge && (
                                    <Badge variant="secondary">{formatted.badge}</Badge>
                                  )}
                                </div>
                                <p 
                                  className="text-sm text-gray-600 mb-1"
                                  dangerouslySetInnerHTML={{ 
                                    __html: highlightTerms(formatted.subtitle) 
                                  }}
                                />
                                <p 
                                  className="text-sm text-gray-500"
                                  dangerouslySetInnerHTML={{ 
                                    __html: highlightTerms(formatted.description) 
                                  }}
                                />
                              </div>
                              <div className="text-right text-xs text-gray-400">
                                Score: {result._score.toFixed(2)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No results found for "{query}"</p>
                      <p className="text-sm text-gray-400 mt-1">Try adjusting your search terms</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          {analyticsLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-1/4" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
              <Skeleton className="h-64 w-full" />
            </div>
          ) : analytics ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Searches</p>
                        <p className="text-2xl font-bold text-blue-600">{analytics.totalSearches}</p>
                      </div>
                      <Search className="h-8 w-8 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Unique Searchers</p>
                        <p className="text-2xl font-bold text-green-600">{analytics.uniqueSearchers}</p>
                      </div>
                      <Users className="h-8 w-8 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Avg Results</p>
                        <p className="text-2xl font-bold text-purple-600">{analytics.averageResultsPerSearch}</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Last 24h</p>
                        <p className="text-2xl font-bold text-orange-600">{analytics.timeRanges.last24h}</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Popular Queries</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analytics.popularQueries.map((query, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{query.query}</span>
                          <Badge variant="outline">{query.count}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Search Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(analytics.searchesByCategory).map(([category, count]) => (
                        <div key={category} className="flex items-center justify-between">
                          <span className="text-sm font-medium capitalize">{category}</span>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No analytics data available</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Search History</CardTitle>
              <CardDescription>
                Your recent search activity and patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              {history.length > 0 ? (
                <div className="space-y-2">
                  {history.map((search, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleQuickSearch(search)}
                    >
                      <div className="flex items-center gap-3">
                        <History className="h-4 w-4 text-gray-400" />
                        <span>{search}</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        Search Again
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No search history available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="saved">
          <Card>
            <CardHeader>
              <CardTitle>Saved Searches</CardTitle>
              <CardDescription>
                Bookmark frequently used search queries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Bookmark className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No saved searches yet</p>
                <p className="text-sm text-gray-400 mt-1">Save searches to access them quickly</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}