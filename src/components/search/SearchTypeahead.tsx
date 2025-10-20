'use client';

import { useState, useEffect, useRef } from 'react';
import { SearchHighlight } from './SearchHighlight';
import { SearchSuggestion } from '@/types/search';
import { Search, Clock, User, FileText } from 'lucide-react';

interface SearchTypeaheadProps {
  suggestions: SearchSuggestion[];
  query: string;
  onSelect: (suggestion: string) => void;
  isLoading?: boolean;
}

export function SearchTypeahead({ suggestions, query, onSelect, isLoading }: SearchTypeaheadProps) {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [suggestions, query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!suggestions.length) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          onSelect(suggestions[selectedIndex].text);
        }
        break;
      case 'Escape':
        setSelectedIndex(-1);
        break;
    }
  };

  const getSuggestionIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'user':
        return <User className="h-4 w-4" />;
      case 'resource':
        return <FileText className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  if (!query || suggestions.length === 0) return null;

  return (
    <div 
      className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border rounded-lg shadow-lg max-h-80 overflow-y-auto"
      onKeyDown={handleKeyDown}
    >
      <div ref={listRef} className="py-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            className={`w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors flex items-center space-x-3 ${
              index === selectedIndex ? 'bg-muted' : ''
            }`}
            onClick={() => onSelect(suggestion.text)}
          >
            {getSuggestionIcon(suggestion.type)}
            <div className="flex-1">
              <SearchHighlight
                text={suggestion.text}
                searchTerm={query}
                className="font-medium"
              />
              {suggestion.metadata?.description && (
                <div className="text-xs text-muted-foreground mt-0.5">
                  {suggestion.metadata.description}
                </div>
              )}
            </div>
            {suggestion.type !== 'query' && (
              <span className="text-xs text-muted-foreground capitalize">
                {suggestion.type}
              </span>
            )}
          </button>
        ))}
      </div>
      
      {isLoading && (
        <div className="px-3 py-2 text-sm text-muted-foreground flex items-center space-x-3">
          <Clock className="h-4 w-4 animate-spin" />
          <span>Loading suggestions...</span>
        </div>
      )}
    </div>
  );
}