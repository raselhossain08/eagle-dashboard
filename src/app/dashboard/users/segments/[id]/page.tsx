// app/dashboard/users/segments/[id]/page.tsx
'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Users, 
  Filter, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  Search, 
  AlertCircle,
  Loader2,
  Calendar,
  Tag
} from 'lucide-react';
import Link from 'next/link';
import { useSegment, useDeleteSegment, useSegmentUsers } from '@/hooks/useSegments';
import { toast } from 'sonner';

export default function SegmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const segmentId = params.id as string;
  
  const [usersPage, setUsersPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { 
    data: segment, 
    isLoading: segmentLoading, 
    error: segmentError,
    refetch: refetchSegment 
  } = useSegment(segmentId);
  
  const { 
    data: usersData, 
    isLoading: usersLoading, 
    error: usersError,
    refetch: refetchUsers 
  } = useSegmentUsers(segmentId, usersPage, 10);
  
  const deleteSegment = useDeleteSegment();

  const handleDeleteSegment = async () => {
    if (window.confirm('Are you sure you want to delete this segment? This action cannot be undone.')) {
      try {
        await deleteSegment.mutateAsync(segmentId);
        toast.success('Segment deleted successfully');
        router.push('/dashboard/users/segments');
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete segment');
      }
    }
  };

  const handleRefresh = () => {
    refetchSegment();
    refetchUsers();
  };

  // Filter users based on search query
  const filteredUsers = usersData?.data?.filter(user =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.company?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (segmentLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/users/segments">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Segments
            </Link>
          </Button>
          <div>
            <div className="h-8 bg-muted rounded animate-pulse w-64 mb-2" />
            <div className="h-4 bg-muted rounded animate-pulse w-96" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="h-64 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-96 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (segmentError || !segment) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/users/segments">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Segments
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Segment Not Found</h1>
            <p className="text-muted-foreground">
              The requested segment could not be found or has been deleted
            </p>
          </div>
        </div>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {segmentError?.message || 'Failed to load segment details'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/users/segments">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Segments
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{segment.name}</h1>
            <p className="text-muted-foreground">{segment.description}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/users/segments/${segmentId}/edit`}>
              <Edit3 className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDeleteSegment}
            disabled={deleteSegment.isPending}
            className="text-destructive hover:text-destructive"
          >
            {deleteSegment.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Segment Users */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Segment Users
                    <Badge variant="secondary" className="ml-2">
                      {segment.userCount} users
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Users who match the segment criteria
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search users..." 
                  className="pl-8" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Users List */}
              {usersError ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Failed to load users: {usersError.message}
                  </AlertDescription>
                </Alert>
              ) : usersLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded animate-pulse w-1/3" />
                        <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredUsers.length > 0 ? (
                <div className="space-y-3">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{user.name || 'Unnamed User'}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                        {user.company && (
                          <div className="text-xs text-muted-foreground">{user.company}</div>
                        )}
                      </div>
                      <div className="text-right">
                        <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                          {user.status}
                        </Badge>
                        {user.lastLogin && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Last login: {new Date(user.lastLogin).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    {searchQuery ? 'No Users Found' : 'No Users in Segment'}
                  </h3>
                  <p className="text-muted-foreground">
                    {searchQuery 
                      ? 'No users match your search criteria.'
                      : 'No users currently match the segment criteria.'
                    }
                  </p>
                </div>
              )}

              {/* Pagination */}
              {usersData && usersData.meta.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {((usersPage - 1) * 10) + 1} to {Math.min(usersPage * 10, usersData.meta.total)} of {usersData.meta.total} users
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setUsersPage(prev => Math.max(1, prev - 1))}
                      disabled={usersPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setUsersPage(prev => Math.min(usersData.meta.totalPages, prev + 1))}
                      disabled={usersPage === usersData.meta.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Segment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full ${segment.color}`} />
                Segment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium mb-1">Segment ID</div>
                <code className="text-xs bg-muted px-2 py-1 rounded">{segment.id}</code>
              </div>
              
              <div>
                <div className="text-sm font-medium mb-1">User Count</div>
                <div className="text-2xl font-bold">{segment.userCount.toLocaleString()}</div>
              </div>

              <div>
                <div className="text-sm font-medium mb-1 flex items-center gap-1">
                  <Filter className="h-3 w-3" />
                  Criteria
                </div>
                <code className="text-xs bg-muted px-2 py-1 rounded block">{segment.criteria}</code>
              </div>

              <div>
                <div className="text-sm font-medium mb-1 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Created
                </div>
                <div className="text-sm text-muted-foreground">
                  {new Date(segment.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium mb-1">Last Updated</div>
                <div className="text-sm text-muted-foreground">
                  {new Date(segment.updatedAt).toLocaleDateString()}
                </div>
              </div>

              {segment.tags && segment.tags.length > 0 && (
                <div>
                  <div className="text-sm font-medium mb-2 flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    Tags
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {segment.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/dashboard/users/segments/${segmentId}/edit`}>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Segment
                </Link>
              </Button>
              
              <Button variant="outline" className="w-full" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full text-destructive hover:text-destructive" 
                onClick={handleDeleteSegment}
                disabled={deleteSegment.isPending}
              >
                {deleteSegment.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Delete Segment
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}