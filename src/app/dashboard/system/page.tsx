// src/app/dashboard/system/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useSystemHealth, useSystemStats, useWebhookStats } from '@/hooks/useSystem';
import { SystemOverview } from '@/components/system/SystemOverview';
import { HealthMonitor } from '@/components/system/HealthMonitor';
import { AlertsPanel } from '@/components/system/AlertsPanel';
import { SystemMetrics } from '@/components/system/RealTimeMetrics';
import { 
  RefreshCw, 
  Users, 
  CreditCard, 
  Zap, 
  Activity,
  TrendingUp,
  TrendingDown,
  Settings,
  Shield,
  Database,
  Server
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function SystemDashboard() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { 
    data: health, 
    isLoading: healthLoading, 
    error: healthError,
    refetch: refetchHealth 
  } = useSystemHealth();
  
  const { 
    data: stats, 
    isLoading: statsLoading, 
    error: statsError,
    refetch: refetchStats 
  } = useSystemStats();

  const { 
    data: webhookStats, 
    isLoading: webhookLoading,
    refetch: refetchWebhooks
  } = useWebhookStats();

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refetchHealth();
      refetchStats();
      refetchWebhooks();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, refetchHealth, refetchStats, refetchWebhooks]);

  // Manual refresh all data
  const handleRefreshAll = async () => {
    try {
      await Promise.all([
        refetchHealth(),
        refetchStats(),
        refetchWebhooks()
      ]);
      toast.success('System data refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh system data');
    }
  };

  // Loading skeleton
  if (healthLoading || statsLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="animate-pulse">
          <Skeleton className="h-8 w-1/3 mb-2" />
          <Skeleton className="h-4 w-2/3 mb-6" />
          
          <Skeleton className="h-48 w-full mb-6" />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Skeleton className="h-80 lg:col-span-2" />
            <Skeleton className="h-80" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (healthError || statsError) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <Server className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Unable to Load System Data
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            There was an error loading the system dashboard. Please try again.
          </p>
          <Button onClick={handleRefreshAll}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            System Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor and manage your system health, settings, and maintenance operations
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Activity className={`h-4 w-4 mr-2 ${autoRefresh ? 'text-green-500' : 'text-gray-400'}`} />
            Auto Refresh
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshAll}
            disabled={healthLoading || statsLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${healthLoading || statsLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Overview */}
      <SystemOverview health={health} stats={stats} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Monitor */}
        <div className="lg:col-span-2">
          <HealthMonitor health={health} />
        </div>

        {/* Alerts Panel */}
        <div className="lg:col-span-1">
          <AlertsPanel />
        </div>
      </div>

      {/* Real-time Metrics */}
      <SystemMetrics health={health} stats={stats} />

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalUsers?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.activeSubscriptions?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +5% from last week
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Webhooks</CardTitle>
            <Zap className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              (stats?.pendingWebhooks || 0) > 100 ? 'text-red-600' : 
              (stats?.pendingWebhooks || 0) > 50 ? 'text-yellow-600' : 
              'text-green-600'
            }`}>
              {stats?.pendingWebhooks || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {webhookStats?.successRate || 0}% success rate
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Load</CardTitle>
            <Activity className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              (stats?.systemLoad || 0) > 90 ? 'text-red-600' : 
              (stats?.systemLoad || 0) > 70 ? 'text-yellow-600' : 
              'text-green-600'
            }`}>
              {stats?.systemLoad || 0}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {stats?.responseTime || 0}ms avg response
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              System Settings
            </CardTitle>
            <CardDescription>
              Configure system-wide settings and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/dashboard/system/settings">
                Manage Settings
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Webhooks
            </CardTitle>
            <CardDescription>
              Monitor and manage webhook endpoints and events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/system/webhooks">
                View Webhooks
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Maintenance
            </CardTitle>
            <CardDescription>
              System maintenance and backup operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Run Maintenance
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Status Indicator */}
      <div className="fixed bottom-4 right-4">
        <Badge 
          variant={health?.status === 'healthy' ? 'default' : 
                  health?.status === 'warning' ? 'secondary' : 'destructive'}
          className="flex items-center gap-1 px-3 py-1"
        >
          <div className={`w-2 h-2 rounded-full ${
            health?.status === 'healthy' ? 'bg-green-500' : 
            health?.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
          } animate-pulse`} />
          System {health?.status || 'Unknown'}
        </Badge>
      </div>
    </div>
  );
}