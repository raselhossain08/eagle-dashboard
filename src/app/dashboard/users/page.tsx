// app/dashboard/users/page.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { UsersTable } from '../components/UsersTable';
// import { UserMetrics } from '../components/UserMetrics';
// import { UserSearch } from '../components/UserSearch';
// import { UserFilters } from '../components/UserFilters';
import { Button } from '@/components/ui/button';
import { Plus, Download, Filter, Users } from 'lucide-react';
import Link from 'next/link';
import { useUsers } from '@/hooks/useUsers';

interface UsersDashboardProps {
  searchParams: {
    page?: string;
    search?: string;
    status?: string;
    sort?: string;
  };
}

export default function UsersDashboard({ searchParams }: UsersDashboardProps) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  const { data: usersData, isLoading, error } = useUsers({
    page: parseInt(searchParams.page || '1'),
    search: searchParams.search || '',
    status: searchParams.status || '',
    sort: searchParams.sort || 'createdAt_desc'
  });

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
          <Button variant="outline" size="sm">
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
      <Card>
        <CardHeader>
          <CardTitle>User Metrics</CardTitle>
          <CardDescription>
            Overview of user statistics and trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">User Metrics</h3>
            <p className="text-muted-foreground">
              User metrics will be displayed here.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                View and manage all users in the system
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
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <input 
                placeholder="Search users..." 
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <Button variant="outline" onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}>
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
          
          {/* User Filters */}
          {showAdvancedFilters && (
            <div className="p-4 border rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Advanced filters will be displayed here.</p>
            </div>
          )}
          
          {/* Users Table */}
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Users Table</h3>
            <p className="text-muted-foreground">
              Users table will be displayed here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}