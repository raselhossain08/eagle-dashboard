// app/dashboard/subscribers/segments/[segmentId]/page.tsx
'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Users, 
  BarChart3,
  Download,
  Mail,
  Filter,
  Calendar,
  TrendingUp,
  DollarSign,
  Activity,
  RefreshCw,
  AlertTriangle,
  Search,
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  Target,
  Clock
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  useSegment, 
  useSegmentSubscribers, 
  useDeleteSegment,
  useSegmentAnalytics,
  useSegmentStatistics,
  useExportSegmentSubscribers,
  useSendSegmentEmail 
} from '@/hooks/useSubscribers';
import { RoleBasedAccess } from '@/components/auth/RoleBasedAccess';
import { ApiErrorHandler } from '@/components/errors/ApiErrorHandler';

interface SegmentSubscriber {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: 'active' | 'inactive' | 'pending';
  kycStatus: 'verified' | 'pending' | 'rejected' | 'not_started';
  lifetimeValue: number;
  subscriptionTier: string;
  joinDate: string;
  lastActivity: string;
}

interface SegmentAnalytics {
  totalRevenue: number;
  averageLifetimeValue: number;
  conversionRate: number;
  churnRate: number;
  activityStats: {
    active: number;
    inactive: number;
    pending: number;
  };
  kycStats: {
    verified: number;
    pending: number;
    rejected: number;
    not_started: number;
  };
  revenueOverTime: Array<{
    date: string;
    revenue: number;
    subscribers: number;
  }>;
  performanceMetrics: {
    engagementRate: number;
    retentionRate: number;
    growthRate: number;
  };
}

function SegmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const segmentId = params.segmentId as string;
  
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [kycFilter, setKycFilter] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // API hooks
  const { data: segment, isLoading: segmentLoading, error: segmentError, refetch: refetchSegment } = useSegment(segmentId);
  const { data: segmentSubscribers, isLoading: subscribersLoading, error: subscribersError, refetch: refetchSubscribers } = useSegmentSubscribers(segmentId);
  const { data: segmentAnalytics, isLoading: analyticsLoading, error: analyticsError } = useSegmentAnalytics(segmentId);
  const { data: segmentStats, isLoading: statsLoading } = useSegmentStatistics(segmentId);
  
  // Mutations
  const deleteSegment = useDeleteSegment();
  const exportSegment = useExportSegmentSubscribers();
  const sendEmail = useSendSegmentEmail();

  // Enhanced handlers
  const handleDeleteSegment = async () => {
    const confirmMessage = `Are you sure you want to delete "${segment?.name || 'this segment'}"? This action cannot be undone and will remove all segment configurations and analytics.`;
    
    if (confirm(confirmMessage)) {
      try {
        await deleteSegment.mutateAsync(segmentId);
        router.push('/dashboard/subscribers/segments');
      } catch (error: any) {
        console.error('Error deleting segment:', error);
        alert(`Failed to delete segment: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchSegment(),
        refetchSubscribers(),
      ]);
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleExportSegment = async (format: string = 'csv') => {
    try {
      const blob = await exportSegment.mutateAsync({ segmentId, format });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `segment-${segment?.name || segmentId}-subscribers.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Export failed:', error);
      alert(`Export failed: ${error.message || 'Unknown error'}`);
    }
  };

  const handleSendEmail = async () => {
    const subject = prompt('Enter email subject:');
    const content = prompt('Enter email content:');
    
    if (subject && content) {
      try {
        await sendEmail.mutateAsync({
          segmentId,
          emailData: { subject, content }
        });
        alert('Email sent successfully to segment subscribers!');
      } catch (error: any) {
        console.error('Email send failed:', error);
        alert(`Failed to send email: ${error.message || 'Unknown error'}`);
      }
    }
  };

  // Filter subscribers
  const filteredSubscribers = React.useMemo(() => {
    if (!segmentSubscribers) return [];

    return segmentSubscribers.filter((subscriber: any) => {
      const matchesSearch = searchQuery === '' || 
        subscriber.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subscriber.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subscriber.email?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || subscriber.status === statusFilter;
      const matchesKyc = kycFilter === 'all' || subscriber.kycStatus === kycFilter;

      return matchesSearch && matchesStatus && matchesKyc;
    });
  }, [segmentSubscribers, searchQuery, statusFilter, kycFilter]);

  // Error handling
  if (segmentError || subscribersError || analyticsError) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/subscribers/segments">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Segment Details</h1>
              <p className="text-muted-foreground">Error loading segment data</p>
            </div>
          </div>
        </div>
        <ApiErrorHandler 
          error={segmentError || subscribersError || analyticsError} 
          retry={handleRefresh}
          className="mx-auto max-w-md"
        />
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
    <RoleBasedAccess 
      requiredRoles={['super_admin', 'finance_admin']}
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold">Access Restricted</h3>
              <p className="text-muted-foreground">
                You need admin permissions to view segment details.
              </p>
            </div>
            <Button asChild>
              <Link href="/dashboard/subscribers/segments">
                Back to Segments
              </Link>
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Enhanced Header */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/subscribers/segments">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge className={segment?.isActive
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                }>
                  {segment?.isActive ? 'Active' : 'Inactive'}
                </Badge>
                <Badge variant="outline">
                  <Users className="h-3 w-3 mr-1" />
                  {filteredSubscribers.length.toLocaleString()} Subscribers
                </Badge>
              </div>
              <h1 className="text-3xl font-bold">{segment?.name || 'Loading...'}</h1>
              <p className="text-muted-foreground mt-1">
                {segment?.description || 'No description provided'}
              </p>
              {segment && (
                <p className="text-sm text-muted-foreground mt-2">
                  Created {new Date(segment.createdAt).toLocaleDateString()} • 
                  Last updated {new Date(segment.updatedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleExportSegment('csv')}>
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportSegment('xlsx')}>
                  Export as Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportSegment('json')}>
                  Export as JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button 
              variant="outline" 
              size="sm"
              onClick={handleSendEmail}
              disabled={sendEmail.isPending}
            >
              <Mail className="h-4 w-4 mr-2" />
              {sendEmail.isPending ? 'Sending...' : 'Email Segment'}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit Segment
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Target className="mr-2 h-4 w-4" />
                  Duplicate Segment
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive"
                  onClick={handleDeleteSegment}
                  disabled={deleteSegment.isPending}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {deleteSegment.isPending ? 'Deleting...' : 'Delete Segment'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="subscribers">
              Subscribers ({filteredSubscribers.length})
            </TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Real-time Statistics Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <div className="h-8 bg-muted animate-pulse rounded mb-1" />
                  ) : (
                    <div className="text-2xl font-bold">
                      {filteredSubscribers.length.toLocaleString()}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Active in this segment
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average LTV</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {analyticsLoading ? (
                    <div className="h-8 bg-muted animate-pulse rounded mb-1" />
                  ) : (
                    <div className="text-2xl font-bold">
                      ${segmentAnalytics?.averageLifetimeValue?.toLocaleString() || 
                        (filteredSubscribers.length > 0 ? 
                          Math.round(filteredSubscribers.reduce((sum: number, sub: any) => 
                            sum + (sub.lifetimeValue || 0), 0) / filteredSubscribers.length).toLocaleString() : 
                          '0')}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Average for this segment
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {analyticsLoading ? (
                    <div className="h-8 bg-muted animate-pulse rounded mb-1" />
                  ) : (
                    <div className="text-2xl font-bold">
                      {segmentAnalytics?.conversionRate ? 
                        `${(segmentAnalytics.conversionRate * 100).toFixed(1)}%` :
                        `${filteredSubscribers.length > 0 ? 
                          Math.round((filteredSubscribers.filter(sub => sub.status === 'active').length / filteredSubscribers.length) * 100) : 
                          0}%`
                      }
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Active conversion rate
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {analyticsLoading ? (
                    <div className="h-8 bg-muted animate-pulse rounded mb-1" />
                  ) : (
                    <div className="text-2xl font-bold">
                      ${segmentAnalytics?.totalRevenue?.toLocaleString() || 
                        filteredSubscribers.reduce((sum: number, sub: any) => 
                          sum + (sub.lifetimeValue || 0), 0).toLocaleString()}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Segment total revenue
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Performance Metrics */}
            {segmentAnalytics?.performanceMetrics && (
              <div className="grid gap-6 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {(segmentAnalytics.performanceMetrics.engagementRate * 100).toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Average user engagement
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {(segmentAnalytics.performanceMetrics.retentionRate * 100).toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      User retention rate
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">
                      {(segmentAnalytics.performanceMetrics.growthRate * 100).toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Month-over-month growth
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

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
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle>Segment Subscribers</CardTitle>
                    <CardDescription>
                      {filteredSubscribers.length.toLocaleString()} subscribers match this segment criteria
                    </CardDescription>
                  </div>
                  
                  {/* Enhanced Filters */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search subscribers..."
                        className="w-full sm:w-64 pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={kycFilter} onValueChange={setKycFilter}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="KYC" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All KYC</SelectItem>
                        <SelectItem value="verified">Verified</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="not_started">Not Started</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {subscribersLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 8 }).map((_, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                          <div className="space-y-2">
                            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                            <div className="h-3 w-48 bg-muted rounded animate-pulse" />
                            <div className="flex gap-2">
                              <div className="h-5 w-16 bg-muted rounded animate-pulse" />
                              <div className="h-5 w-20 bg-muted rounded animate-pulse" />
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right space-y-1">
                            <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                            <div className="h-3 w-12 bg-muted rounded animate-pulse" />
                          </div>
                          <div className="h-8 w-24 bg-muted rounded animate-pulse" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredSubscribers.length > 0 ? (
                  <div className="space-y-4">
                    {filteredSubscribers.map((subscriber: any) => (
                      <div key={subscriber._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                            <span className="text-sm">
                              {subscriber.firstName?.[0]?.toUpperCase()}{subscriber.lastName?.[0]?.toUpperCase()}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <div className="font-medium">
                              {subscriber.firstName} {subscriber.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">{subscriber.email}</div>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={subscriber.status === 'active' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {subscriber.status}
                              </Badge>
                              <Badge 
                                variant={subscriber.kycStatus === 'verified' ? 'default' : 'outline'}
                                className="text-xs"
                              >
                                KYC: {subscriber.kycStatus?.replace('_', ' ')}
                              </Badge>
                              {subscriber.subscriptionTier && (
                                <Badge variant="outline" className="text-xs">
                                  {subscriber.subscriptionTier}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className="font-semibold text-green-600">
                              ${subscriber.lifetimeValue?.toLocaleString() || '0'}
                            </div>
                            <div className="text-xs text-muted-foreground">Lifetime Value</div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {subscriber.joinDate ? new Date(subscriber.joinDate).toLocaleDateString() : 'N/A'}
                            </div>
                            <div className="text-xs text-muted-foreground">Join Date</div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-sm">
                              <Clock className="h-3 w-3 inline mr-1" />
                              {subscriber.lastActivity ? new Date(subscriber.lastActivity).toLocaleDateString() : 'Never'}
                            </div>
                            <div className="text-xs text-muted-foreground">Last Activity</div>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/subscribers/${subscriber._id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Profile
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/subscribers/${subscriber._id}/edit`}>
                                  <Edit2 className="mr-2 h-4 w-4" />
                                  Edit Subscriber
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Mail className="mr-2 h-4 w-4" />
                                Send Email
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      {searchQuery || statusFilter !== 'all' || kycFilter !== 'all' 
                        ? 'No matching subscribers' 
                        : 'No subscribers found'
                      }
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery || statusFilter !== 'all' || kycFilter !== 'all' 
                        ? 'Try adjusting your search criteria or filters.' 
                        : 'This segment doesn\'t match any current subscribers.'
                      }
                    </p>
                    {(searchQuery || statusFilter !== 'all' || kycFilter !== 'all') && (
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setSearchQuery('');
                          setStatusFilter('all');
                          setKycFilter('all');
                        }}
                      >
                        Clear Filters
                      </Button>
                    )}
                  </div>
                )}
            </CardContent>
          </Card>
        </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Analytics Overview Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  {analyticsLoading ? (
                    <div className="h-6 bg-muted animate-pulse rounded mb-1" />
                  ) : (
                    <div className="text-2xl font-bold text-red-600">
                      {segmentAnalytics?.churnRate ? 
                        `${(segmentAnalytics.churnRate * 100).toFixed(1)}%` : 
                        '0.0%'
                      }
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Monthly churn rate
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Avg. Engagement</CardTitle>
                </CardHeader>
                <CardContent>
                  {analyticsLoading ? (
                    <div className="h-6 bg-muted animate-pulse rounded mb-1" />
                  ) : (
                    <div className="text-2xl font-bold text-blue-600">
                      {segmentAnalytics?.performanceMetrics?.engagementRate ? 
                        `${(segmentAnalytics.performanceMetrics.engagementRate * 100).toFixed(1)}%` : 
                        '0.0%'
                      }
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    User engagement rate
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  {analyticsLoading ? (
                    <div className="h-6 bg-muted animate-pulse rounded mb-1" />
                  ) : (
                    <div className="text-2xl font-bold text-green-600">
                      ${segmentAnalytics?.revenueOverTime?.length > 0 ? 
                        segmentAnalytics.revenueOverTime[segmentAnalytics.revenueOverTime.length - 1]?.revenue?.toLocaleString() : 
                        '0'
                      }
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Current month revenue
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  {analyticsLoading ? (
                    <div className="h-6 bg-muted animate-pulse rounded mb-1" />
                  ) : (
                    <div className="text-2xl font-bold text-purple-600">
                      {segmentAnalytics?.performanceMetrics?.growthRate ? 
                        `${(segmentAnalytics.performanceMetrics.growthRate * 100).toFixed(1)}%` : 
                        '0.0%'
                      }
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Month-over-month growth
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Status Distribution Cards */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Subscriber Status Distribution</CardTitle>
                  <CardDescription>
                    Breakdown by subscriber activity status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {filteredSubscribers.length > 0 ? (
                    <div className="space-y-3">
                      {['active', 'inactive', 'pending'].map(status => {
                        const count = filteredSubscribers.filter((sub: any) => sub.status === status).length;
                        const percentage = count > 0 ? Math.round((count / filteredSubscribers.length) * 100) : 0;
                        const color = status === 'active' ? 'bg-green-500' : status === 'pending' ? 'bg-yellow-500' : 'bg-gray-500';
                        
                        return (
                          <div key={status} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="capitalize font-medium">{status}</span>
                              <span>{count} ({percentage}%)</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`${color} h-2 rounded-full transition-all duration-300`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No data available
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>KYC Status Distribution</CardTitle>
                  <CardDescription>
                    Breakdown by KYC verification status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {filteredSubscribers.length > 0 ? (
                    <div className="space-y-3">
                      {['verified', 'pending', 'rejected', 'not_started'].map(status => {
                        const count = filteredSubscribers.filter((sub: any) => sub.kycStatus === status).length;
                        const percentage = count > 0 ? Math.round((count / filteredSubscribers.length) * 100) : 0;
                        const color = status === 'verified' ? 'bg-green-500' : 
                                     status === 'pending' ? 'bg-yellow-500' : 
                                     status === 'rejected' ? 'bg-red-500' : 'bg-gray-500';
                        
                        return (
                          <div key={status} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="capitalize font-medium">{status.replace('_', ' ')}</span>
                              <span>{count} ({percentage}%)</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`${color} h-2 rounded-full transition-all duration-300`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Revenue Over Time Chart */}
            {segmentAnalytics?.revenueOverTime && segmentAnalytics.revenueOverTime.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trends</CardTitle>
                  <CardDescription>
                    Revenue and subscriber growth over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          ${segmentAnalytics.revenueOverTime.reduce((sum: number, item: any) => sum + (item.revenue || 0), 0).toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">Total Revenue</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {Math.round(segmentAnalytics.revenueOverTime.reduce((sum: number, item: any) => sum + (item.revenue || 0), 0) / segmentAnalytics.revenueOverTime.length).toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">Avg Monthly Revenue</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">
                          {segmentAnalytics.revenueOverTime[segmentAnalytics.revenueOverTime.length - 1]?.subscribers?.toLocaleString() || '0'}
                        </div>
                        <div className="text-sm text-muted-foreground">Current Subscribers</div>
                      </div>
                    </div>
                    
                    <div className="text-center py-8 text-muted-foreground">
                      <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                      <p>Revenue chart visualization would be implemented here</p>
                      <p className="text-sm">Using Recharts or similar charting library</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
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
    </RoleBasedAccess>
  );
}

export default SegmentDetailPage;