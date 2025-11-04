'use client';

import { useState, use } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Download, Filter, AlertCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useUsers, useUpdateUserStatus, useDeleteUser } from '@/hooks/useUsers';
import { UserMetrics } from '@/components/users/UserMetrics';
import { UsersTable } from '@/components/users/UsersTable';
import { UserSearch } from '@/components/users/UserSearch';
import { UserFilters } from '@/components/users/UserFilters';
import { CustomPagination } from '@/components/users/CustomPagination';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

interface UsersDashboardProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    sort?: string;
  }>;
}

export default function UsersDashboard({ searchParams }: UsersDashboardProps) {
  const router = useRouter();
  const urlSearchParams = useSearchParams();
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Unwrap the searchParams promise
  const resolvedSearchParams = use(searchParams);
  
  const currentPage = parseInt(resolvedSearchParams.page || '1');
  const pageSize = 10;
  
  const { 
    data: usersData, 
    isLoading, 
    error, 
    refetch,
    isRefetching 
  } = useUsers({
    page: currentPage,
    pageSize,
    search: resolvedSearchParams.search || '',
    status: resolvedSearchParams.status || '',
    sort: resolvedSearchParams.sort || 'createdAt_desc'
  }) as {
    data: {
      users: any[];
      totalCount: number;
      totalPages: number;
      page: number;
      pageSize: number;
    } | undefined;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
    isRefetching: boolean;
  };

  const updateUserStatus = useUpdateUserStatus();
  const deleteUser = useDeleteUser();

  // Debug: Log the data being passed to the table
  console.log('UsersData:', usersData);
  console.log('Users array:', usersData?.users);
  console.log('Users array length:', usersData?.users?.length);

  const handleStatusUpdate = async (userId: string, status: string) => {
    try {
      await updateUserStatus.mutateAsync({ id: userId, status });
      toast.success(`User status updated to ${status}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser.mutateAsync(userId);
      toast.success('User deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete user');
    }
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(urlSearchParams.toString());
    params.set('page', page.toString());
    router.push(`/dashboard/users?${params.toString()}`);
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    toast.info('Export functionality coming soon');
  };

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage your users and their profiles
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
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Link href="/dashboard/users/create">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </Link>
        </div>
      </div>

      {/* User Metrics */}
      <UserMetrics />

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load users: {error.message}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                View and manage all users in the system
                {usersData && (
                  <span className="ml-2 text-sm">
                    ({usersData.totalCount} total users)
                  </span>
                )}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* User Search */}
          <UserSearch />
          
          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <UserFilters />
          )}
          
          {/* Users Table */}
          <UsersTable 
            data={usersData?.users || []}
            isLoading={isLoading}
            totalCount={usersData?.totalCount || 0}
            onStatusUpdate={handleStatusUpdate}
            onDelete={handleDeleteUser}
          />
          
          {/* Pagination */}
          {usersData && usersData.totalPages > 1 && (
            <div className="flex justify-center">
              <CustomPagination
                currentPage={currentPage}
                totalPages={usersData.totalPages}
                onPageChange={handlePageChange}
                showPreviousNext
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}