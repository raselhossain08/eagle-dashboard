// app/dashboard/users/segments/page.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Users, Filter, ArrowRight, Search, AlertCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useSegments, useDeleteSegment } from '@/hooks/useSegments';
import { toast } from 'sonner';

export default function SegmentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { 
    data: segments = [], 
    isLoading, 
    error, 
    refetch,
    isRefetching 
  } = useSegments();
  const deleteSegment = useDeleteSegment();

  const handleDeleteSegment = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this segment?')) {
      try {
        await deleteSegment.mutateAsync(id);
        toast.success('Segment deleted successfully');
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete segment');
      }
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  // Filter segments based on search query
  const filteredSegments = segments.filter(segment =>
    segment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    segment.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    segment.criteria.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Segments</h1>
            <p className="text-muted-foreground">
              Create and manage user segments for targeted actions and analysis
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Loading segments...</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Segments</h1>
          <p className="text-muted-foreground">
            Create and manage user segments for targeted actions and analysis
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefetching}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button asChild>
            <Link href="/dashboard/users/segments/new">
              <Plus className="h-4 w-4 mr-2" />
              New Segment
            </Link>
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load segments: {error.message}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search segments..." 
            className="pl-8" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline">Filter</Button>
      </div>

      <div className="grid gap-6">
        {filteredSegments.map((segment) => (
          <Card key={segment.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`w-12 h-12 ${segment.color} rounded-lg flex items-center justify-center`}>
                    <Users className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{segment.name}</h3>
                      <Badge variant="secondary">{segment.userCount} users</Badge>
                      <Badge className={segment.color}>{segment.id}</Badge>
                    </div>
                    <p className="text-muted-foreground mb-3">{segment.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Filter className="h-3 w-3" />
                        <code className="text-xs bg-muted px-2 py-1 rounded">{segment.criteria}</code>
                      </div>
                      <span>Created {new Date(segment.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteSegment(segment.id)}
                    disabled={deleteSegment.isPending}
                  >
                    Delete
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href={`/dashboard/users/segments/${segment.id}`}>
                      View Segment
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSegments.length === 0 && !isLoading && (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">
                {searchQuery ? 'No Segments Found' : 'No Segments Created'}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {searchQuery 
                  ? 'No segments match your search criteria. Try adjusting your search terms.'
                  : 'Create your first user segment to group users based on specific criteria and perform bulk actions.'
                }
              </p>
              {!searchQuery && (
                <Button asChild>
                  <Link href="/dashboard/users/segments/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Segment
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}