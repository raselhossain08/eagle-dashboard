'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, History, Bookmark, TrendingUp, Users, FileText, AlertCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SearchError } from '@/components/search/search-error';
import { SearchLoading } from '@/components/search/search-loading';
import { SearchResults } from '@/components/search/search-results';
import { SearchStats } from '@/components/search/search-stats';
import { toast } from 'sonner';
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
  const [selectedType, setSelectedType] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  
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

  const { data: analytics, isLoading: analyticsLoading, error: analyticsError, refetch: refetchAnalytics } = useSearchAnalytics(false);
  const { data: searchFilters, isLoading: filtersLoading, error: filtersError } = useSearchFilters(hasSearched);
  const { history, addToHistory, loadHistory } = useSearchHistory();

  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  useEffect(() => {
    // Load search history on component mount
    if (!isInitialized) {
      loadHistory();
      setIsInitialized(true);
    }
  }, [loadHistory, isInitialized]);

  useEffect(() => {
    // Show error toast if search fails
    if (error) {
      toast.error('Search failed', {
        description: error.message || 'Please try again later',
      });
    }
  }, [error]);

  useEffect(() => {
    // Show analytics error toast
    if (analyticsError) {
      toast.error('Failed to load analytics', {
        description: 'Analytics data may be outdated',
      });
    }
  }, [analyticsError]);

  useEffect(() => {
    // Load analytics when switching to analytics tab
    if (activeTab === 'analytics' && !analytics && !analyticsLoading) {
      refetchAnalytics();
    }
  }, [activeTab, analytics, analyticsLoading, refetchAnalytics]);

  const handleSearch = async (searchQuery?: string, type?: string) => {
    const queryToSearch = searchQuery || localQuery;
    const typeToSearch = type || selectedType;
    
    if (!queryToSearch.trim()) {
      toast.warning('Please enter a search query');
      return;
    }
    
    try {
      await executeSearch(queryToSearch, typeToSearch);
      addToHistory(queryToSearch);
      
      // Show success toast with result count
      if (totalResults > 0) {
        toast.success(`Found ${totalResults} results for "${queryToSearch}"`);
      }
    } catch (error) {
      console.error('Search error:', error);
    }
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

  const handleClearSearch = () => {
    clearSearch();
    setLocalQuery('');
    setSelectedType('');
  };

  const handleRefreshAnalytics = () => {
    refetchAnalytics();
    toast.success('Analytics refreshed');
  };

  const handleAnalyticsTab = () => {
    // Load analytics when tab is clicked
    if (!analytics && !analyticsLoading) {
      refetchAnalytics();
    }
  };

  const handleRetrySearch = () => {
    if (query) {
      handleSearch(query, selectedType);
    }
  };

  const handleResultClick = (result: any) => {
    // Navigate to result detail page or show modal
    console.log('Result clicked:', result);
    toast.info(`Viewing ${result._type}: ${result.id}`);
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
          <TabsTrigger value="analytics" onClick={handleAnalyticsTab}>Analytics</TabsTrigger>
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
                    placeholder="Search for users, contracts, subscribers, or any content..."
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
                
                {/* Search Type Filter */}
                <Select value={selectedType || "all"} onValueChange={(value) => setSelectedType(value === "all" ? "" : value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="user">Users</SelectItem>
                    <SelectItem value="subscriber">Subscribers</SelectItem>
                    <SelectItem value="contract">Contracts</SelectItem>
                  </SelectContent>
                </Select>

                <Button 
                  onClick={() => handleSearch()} 
                  disabled={isSearching || !localQuery.trim()}
                  className="min-w-20"
                >
                  {isSearching ? (
                    <LoadingSpinner className="h-4 w-4" />
                  ) : (
                    'Search'
                  )}
                </Button>
                
                {hasSearched && (
                  <Button variant="outline" onClick={handleClearSearch}>
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
                        <Select value={selectedType || "all"} onValueChange={(value) => setSelectedType(value === "all" ? "" : value)}>
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Filter by type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All types</SelectItem>
                            {searchFilters.categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        {selectedType && selectedType !== "all" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedType('')}
                          >
                            Clear filter
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  <SearchError 
                    error={error} 
                    onRetry={handleRetrySearch}
                    onClear={handleClearSearch}
                  />

                  <SearchLoading 
                    isSearching={isSearching} 
                    query={query}
                    resultCount={totalResults}
                  />

                  {!isSearching && hasSearched && (
                    <SearchResults
                      results={results}
                      query={query}
                      totalResults={totalResults}
                      isSearching={isSearching}
                      onResultClick={handleResultClick}
                      highlightTerms={highlightTerms}
                      formatResult={formatResult}
                    />
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Search Analytics</h2>
              <p className="text-muted-foreground">
                Overview of search activity and performance
              </p>
            </div>
            <Button variant="outline" onClick={handleRefreshAnalytics} disabled={analyticsLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${analyticsLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {analyticsError && (
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load analytics data. Some information may be outdated.
              </AlertDescription>
            </Alert>
          )}

          {analyticsLoading ? (
            <div className="space-y-4">
              <div className="text-center py-4">
                <LoadingSpinner className="h-6 w-6 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Loading analytics data...</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
              <Skeleton className="h-64 w-full" />
            </div>
          ) : analytics ? (
            <div className="space-y-6">
              <SearchStats analytics={analytics} isLoading={analyticsLoading} />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Popular Queries</CardTitle>
                    <CardDescription>Most searched terms</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analytics.popularQueries.length > 0 ? (
                        analytics.popularQueries.map((query, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span 
                              className="text-sm font-medium cursor-pointer hover:text-blue-600"
                              onClick={() => handleQuickSearch(query.query)}
                            >
                              {query.query}
                            </span>
                            <Badge variant="outline">{query.count}</Badge>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No popular queries yet</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Search Categories</CardTitle>
                    <CardDescription>Activity by resource type</CardDescription>
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

                {analytics.resourceCounts && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Resource Overview</CardTitle>
                      <CardDescription>Total resources in database</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Total Users</span>
                          <Badge variant="outline">{analytics.resourceCounts.totalUsers || 0}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Total Subscribers</span>
                          <Badge variant="outline">{analytics.resourceCounts.totalSubscribers || 0}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Total Contracts</span>
                          <Badge variant="outline">{analytics.resourceCounts.totalContracts || 0}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Active Users</span>
                          <Badge variant="secondary">{analytics.resourceCounts.activeUsers || 0}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No analytics data available</p>
              <Button 
                onClick={handleRefreshAnalytics}
                disabled={analyticsLoading}
              >
                {analyticsLoading ? (
                  <>
                    <LoadingSpinner className="h-4 w-4 mr-2" />
                    Loading...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Load Analytics
                  </>
                )}
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Search History</CardTitle>
                  <CardDescription>
                    Your recent search activity and patterns
                  </CardDescription>
                </div>
                {history.length > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      // Clear history functionality would go here
                      toast.success('Search history cleared');
                    }}
                  >
                    Clear History
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {history.length > 0 ? (
                <div className="space-y-2">
                  {history.slice(0, 20).map((search, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <div 
                        className="flex items-center gap-3 flex-1 cursor-pointer"
                        onClick={() => handleQuickSearch(search)}
                      >
                        <History className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{search}</span>
                        <span className="text-xs text-gray-500">
                          {index === 0 ? 'Latest' : `${index + 1} searches ago`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleQuickSearch(search)}
                        >
                          Search Again
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Remove from history functionality would go here
                            toast.success('Removed from history');
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {history.length > 20 && (
                    <div className="text-center pt-4">
                      <p className="text-sm text-gray-500">
                        Showing latest 20 searches out of {history.length} total
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">No search history available</p>
                  <p className="text-sm text-gray-400">
                    Your recent searches will appear here for quick access
                  </p>
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