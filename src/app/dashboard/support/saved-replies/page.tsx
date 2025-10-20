// app/dashboard/support/saved-replies/page.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Copy, Edit, Trash2, MessageSquare } from 'lucide-react';
import { useSavedReplies } from '@/hooks/useSupport';
import { useState } from 'react';

export default function SavedRepliesPage() {
  const { data: savedReplies, isLoading } = useSavedReplies();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredReplies = savedReplies?.filter(reply =>
    reply.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reply.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reply.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleUseReply = (reply: any) => {
    // Implement reply usage logic
    console.log('Using reply:', reply);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Saved Replies</h1>
          <p className="text-muted-foreground">
            Manage template responses for common support issues
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Reply
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search saved replies..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-muted rounded w-full mb-2" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </CardContent>
            </Card>
          ))
        ) : filteredReplies?.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">No saved replies found</h3>
            <p className="text-muted-foreground mb-4">Create your first saved reply template</p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Saved Reply
            </Button>
          </div>
        ) : (
          filteredReplies?.map((reply) => (
            <Card key={reply.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{reply.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {reply.content}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  <Badge variant="secondary" className="text-xs">
                    {reply.category}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Used {reply.useCount} times
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1 mb-4">
                  {reply.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {reply.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{reply.tags.length - 3} more
                    </Badge>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleUseReply(reply)}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Use
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}