// src/components/system/SystemOverview.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SystemHealth, SystemStats } from '@/types/system';

interface SystemOverviewProps {
  health: SystemHealth;
  stats: SystemStats;
}

export function SystemOverview({ health, stats }: SystemOverviewProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500 dark:bg-green-600';
      case 'warning': return 'bg-yellow-500 dark:bg-yellow-600';
      case 'critical': return 'bg-red-500 dark:bg-red-600';
      default: return 'bg-gray-500 dark:bg-gray-600';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-700 bg-green-50 border-green-200 dark:text-green-300 dark:bg-green-900 dark:border-green-700';
      case 'warning': return 'text-yellow-700 bg-yellow-50 border-yellow-200 dark:text-yellow-300 dark:bg-yellow-900 dark:border-yellow-700';
      case 'critical': return 'text-red-700 bg-red-50 border-red-200 dark:text-red-300 dark:bg-red-900 dark:border-red-700';
      default: return 'text-gray-700 bg-gray-50 border-gray-200 dark:text-gray-300 dark:bg-gray-800 dark:border-gray-600';
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const formatBytes = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(1)} GB`;
  };

  if (!health || !stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>System Overview</CardTitle>
          <CardDescription>Loading system information...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Overview</CardTitle>
        <CardDescription>
          Current system status and performance metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* System Status Banner */}
        <div className={`mb-6 p-4 rounded-lg border ${getStatusTextColor(health.status)}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(health.status)}`}></div>
              <span className="font-semibold text-lg">
                System Status: {health.status.charAt(0).toUpperCase() + health.status.slice(1)}
              </span>
            </div>
            <span className="text-sm opacity-75">
              Last updated: {new Date(health.lastCheck).toLocaleTimeString()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* System Info Column */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-white">System Info</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Version</span>
                <span className="text-sm font-medium">{health.version}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Uptime</span>
                <span className="text-sm font-medium">{formatUptime(health.uptime)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">CPU Cores</span>
                <span className="text-sm font-medium">{health.cpu.cores}</span>
              </div>
            </div>
          </div>

          {/* Resource Usage Column */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-white">Resources</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">CPU Usage</span>
                <span className={`text-sm font-medium ${health.cpu.usage > 80 ? 'text-red-600 dark:text-red-400' : health.cpu.usage > 60 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
                  {health.cpu.usage}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Memory</span>
                <span className={`text-sm font-medium ${health.memory.percentage > 85 ? 'text-red-600 dark:text-red-400' : health.memory.percentage > 70 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
                  {health.memory.percentage}% ({formatBytes(health.memory.used)})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Disk Space</span>
                <span className={`text-sm font-medium ${health.disk.percentage > 85 ? 'text-red-600 dark:text-red-400' : health.disk.percentage > 70 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
                  {health.disk.percentage}% ({formatBytes(health.disk.used)})
                </span>
              </div>
            </div>
          </div>

          {/* Services Column */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-white">Services</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Database</span>
                <Badge variant={health.database === 'connected' ? 'default' : 'destructive'}>
                  {health.database}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">System Load</span>
                <span className={`text-sm font-medium ${stats.systemLoad > 90 ? 'text-red-600 dark:text-red-400' : stats.systemLoad > 70 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
                  {stats.systemLoad}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Webhooks</span>
                <span className={`text-sm font-medium ${stats.pendingWebhooks > 100 ? 'text-red-600 dark:text-red-400' : stats.pendingWebhooks > 50 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
                  {stats.pendingWebhooks} pending
                </span>
              </div>
            </div>
          </div>

          {/* Performance Column */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-white">Performance</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Response Time</span>
                <span className={`text-sm font-medium ${stats.responseTime > 500 ? 'text-red-600 dark:text-red-400' : stats.responseTime > 200 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
                  {stats.responseTime}ms
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Error Rate</span>
                <span className={`text-sm font-medium ${stats.errorRate > 5 ? 'text-red-600 dark:text-red-400' : stats.errorRate > 2 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
                  {stats.errorRate}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Active Users</span>
                <span className="text-sm font-medium">
                  {stats.totalUsers?.toLocaleString() || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}