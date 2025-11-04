// src/components/system/SystemMetrics.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  MemoryStick, 
  Network, 
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { SystemHealth, SystemStats } from '@/types/system';

interface MetricCardProps {
  title: string;
  value: number;
  unit: string;
  icon: React.ReactNode;
  color: 'green' | 'yellow' | 'red' | 'blue';
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
}

function MetricCard({ title, value, unit, icon, color, trend, trendValue }: MetricCardProps) {
  const colorClasses = {
    green: 'text-green-600 border-green-200 bg-green-50 dark:text-green-400 dark:border-green-700 dark:bg-green-900',
    yellow: 'text-yellow-600 border-yellow-200 bg-yellow-50 dark:text-yellow-400 dark:border-yellow-700 dark:bg-yellow-900',
    red: 'text-red-600 border-red-200 bg-red-50 dark:text-red-400 dark:border-red-700 dark:bg-red-900',
    blue: 'text-blue-600 border-blue-200 bg-blue-50 dark:text-blue-400 dark:border-blue-700 dark:bg-blue-900'
  };

  const progressColors = {
    green: 'bg-green-500 dark:bg-green-600',
    yellow: 'bg-yellow-500 dark:bg-yellow-600',
    red: 'bg-red-500 dark:bg-red-600',
    blue: 'bg-blue-500 dark:bg-blue-600'
  };

  return (
    <Card className={`border ${colorClasses[color]}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {icon}
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{title}</span>
          </div>
          {trend && (
            <div className="flex items-center gap-1 text-xs">
              {trend === 'up' && <TrendingUp className="h-3 w-3" />}
              {trend === 'down' && <TrendingDown className="h-3 w-3" />}
              {trend === 'stable' && <Minus className="h-3 w-3" />}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        
        <div className="mb-2">
          <div className="text-2xl font-bold">
            {value.toFixed(1)}{unit}
          </div>
        </div>

        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${progressColors[color]}`}
            style={{ width: `${Math.min(value, 100)}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

interface SystemMetricsProps {
  health?: SystemHealth | null;
  stats?: SystemStats | null;
}

export function SystemMetrics({ health, stats }: SystemMetricsProps) {
  const [realtimeData, setRealtimeData] = useState<{
    networkIn: number;
    networkOut: number;
    requestsPerSecond: number;
    activeConnections: number;
  }>({
    networkIn: 0,
    networkOut: 0,
    requestsPerSecond: 0,
    activeConnections: 0
  });

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealtimeData(prev => ({
        networkIn: Math.max(0, prev.networkIn + (Math.random() - 0.5) * 10),
        networkOut: Math.max(0, prev.networkOut + (Math.random() - 0.5) * 5),
        requestsPerSecond: Math.max(0, Math.random() * 50 + 10),
        activeConnections: Math.floor(Math.random() * 500 + 100)
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getMetricColor = (value: number, thresholds: { warning: number; critical: number }): 'green' | 'yellow' | 'red' => {
    if (value >= thresholds.critical) return 'red';
    if (value >= thresholds.warning) return 'yellow';
    return 'green';
  };

  if (!health || !stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>System Metrics</CardTitle>
          <CardDescription>Real-time system performance monitoring</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Activity className="h-8 w-8 mx-auto mb-2 animate-pulse" />
            <p>Loading system metrics...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Metrics
          </div>
          <Badge variant="outline" className="animate-pulse">
            Live
          </Badge>
        </CardTitle>
        <CardDescription>
          Real-time system performance and resource utilization
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Resource Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="CPU Usage"
            value={health.cpu.usage}
            unit="%"
            icon={<Cpu className="h-4 w-4" />}
            color={getMetricColor(health.cpu.usage, { warning: 60, critical: 80 })}
            trend={health.cpu.usage > 70 ? 'up' : health.cpu.usage < 30 ? 'down' : 'stable'}
            trendValue={`${health.cpu.cores} cores`}
          />

          <MetricCard
            title="Memory"
            value={health.memory.percentage}
            unit="%"
            icon={<MemoryStick className="h-4 w-4" />}
            color={getMetricColor(health.memory.percentage, { warning: 70, critical: 85 })}
            trend={health.memory.percentage > 75 ? 'up' : 'stable'}
            trendValue={`${(health.memory.used / (1024 ** 3)).toFixed(1)}GB`}
          />

          <MetricCard
            title="Disk Usage"
            value={health.disk.percentage}
            unit="%"
            icon={<HardDrive className="h-4 w-4" />}
            color={getMetricColor(health.disk.percentage, { warning: 70, critical: 85 })}
            trend="stable"
            trendValue={`${(health.disk.used / (1024 ** 3)).toFixed(1)}GB`}
          />

          <MetricCard
            title="System Load"
            value={stats.systemLoad}
            unit="%"
            icon={<Activity className="h-4 w-4" />}
            color={getMetricColor(stats.systemLoad, { warning: 70, critical: 90 })}
            trend={stats.systemLoad > 80 ? 'up' : stats.systemLoad < 40 ? 'down' : 'stable'}
            trendValue={`${stats.responseTime}ms`}
          />
        </div>

        {/* Network and Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Network In"
            value={realtimeData.networkIn}
            unit=" MB/s"
            icon={<Network className="h-4 w-4 rotate-180" />}
            color="blue"
            trend="up"
            trendValue="↑ 5%"
          />

          <MetricCard
            title="Network Out"
            value={realtimeData.networkOut}
            unit=" MB/s"
            icon={<Network className="h-4 w-4" />}
            color="blue"
            trend="stable"
            trendValue="→ 0%"
          />

          <MetricCard
            title="Requests/sec"
            value={realtimeData.requestsPerSecond}
            unit=""
            icon={<TrendingUp className="h-4 w-4" />}
            color="green"
            trend="up"
            trendValue="↑ 12%"
          />

          <MetricCard
            title="Connections"
            value={realtimeData.activeConnections}
            unit=""
            icon={<Activity className="h-4 w-4" />}
            color="blue"
            trend="stable"
            trendValue={`${stats.totalUsers} users`}
          />
        </div>

        {/* Performance Summary */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="font-medium">Performance Summary</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                System is running{' '}
                <Badge variant={
                  health.status === 'healthy' ? 'default' : 
                  health.status === 'warning' ? 'secondary' : 'destructive'
                }>
                  {health.status}
                </Badge>
                {' '}with {stats.errorRate}% error rate
              </p>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold">
                {stats.responseTime}ms
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                avg response time
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}