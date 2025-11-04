import { Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface SearchLoadingProps {
  isSearching: boolean;
  query?: string;
  resultCount?: number;
}

export function SearchLoading({ isSearching, query, resultCount }: SearchLoadingProps) {
  if (!isSearching) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Search className="h-4 w-4 animate-pulse" />
        <span>
          {query ? `Searching for "${query}"...` : 'Searching...'}
        </span>
      </div>
      
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="border rounded-lg p-4 animate-pulse">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-12" />
            </div>
            
            <Skeleton className="h-3 w-3/4 mb-2" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
      
      <div className="text-center py-4">
        <div className="inline-flex items-center gap-2 text-sm text-gray-500">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span>Loading search results...</span>
        </div>
      </div>
    </div>
  );
}