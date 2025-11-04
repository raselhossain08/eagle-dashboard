import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface SearchErrorProps {
  error: Error | null;
  onRetry?: () => void;
  onClear?: () => void;
}

export function SearchError({ error, onRetry, onClear }: SearchErrorProps) {
  if (!error) return null;

  const getErrorMessage = (error: Error) => {
    if (error.message.includes('Authentication')) {
      return 'Authentication required. Please log in again.';
    }
    
    if (error.message.includes('Network')) {
      return 'Network error. Please check your connection and try again.';
    }
    
    if (error.message.includes('429')) {
      return 'Too many requests. Please wait a moment and try again.';
    }
    
    return error.message || 'An unexpected error occurred while searching.';
  };

  const getErrorSuggestion = (error: Error) => {
    if (error.message.includes('Authentication')) {
      return 'Try refreshing the page or logging in again.';
    }
    
    if (error.message.includes('Network')) {
      return 'Check your internet connection and try again.';
    }
    
    return 'Try adjusting your search terms or contact support if the problem persists.';
  };

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <div className="flex-1">
        <AlertDescription className="mb-2">
          <strong>Search Error:</strong> {getErrorMessage(error)}
        </AlertDescription>
        <AlertDescription className="text-sm opacity-90">
          {getErrorSuggestion(error)}
        </AlertDescription>
      </div>
      <div className="flex gap-2 mt-2">
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            Retry Search
          </Button>
        )}
        {onClear && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            Clear
          </Button>
        )}
      </div>
    </Alert>
  );
}