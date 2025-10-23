// app/dashboard/subscribers/segments/[segmentId]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Users, 
  BarChart3,
  Download,
  Mail,
  Filter,
  Calendar
} from 'lucide-react';
import Link from 'next/link';
import { useSegment, useSegmentSubscribers, useDeleteSegment } from '@/hooks/useSubscribers';
import { useRouter } from 'next/navigation';

export default function SegmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const segmentId = params.segmentId as string;
  const deleteSegment = useDeleteSegment();

  const { data: segment, isLoading: segmentLoading, error: segmentError } = useSegment(segmentId);
  const { data: segmentSubscribers, isLoading: subscribersLoading, error: subscribersError } = useSegmentSubscribers(segmentId);

  const handleDeleteSegment = async () => {
    if (confirm('Are you sure you want to delete this segment? This action cannot be undone.')) {
      try {
        await deleteSegment.mutateAsync(segmentId);
        router.push('/dashboard/subscribers/segments');
      } catch (error) {
        console.error('Error deleting segment:', error);
      }
    }
  };

  if (segmentError || subscribersError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">Failed to load segment data</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (segmentLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-muted animate-pulse rounded" />
            <div className="space-y-2">
              <div className="h-8 w-64 bg-muted animate-pulse rounded" />
              <div className="h-4 w-48 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted animate-pulse rounded mb-2" />
                <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!segment) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground">Segment not found</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/subscribers/segments">
              Back to Segments
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const subscriberCount = segmentSubscribers?.length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/subscribers/segments">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <Badge className={segment.isActive
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
              }>
                {subscriberCount.toLocaleString()} Subscribers
              </Badge>
              <h1 className="text-3xl font-bold">{segment.name}</h1>
            </div>
            <p className="text-muted-foreground">
              {segment.description || 'No description provided'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Mail className="h-4 w-4 mr-2" />
            Email Segment
          </Button>
          <Button>
            <Filter className="h-4 w-4 mr-2" />
            Edit Segment
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{subscriberCount.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Active in this segment
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average LTV</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${segmentSubscribers ? 
                    Math.round(segmentSubscribers.reduce((sum: number, sub: any) => sum + (sub.lifetimeValue || 0), 0) / subscriberCount).toLocaleString() :
                    '0'
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Average for this segment
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Status</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {segmentSubscribers ? 
                    Math.round((segmentSubscribers.filter((sub: any) => sub.status === 'active').length / subscriberCount) * 100) :
                    0
                  }%
                </div>
                <p className="text-xs text-muted-foreground">
                  Active subscribers
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Segment Status</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{segment.isActive ? 'Active' : 'Inactive'}</div>
                <p className="text-xs text-muted-foreground">
                  Segment is {segment.isActive ? 'running' : 'paused'}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Segment Criteria</CardTitle>
              <CardDescription>
                Rules that define this subscriber segment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg">
                <div className="text-sm font-mono">
                  <div className="font-semibold mb-2">Operator: {segment.criteria?.operator || 'N/A'}</div>
                  {segment.criteria?.conditions?.map((condition: any, index: number) => (
                    <div key={index} className="ml-4 mb-1">
                      {condition.field} {condition.operator} {JSON.stringify(condition.value)}
                    </div>
                  )) || <div className="text-muted-foreground">No conditions defined</div>}
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Created on {new Date(segment.createdAt).toLocaleDateString()}
              </div>
              {segment.tags && segment.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {segment.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscribers">
          <Card>
            <CardHeader>
              <CardTitle>Segment Subscribers</CardTitle>
              <CardDescription>
                {subscriberCount.toLocaleString()} subscribers match this segment criteria
              </CardDescription>
            </CardHeader>
            <CardContent>
              {subscribersLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                        <div className="space-y-1">
                          <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                          <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                        </div>
                      </div>
                      <div className="h-8 w-24 bg-muted rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : segmentSubscribers && segmentSubscribers.length > 0 ? (
                <div className="space-y-4">
                  {segmentSubscribers.map((subscriber: any) => (
                    <div key={subscriber._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {subscriber.firstName?.[0]}{subscriber.lastName?.[0]}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{subscriber.firstName} {subscriber.lastName}</div>
                          <div className="text-sm text-muted-foreground">{subscriber.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-medium">${subscriber.lifetimeValue?.toLocaleString() || '0'}</div>
                          <div className="text-sm text-muted-foreground">LTV</div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/subscribers/${subscriber._id}`}>
                            View Profile
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No subscribers found</h3>
                  <p className="text-muted-foreground">
                    This segment doesn't match any current subscribers.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Segment Analytics</CardTitle>
              <CardDescription>
                Performance metrics and insights for this segment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-semibold">Subscriber Status Distribution</h4>
                  {segmentSubscribers && (
                    <div className="space-y-1">
                      {['active', 'inactive', 'pending'].map(status => {
                        const count = segmentSubscribers.filter((sub: any) => sub.status === status).length;
                        const percentage = subscriberCount > 0 ? Math.round((count / subscriberCount) * 100) : 0;
                        return (
                          <div key={status} className="flex justify-between text-sm">
                            <span className="capitalize">{status}</span>
                            <span>{count} ({percentage}%)</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">KYC Status Distribution</h4>
                  {segmentSubscribers && (
                    <div className="space-y-1">
                      {['verified', 'pending', 'rejected', 'not_started'].map(status => {
                        const count = segmentSubscribers.filter((sub: any) => sub.kycStatus === status).length;
                        const percentage = subscriberCount > 0 ? Math.round((count / subscriberCount) * 100) : 0;
                        return (
                          <div key={status} className="flex justify-between text-sm">
                            <span className="capitalize">{status.replace('_', ' ')}</span>
                            <span>{count} ({percentage}%)</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Segment Settings</CardTitle>
              <CardDescription>
                Manage segment configuration and rules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Danger Zone</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Once you delete a segment, there is no going back. Please be certain.
                  </p>
                  <Button 
                    variant="destructive" 
                    onClick={handleDeleteSegment}
                    disabled={deleteSegment.isPending}
                  >
                    {deleteSegment.isPending ? 'Deleting...' : 'Delete Segment'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}