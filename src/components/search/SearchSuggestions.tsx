'use client';

import { Card, CardContent } from '@/components/ui/card';
import { SearchSuggestion } from '@/types/search';

interface SearchSuggestionsProps {
  suggestions: SearchSuggestion[];
  onSelect: (suggestion: string) => void;
  onClose: () => void;
}

export function SearchSuggestions({ suggestions, onSelect, onClose }: SearchSuggestionsProps) {
  return (
    <Card className="absolute top-full left-0 right-0 z-50 mt-1 shadow-lg">
      <CardContent className="p-2">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className="px-3 py-2 text-sm cursor-pointer hover:bg-muted rounded-sm transition-colors"
            onClick={() => onSelect(suggestion.text)}
          >
            {suggestion.text}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}