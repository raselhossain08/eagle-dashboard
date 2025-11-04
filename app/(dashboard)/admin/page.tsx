
'use client';

import React from 'react';
import { usePermissions } from '@/hooks/use-permissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  BarChart3, 
  Shield, 
  DollarSign, 
  TrendingUp, 
  Activity,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface DashboardStat {
  title: string;
  value: string;
  icon: React.ReactNode;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  permission?: string;
}

const DashboardPage = () => {
  const { hasPermission, userRole, userPermissions, isLoading } = usePermissions();

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-6 w-16 mb-1" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const dashboardStats: DashboardStat[] = [
    {
      title: "Total Users",
      value: "1,234",
      icon: <Users className="h-4 w-4 text-blue-600" />,
      change: "+12%",
      trend: 'up',
      permission: 'users:read'
    },
    {
      title: "Revenue",
      value: "$45,231",
      icon: <DollarSign className="h-4 w-4 text-green-600" />,
      change: "+23%",
      trend: 'up',
      permission: 'billing:manage'
    },
    {
      title: "Analytics",
      value: "98.5%",
      icon: <BarChart3 className="h-4 w-4 text-purple-600" />,
      change: "+2%",
      trend: 'up',
      permission: 'analytics:read'
    },
    {
      title: "System Health",
      value: "99.9%",
      icon: <Activity className="h-4 w-4 text-emerald-600" />,
      change: "0%",
      trend: 'neutral',
      permission: 'system:read'
    }
  ];

  const visibleStats = dashboardStats.filter(stat => 
    !stat.permission || hasPermission(stat.permission)
  );

  const getWelcomeMessage = () => {
    const roleMessages = {
      superadmin: "You have full system access and security management privileges.",
      finance_admin: "Manage billing, invoices, and financial reports.",
      growth_marketing: "Drive growth through campaigns and analytics.",
      support: "Assist users with account management and support.",
      admin: "Manage users and oversee system operations.",
      read_only: "View system data and reports.",
      user: "Welcome to your dashboard."
    };

    return roleMessages[userRole as keyof typeof roleMessages] || roleMessages.user;
  };

  const getRoleBadgeVariant = (role: string) => {
    const variants = {
      superadmin: 'destructive',
      finance_admin: 'default',
      growth_marketing: 'secondary',
      support: 'outline',
      admin: 'default',
      read_only: 'secondary',
      user: 'outline'
    } as const;

    return variants[role as keyof typeof variants] || 'outline';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'down':
        return <AlertTriangle className="h-3 w-3 text-red-600" />;
      default:
        return <CheckCircle className="h-3 w-3 text-gray-600" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {getWelcomeMessage()}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={getRoleBadgeVariant(userRole) as any}>
              <Shield className="h-3 w-3 mr-1" />
              {userRole.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {visibleStats.map((stat, index) => (
          <Card key={index} className="transition-all duration-200 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {stat.title}
              </CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </div>
              <div className="flex items-center space-x-1 text-xs text-gray-600 dark:text-gray-400">
                {getTrendIcon(stat.trend)}
                <span>{stat.change} from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Permission Overview for Super Admin */}
      {hasPermission('system:full_access') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Permission Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Active Permissions: {userPermissions.length}
              </p>
              <div className="flex flex-wrap gap-1">
                {userPermissions.slice(0, 10).map((permission, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {permission}
                  </Badge>
                ))}
                {userPermissions.length > 10 && (
                  <Badge variant="secondary" className="text-xs">
                    +{userPermissions.length - 10} more
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions based on role */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {hasPermission('users:manage') && (
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Manage user accounts, roles, and permissions.
              </p>
              <div className="space-y-2">
                <button className="w-full text-left p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-sm">
                  View All Users
                </button>
                <button className="w-full text-left p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-sm">
                  Manage Roles
                </button>
                <button className="w-full text-left p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-sm">
                  Permission Settings
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {hasPermission('billing:manage') && (
          <Card>
            <CardHeader>
              <CardTitle>Financial Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Handle billing, invoices, and financial reports.
              </p>
              <div className="space-y-2">
                <button className="w-full text-left p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-sm">
                  View Invoices
                </button>
                <button className="w-full text-left p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-sm">
                  Process Refunds
                </button>
                <button className="w-full text-left p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-sm">
                  Financial Reports
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {hasPermission('campaigns:manage') && (
          <Card>
            <CardHeader>
              <CardTitle>Marketing Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Create and manage marketing campaigns.
              </p>
              <div className="space-y-2">
                <button className="w-full text-left p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-sm">
                  Active Campaigns
                </button>
                <button className="w-full text-left p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-sm">
                  Manage Discounts
                </button>
                <button className="w-full text-left p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-sm">
                  Announcements
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {hasPermission('subscribers:lookup') && (
          <Card>
            <CardHeader>
              <CardTitle>Support Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Customer support and account management.
              </p>
              <div className="space-y-2">
                <button className="w-full text-left p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-sm">
                  Subscriber Lookup
                </button>
                <button className="w-full text-left p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-sm">
                  Plan Changes
                </button>
                <button className="w-full text-left p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-sm">
                  Resend Receipts
                </button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;