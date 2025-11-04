import { Search, FileText, Users, Building, Clock, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

interface SearchResult {
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

interface SearchResultsProps {
  results: SearchResult[];
  query: string;
  totalResults: number;
  isSearching: boolean;
  onResultClick?: (result: SearchResult) => void;
  highlightTerms: (text: string) => string;
  formatResult: (result: SearchResult) => {
    title: string;
    subtitle: string;
    description: string;
    type: string;
    badge?: string;
  };
}

export function SearchResults({ 
  results, 
  query, 
  totalResults,
  isSearching,
  onResultClick,
  highlightTerms,
  formatResult 
}: SearchResultsProps) {
  const getResultIcon = (type: string) => {
    switch (type) {
      case 'user': return <Users className="h-4 w-4 text-blue-600" />;
      case 'subscriber': return <Users className="h-4 w-4 text-green-600" />;
      case 'contract': return <FileText className="h-4 w-4 text-purple-600" />;
      case 'company': return <Building className="h-4 w-4 text-orange-600" />;
      default: return <Search className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isSearching) {
    return null; // Loading state handled elsewhere
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
        <p className="text-gray-500 mb-4">
          No results found for <span className="font-medium">"{query}"</span>
        </p>
        <div className="text-sm text-gray-400 space-y-1">
          <p>Try adjusting your search terms or filters</p>
          <p>Make sure all words are spelled correctly</p>
          <p>Try more general keywords</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          {totalResults.toLocaleString()} results for <span className="font-medium">"{query}"</span>
        </span>
        <span>
          Found in {results.length < totalResults ? `${results.length} shown` : 'all shown'}
        </span>
      </div>

      <div className="space-y-3">
        {results.map((result) => {
          const formatted = formatResult(result);
          
          return (
            <div
              key={result.id}
              className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer group"
              onClick={() => onResultClick?.(result)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-2">
                    {getResultIcon(result._type)}
                    <h3 
                      className="font-medium text-gray-900 truncate"
                      dangerouslySetInnerHTML={{ 
                        __html: highlightTerms(formatted.title) 
                      }}
                    />
                    <Badge variant="outline" className="shrink-0">
                      {formatted.type}
                    </Badge>
                    {formatted.badge && (
                      <Badge 
                        className={`shrink-0 ${getStatusColor(formatted.badge)}`}
                        variant="secondary"
                      >
                        {formatted.badge}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Subtitle */}
                  {formatted.subtitle && (
                    <p 
                      className="text-sm text-gray-600 mb-1 truncate"
                      dangerouslySetInnerHTML={{ 
                        __html: highlightTerms(formatted.subtitle) 
                      }}
                    />
                  )}
                  
                  {/* Description */}
                  <p 
                    className="text-sm text-gray-500 line-clamp-2"
                    dangerouslySetInnerHTML={{ 
                      __html: highlightTerms(formatted.description) 
                    }}
                  />
                  
                  {/* Metadata */}
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>
                        {formatDistanceToNow(new Date(result.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    {result.email && (
                      <span className="truncate max-w-48">{result.email}</span>
                    )}
                    {result.company && (
                      <span className="truncate max-w-32">{result.company}</span>
                    )}
                  </div>
                </div>
                
                {/* Score and Actions */}
                <div className="flex flex-col items-end gap-2 ml-4">
                  <div className="text-xs text-gray-400">
                    Score: {result._score.toFixed(1)}
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" className="h-7 text-xs">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Load More */}
      {results.length < totalResults && (
        <div className="text-center py-4">
          <Button variant="outline" size="sm">
            Load More Results ({totalResults - results.length} remaining)
          </Button>
        </div>
      )}
    </div>
  );
}