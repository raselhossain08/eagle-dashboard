// src/components/system/AlertsPanel.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, CheckCircle, AlertTriangle, Info, RefreshCw } from 'lucide-react';
import { useSystemHealth, useSystemStats } from '@/hooks/useSystem';
import { SystemAlert } from '@/types/system';

export function AlertsPanel() {
  const { data: health, isLoading: healthLoading, refetch: refetchHealth } = useSystemHealth();
  const { data: stats, isLoading: statsLoading } = useSystemStats();

  // Generate alerts based on real system data
  const generateAlertsFromSystemData = (): SystemAlert[] => {
    const alerts: SystemAlert[] = [];
    
    if (!health || !stats) return alerts;

    // CPU usage alert
    if (health.cpu.usage > 80) {
      alerts.push({
        id: 'cpu-high',
        type: 'error',
        title: 'Critical CPU Usage',
        message: `CPU usage is at ${health.cpu.usage}% - immediate attention required`,
        timestamp: new Date().toISOString(),
        resolved: false
      });
    } else if (health.cpu.usage > 60) {
      alerts.push({
        id: 'cpu-warning',
        type: 'warning',
        title: 'High CPU Usage',
        message: `CPU usage is at ${health.cpu.usage}% - monitor closely`,
        timestamp: new Date().toISOString(),
        resolved: false
      });
    }

    // Memory usage alert
    if (health.memory.percentage > 85) {
      alerts.push({
        id: 'memory-high',
        type: 'error',
        title: 'Critical Memory Usage',
        message: `Memory usage is at ${health.memory.percentage}%`,
        timestamp: new Date().toISOString(),
        resolved: false
      });
    }

    // Database connection alert
    if (health.database !== 'connected') {
      alerts.push({
        id: 'db-connection',
        type: 'error',
        title: 'Database Connection Failed',
        message: 'Primary database connection is not available',
        timestamp: new Date().toISOString(),
        resolved: false
      });
    }

    // Pending webhooks alert
    if (stats.pendingWebhooks > 100) {
      alerts.push({
        id: 'webhooks-pending',
        type: 'warning',
        title: 'High Pending Webhooks',
        message: `${stats.pendingWebhooks} webhooks pending delivery`,
        timestamp: new Date().toISOString(),
        resolved: false
      });
    }

    // System load alert
    if (stats.systemLoad > 90) {
      alerts.push({
        id: 'system-load',
        type: 'error',
        title: 'System Overload',
        message: `System load is at ${stats.systemLoad}%`,
        timestamp: new Date().toISOString(),
        resolved: false
      });
    }

    // High error rate alert
    if (stats.errorRate > 3) {
      alerts.push({
        id: 'error-rate',
        type: 'warning',
        title: 'High Error Rate',
        message: `Error rate is at ${stats.errorRate}%`,
        timestamp: new Date().toISOString(),
        resolved: false
      });
    }

    // Success alerts
    if (health.status === 'healthy' && stats.systemLoad < 50) {
      alerts.push({
        id: 'system-healthy',
        type: 'info',
        title: 'System Running Smoothly',
        message: 'All systems operational and performing well',
        timestamp: new Date().toISOString(),
        resolved: true
      });
    }

    return alerts.slice(0, 5); // Limit to 5 most recent alerts
  };

  const alerts = generateAlertsFromSystemData();

  const getIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'info': return <Info className="h-4 w-4 text-blue-600" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getBadgeVariant = (type: string): "default" | "destructive" | "outline" | "secondary" => {
    switch (type) {
      case 'error': return 'destructive';
      case 'warning': return 'secondary';
      case 'info': return 'default';
      default: return 'outline';
    }
  };

  if (healthLoading || statsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            System Alerts
          </CardTitle>
          <CardDescription>
            Recent system notifications and warnings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg border">
              <Skeleton className="h-4 w-4 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            System Alerts
          </div>
          <Button variant="ghost" size="sm" onClick={() => refetchHealth()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardTitle>
        <CardDescription>
          Recent system notifications and warnings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <p className="text-sm">No active alerts</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg border">
              {getIcon(alert.type)}
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{alert.title}</span>
                  <Badge variant={getBadgeVariant(alert.type)} className="text-xs">
                    {alert.type}
                  </Badge>
                  {alert.resolved && (
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {alert.message}
                </p>
                <span className="text-xs text-gray-500">
                  {new Date(alert.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          ))
        )}
        
        <Button variant="outline" className="w-full">
          View All Alerts
        </Button>
      </CardContent>
    </Card>
  );
}