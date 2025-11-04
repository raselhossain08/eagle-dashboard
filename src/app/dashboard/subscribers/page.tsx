// app/dashboard/subscribers/page.tsx
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  Users, 
  TrendingUp, 
  Activity, 
  DollarSign,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Filter,
  Download,
  Plus,
  AlertTriangle,
  Calendar,
  Target,
  BarChart3,
  Mail
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSubscribers, useDeleteSubscriber, useUpdateSubscriber } from '@/hooks/useSubscribers';
import { subscribersService } from '@/lib/api/subscribers';
import { SubscriberProfile } from '@/types/subscribers';
import { useQuery } from '@tanstack/react-query';
import { RoleBasedAccess } from '@/components/auth/RoleBasedAccess';
import { ApiErrorHandler } from '@/components/errors/ApiErrorHandler';
import Link from 'next/link';

function SubscribersDashboard() {
  // Enhanced state management
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [kycFilter, setKycFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [pageSize, setPageSize] = useState(10);

  // Build filters object
  const filters = React.useMemo(() => {
    const filterObj: any = {};
    if (statusFilter !== 'all') filterObj.status = [statusFilter];
    if (kycFilter !== 'all') filterObj.kycStatus = [kycFilter];
    return { ...filterObj };
  }, [statusFilter, kycFilter]);

  // API calls with enhanced parameters
  const { 
    data, 
    isLoading, 
    error, 
    refetch: refetchSubscribers 
  } = useSubscribers({
    search: searchQuery,
    page: currentPage,
    limit: pageSize,
    filters,
    sortBy,
    sortOrder,
  });

  // Mutations
  const deleteSubscriber = useDeleteSubscriber();
  const updateSubscriber = useUpdateSubscriber();

  // Enhanced analytics with error handling
  const { 
    data: analyticsData, 
    isLoading: analyticsLoading, 
    error: analyticsError,
    refetch: refetchAnalytics 
  } = useQuery({
    queryKey: ['subscriber-analytics'],
    queryFn: () => subscribersService.getSubscriberAnalytics(),
    retry: 3,
    refetchOnWindowFocus: false,
  });

  // Enhanced handlers
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchSubscribers(),
        refetchAnalytics(),
      ]);
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleDeleteSubscriber = async (subscriberId: string, subscriberName: string) => {
    const confirmMessage = `Are you sure you want to delete "${subscriberName}"? This action cannot be undone and will remove all subscriber data, subscriptions, and activities.`;
    
    if (confirm(confirmMessage)) {
      try {
        await deleteSubscriber.mutateAsync(subscriberId);
      } catch (error: any) {
        console.error('Error deleting subscriber:', error);
        alert(`Failed to delete subscriber: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const handleStatusUpdate = async (subscriberId: string, newStatus: 'active' | 'inactive' | 'pending') => {
    try {
      await updateSubscriber.mutateAsync({
        id: subscriberId,
        data: { status: newStatus }
      });
    } catch (error: any) {
      console.error('Error updating status:', error);
      alert(`Failed to update status: ${error.message || 'Unknown error'}`);
    }
  };

  const handleExportSubscribers = async (format: string = 'csv') => {
    try {
      const blob = await subscribersService.exportSubscribers(format, [], 
        data?.subscribers?.map(sub => sub.id) || []);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `subscribers-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Export failed:', error);
      alert(`Export failed: ${error.message || 'Unknown error'}`);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    };
    return variants[status as keyof typeof variants] || variants.inactive;
  };

  const getKycBadge = (kycStatus: string) => {
    const variants = {
      verified: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      not_started: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    };
    return variants[kycStatus as keyof typeof variants] || variants.not_started;
  };

  // Enhanced stats with real calculations
  const stats = React.useMemo(() => {
    const totalSubscribers = analyticsData?.totalSubscribers || 0;
    const activeSubscribers = analyticsData?.activeSubscribers || 0;
    const newLast30Days = analyticsData?.newSubscribersLast30Days || 0;
    const newLast7Days = analyticsData?.newSubscribersLast7Days || 0;
    const averageLTV = analyticsData?.averageLifetimeValue || 0;
    const churnRate = analyticsData?.churnRate || 0;
    const conversionRate = analyticsData?.conversionRate || 0;
    const monthlyRevenue = analyticsData?.monthlyRecurringRevenue || 0;

    return [
      {
        title: 'Total Subscribers',
        value: totalSubscribers.toLocaleString(),
        description: newLast30Days > 0 ? `+${newLast30Days} in last 30 days` : 'No new subscribers',
        icon: Users,
        color: 'text-blue-600',
        trend: newLast30Days > 0 ? 'up' : 'neutral',
      },
      {
        title: 'Active Subscribers',
        value: activeSubscribers.toLocaleString(),
        description: totalSubscribers > 0 ? 
          `${Math.round((activeSubscribers / totalSubscribers) * 100)}% of total` : 
          '0% of total',
        icon: Activity,
        color: 'text-green-600',
        trend: 'neutral',
      },
      {
        title: 'Weekly Growth',
        value: newLast7Days > 0 ? `+${newLast7Days}` : '0',
        description: `${newLast30Days} this month`,
        icon: TrendingUp,
        color: 'text-purple-600',
        trend: newLast7Days > 0 ? 'up' : 'neutral',
      },
      {
        title: 'Monthly Revenue',
        value: `$${monthlyRevenue.toLocaleString()}`,
        description: `$${averageLTV.toLocaleString()} avg LTV`,
        icon: DollarSign,
        color: 'text-orange-600',
        trend: monthlyRevenue > 0 ? 'up' : 'neutral',
      },
      {
        title: 'Conversion Rate',
        value: `${(conversionRate * 100).toFixed(1)}%`,
        description: 'Active conversion rate',
        icon: Target,
        color: 'text-indigo-600',
        trend: conversionRate > 0.5 ? 'up' : 'down',
      },
      {
        title: 'Churn Rate',
        value: `${(churnRate * 100).toFixed(1)}%`,
        description: 'Monthly churn rate',
        icon: BarChart3,
        color: churnRate > 0.05 ? 'text-red-600' : 'text-green-600',
        trend: churnRate > 0.05 ? 'down' : 'up',
      },
    ];
  }, [analyticsData]);

  // Enhanced error handling
  if (error || analyticsError) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Subscribers</h1>
            <p className="text-muted-foreground">Error loading subscriber data</p>
          </div>
        </div>
        <ApiErrorHandler 
          error={error || analyticsError} 
          retry={handleRefresh}
          className="mx-auto max-w-md"
        />
      </div>
    );
  }

  return (
    <RoleBasedAccess 
      requiredRoles={['super_admin', 'finance_admin', 'support']}
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold">Access Restricted</h3>
              <p className="text-muted-foreground">
                You need appropriate permissions to manage subscribers.
              </p>
            </div>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Enhanced Header */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Subscribers Dashboard</h1>
            <p className="text-muted-foreground">
              Comprehensive subscriber management and analytics
            </p>
            {data && (
              <p className="text-sm text-muted-foreground mt-1">
                {data.totalCount.toLocaleString()} total subscribers • {data.subscribers.length} shown
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
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleExportSubscribers('csv')}>
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportSubscribers('xlsx')}>
                  Export as Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportSubscribers('json')}>
                  Export as JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button size="sm" asChild>
              <Link href="/dashboard/subscribers/create">
                <Plus className="h-4 w-4 mr-2" />
                Add Subscriber
              </Link>
            </Button>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {stats.map((stat, index) => (
            <Card key={index} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className="flex items-center gap-1">
                  {stat.trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
                  {stat.trend === 'down' && <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />}
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div className="space-y-2">
                    <div className="h-8 bg-muted animate-pulse rounded" />
                    <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                  </>
                )}
              </CardContent>
              {/* Trend indicator */}
              <div className={`absolute top-0 right-0 w-1 h-full ${
                stat.trend === 'up' ? 'bg-green-500' : 
                stat.trend === 'down' ? 'bg-red-500' : 'bg-gray-300'
              }`} />
            </Card>
          ))}
        </div>

        {/* Enhanced Search and Filters */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Subscriber Management</CardTitle>
                <CardDescription>
                  Advanced subscriber management with real-time data and comprehensive filtering
                </CardDescription>
              </div>
              
              {/* Advanced Filters */}
              <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
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

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Created Date</SelectItem>
                    <SelectItem value="firstName">Name</SelectItem>
                    <SelectItem value="lifetimeValue">LTV</SelectItem>
                    <SelectItem value="lastActivity">Last Activity</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Data Status Alert */}
            {data && data.totalCount === 0 && !searchQuery && statusFilter === 'all' && kycFilter === 'all' && (
              <Alert className="mb-6">
                <Users className="h-4 w-4" />
                <AlertDescription>
                  No subscribers found. Start by adding your first subscriber to the system.
                </AlertDescription>
              </Alert>
            )}

            {/* Enhanced Subscribers Table */}
            <div className="rounded-md border">
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="[&_tr]:border-b">
                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        Subscriber Info
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        Status
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        KYC Status
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        Lifetime Value
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        Join Date
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        Last Activity
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {isLoading ? (
                      Array.from({ length: pageSize }).map((_, index) => (
                        <tr key={index} className="border-b transition-colors hover:bg-muted/50">
                          <td className="p-4 align-middle">
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
                              <div className="space-y-2">
                                <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                                <div className="h-3 w-48 bg-muted rounded animate-pulse" />
                                <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                              </div>
                            </div>
                          </td>
                          {Array.from({ length: 6 }).map((_, cellIndex) => (
                            <td key={cellIndex} className="p-4 align-middle">
                              <div className="h-6 w-16 bg-muted rounded animate-pulse" />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : data?.subscribers && data.subscribers.length > 0 ? (
                      data.subscribers.map((subscriber: SubscriberProfile) => (
                        <tr key={subscriber.id} className="border-b transition-colors hover:bg-muted/50 group">
                          <td className="p-4 align-middle">
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                                <span className="text-sm">
                                  {subscriber.firstName?.[0]?.toUpperCase()}{subscriber.lastName?.[0]?.toUpperCase()}
                                </span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-semibold">
                                  {subscriber.firstName} {subscriber.lastName}
                                </div>
                                <div className="text-sm text-muted-foreground truncate">
                                  {subscriber.email}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  ID: {subscriber.id}
                                </div>
                              </div>
                            </div>
                          </td>
                          
                          <td className="p-4 align-middle">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <div className="cursor-pointer">
                                  <Badge className={getStatusBadge(subscriber.status)}>
                                    {subscriber.status}
                                  </Badge>
                                </div>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => handleStatusUpdate(subscriber.id, 'active')}>
                                  Set Active
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusUpdate(subscriber.id, 'inactive')}>
                                  Set Inactive
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusUpdate(subscriber.id, 'pending')}>
                                  Set Pending
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                          
                          <td className="p-4 align-middle">
                            <Badge className={getKycBadge(subscriber.kycStatus)}>
                              {subscriber.kycStatus?.replace('_', ' ')}
                            </Badge>
                          </td>
                          
                          <td className="p-4 align-middle">
                            <div className="font-semibold text-green-600">
                              ${subscriber.lifetimeValue?.toLocaleString() || '0'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Lifetime Value
                            </div>
                          </td>
                          
                          <td className="p-4 align-middle">
                            <div className="text-sm">
                              {subscriber.createdAt ? 
                                new Date(subscriber.createdAt).toLocaleDateString() : 
                                'N/A'
                              }
                            </div>
                            <div className="text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3 inline mr-1" />
                              Join Date
                            </div>
                          </td>
                          
                          <td className="p-4 align-middle">
                            <div className="text-sm">
                              {subscriber.lastActivity ? 
                                new Date(subscriber.lastActivity).toLocaleDateString() : 
                                'Never'
                              }
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Last seen
                            </div>
                          </td>
                          
                          <td className="p-4 align-middle">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/dashboard/subscribers/${subscriber.id}`}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Profile
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/dashboard/subscribers/${subscriber.id}/edit`}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Subscriber
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <Mail className="h-4 w-4 mr-2" />
                                  Send Email
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Activity className="h-4 w-4 mr-2" />
                                  View Activity
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onClick={() => handleDeleteSubscriber(subscriber.id, `${subscriber.firstName} ${subscriber.lastName}`)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="p-12 text-center">
                          <div className="flex flex-col items-center justify-center space-y-4">
                            <Users className="h-16 w-16 text-muted-foreground" />
                            <div>
                              <h3 className="text-lg font-semibold mb-2">
                                {searchQuery || statusFilter !== 'all' || kycFilter !== 'all' 
                                  ? 'No matching subscribers' 
                                  : 'No subscribers found'
                                }
                              </h3>
                              <p className="text-muted-foreground mb-4">
                                {searchQuery || statusFilter !== 'all' || kycFilter !== 'all' 
                                  ? 'Try adjusting your search criteria or filters.' 
                                  : 'Get started by adding your first subscriber.'
                                }
                              </p>
                              {(searchQuery || statusFilter !== 'all' || kycFilter !== 'all') ? (
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
                              ) : (
                                <Button asChild>
                                  <Link href="/dashboard/subscribers/create">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add First Subscriber
                                  </Link>
                                </Button>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Enhanced Pagination */}
            {data && data.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
                <div className="flex items-center gap-2">
                  <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 rows</SelectItem>
                      <SelectItem value="25">25 rows</SelectItem>
                      <SelectItem value="50">50 rows</SelectItem>
                      <SelectItem value="100">100 rows</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, data.totalCount)} of {data.totalCount} subscribers
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  >
                    First
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  
                  {/* Page Numbers */}
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
                      const pageNum = currentPage <= 3 ? i + 1 : 
                                     currentPage >= data.totalPages - 2 ? data.totalPages - 4 + i :
                                     currentPage - 2 + i;
                      
                      if (pageNum < 1 || pageNum > data.totalPages) return null;
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, data.totalPages))}
                    disabled={currentPage === data.totalPages}
                  >
                    Next
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(data.totalPages)}
                    disabled={currentPage === data.totalPages}
                  >
                    Last
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      </RoleBasedAccess>
    );
  }

  export default SubscribersDashboard;