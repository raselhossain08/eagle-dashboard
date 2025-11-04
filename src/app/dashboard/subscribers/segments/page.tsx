// app/dashboard/subscribers/segments/page.tsx
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Plus,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  BarChart3,
  RefreshCw,
  AlertTriangle,
  Search,
  Calendar,
  Target
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSegments, useDeleteSegment } from '@/hooks/useSubscribers';
import { RoleBasedAccess } from '@/components/auth/RoleBasedAccess';
import { ApiErrorHandler } from '@/components/errors/ApiErrorHandler';
import Link from 'next/link';

interface Segment {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
  subscriberCount?: number;
  criteria?: {
    operator: string;
    conditions: Array<{
      field: string;
      operator: string;
      value: any;
    }>;
  };
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

function SegmentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [refreshing, setRefreshing] = useState(false);

  const { 
    data: segments, 
    isLoading, 
    error,
    refetch 
  } = useSegments();
  const deleteSegment = useDeleteSegment();

  const handleDeleteSegment = async (segmentId: string, segmentName: string) => {
    const confirmMessage = `Are you sure you want to delete "${segmentName}"? This action cannot be undone and will remove all segment configurations.`;
    
    if (confirm(confirmMessage)) {
      try {
        await deleteSegment.mutateAsync(segmentId);
      } catch (error) {
        console.error('Error deleting segment:', error);
        alert('Failed to delete segment. Please try again.');
      }
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Filter and sort segments
  const filteredSegments = React.useMemo(() => {
    if (!segments) return [];

    let filtered = segments.filter((segment: Segment) => {
      const matchesSearch = searchQuery === '' || 
        segment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        segment.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && segment.isActive) ||
        (statusFilter === 'inactive' && !segment.isActive);

      return matchesSearch && matchesStatus;
    });

    // Sort segments
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'subscribers':
          return (b.subscriberCount || 0) - (a.subscriberCount || 0);
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'updated':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [segments, searchQuery, statusFilter, sortBy]);

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Subscriber Segments</h1>
            <p className="text-muted-foreground">Error loading segments</p>
          </div>
        </div>
        <ApiErrorHandler 
          error={error} 
          retry={handleRefresh}
          className="mx-auto max-w-md"
        />
      </div>
    );
  }

  return (
    <RoleBasedAccess 
      requiredRoles={['super_admin', 'finance_admin']}
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold">Access Restricted</h3>
              <p className="text-muted-foreground">
                You need admin permissions to manage subscriber segments.
              </p>
            </div>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Subscriber Segments</h1>
            <p className="text-muted-foreground">
              Create and manage subscriber segments for targeted actions
            </p>
            {segments && (
              <p className="text-sm text-muted-foreground mt-1">
                {segments.length} total segments • {filteredSegments.length} shown
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing || isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Segment
            </Button>
          </div>
        </div>

        {/* Status Alert */}
        {segments && segments.length === 0 && (
          <Alert>
            <Target className="h-4 w-4" />
            <AlertDescription>
              No segments have been created yet. Create your first segment to start organizing subscribers.
            </AlertDescription>
          </Alert>
        )}

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Segment Management</CardTitle>
                <CardDescription>
                  Create dynamic segments based on subscriber attributes and behavior
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search segments..."
                    className="w-full sm:w-64 pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="subscribers">Subscribers</SelectItem>
                    <SelectItem value="created">Created</SelectItem>
                    <SelectItem value="updated">Updated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Segments Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="relative">
                    <CardHeader className="pb-3">
                      <div className="space-y-2">
                        <div className="h-6 bg-muted animate-pulse rounded" />
                        <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="h-4 bg-muted animate-pulse rounded" />
                        <div className="h-16 bg-muted animate-pulse rounded" />
                        <div className="flex justify-between">
                          <div className="h-6 w-16 bg-muted animate-pulse rounded" />
                          <div className="h-8 w-24 bg-muted animate-pulse rounded" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : filteredSegments.length > 0 ? (
                filteredSegments.map((segment: Segment) => (
                <Card key={segment._id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{segment.name}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {segment.description || 'No description'}
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/subscribers/segments/${segment._id}`}>
                              <BarChart3 className="h-4 w-4 mr-2" />
                              Analyze
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeleteSegment(segment._id, segment.name)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Subscribers</span>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{segment.subscriberCount || 0}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <span className="text-sm text-muted-foreground">Criteria</span>
                        <div className="font-mono bg-muted p-2 rounded text-xs max-h-16 overflow-y-auto">
                          {segment.criteria?.operator || 'N/A'}: {
                            segment.criteria?.conditions?.length 
                              ? `${segment.criteria.conditions.length} conditions`
                              : 'No conditions'
                          }
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <Badge className={segment.isActive 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                        }>
                          {segment.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/subscribers/segments/${segment._id}`}>
                            View Subscribers
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full flex items-center justify-center py-12">
                <div className="text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No segments found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery ? 'No segments match your search criteria.' : 'Create your first segment to get started.'}
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Segment
                  </Button>
                </div>
              </div>
            )}

            {/* Create New Segment Card - only show when not searching and have segments */}
            {!searchQuery && filteredSegments.length > 0 && (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                  <div className="rounded-full bg-muted p-3 mb-4">
                    <Plus className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold mb-2">Create New Segment</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Build a custom segment based on subscriber attributes and behavior
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Segment
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
    </RoleBasedAccess>
  );
}

export default SegmentsPage;