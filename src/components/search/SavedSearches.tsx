'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Star, Trash2, Play } from 'lucide-react';
import { SavedSearch } from '@/types/search';

// Mock data - replace with actual API calls
const mockSavedSearches: SavedSearch[] = [
  {
    id: '1',
    name: 'Active Users',
    query: {
      query: 'status:active',
      filters: { status: ['active'] },
      sortBy: 'name',
      limit: 20,
      offset: 0
    },
    createdAt: new Date('2024-01-15'),
    isDefault: true
  },
  {
    id: '2',
    name: 'Recent Contracts',
    query: {
      query: 'type:contract',
      filters: { type: ['contract'] },
      sortBy: 'date-desc',
      limit: 20,
      offset: 0
    },
    createdAt: new Date('2024-01-10'),
    isDefault: false
  }
];

export function SavedSearches() {
  const handleRunSearch = (search: SavedSearch) => {
    console.log('Running saved search:', search);
    // Implement search execution logic
  };

  const handleDeleteSearch = (id: string) => {
    console.log('Deleting saved search:', id);
    // Implement delete logic
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Saved Searches</CardTitle>
        <CardDescription>
          Your frequently used search queries
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockSavedSearches.map((savedSearch) => (
            <div
              key={savedSearch.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center space-x-3 flex-1">
                {savedSearch.isDefault ? (
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                ) : (
                  <Search className="h-4 w-4 text-muted-foreground" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{savedSearch.name}</span>
                    {savedSearch.isDefault && (
                      <Badge variant="outline">Default</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {savedSearch.query.query}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRunSearch(savedSearch)}
                >
                  <Play className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteSearch(savedSearch.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {mockSavedSearches.length === 0 && (
          <div className="text-center p-8">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No saved searches</h3>
            <p className="text-muted-foreground">
              Save your frequent searches to access them quickly here.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}