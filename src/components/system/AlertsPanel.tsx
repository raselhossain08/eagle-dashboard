// src/components/system/AlertsPanel.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, CheckCircle, AlertTriangle, Info } from 'lucide-react';

const mockAlerts = [
  {
    id: '1',
    type: 'warning' as const,
    title: 'High CPU Usage',
    message: 'CPU usage is above 85%',
    timestamp: '2024-01-15T10:30:00Z',
    resolved: false
  },
  {
    id: '2',
    type: 'error' as const,
    title: 'Database Connection',
    message: 'Primary database connection failed',
    timestamp: '2024-01-15T09:15:00Z',
    resolved: true
  },
  {
    id: '3',
    type: 'info' as const,
    title: 'Backup Completed',
    message: 'Nightly backup completed successfully',
    timestamp: '2024-01-15T04:00:00Z',
    resolved: true
  }
];

export function AlertsPanel() {
  const getIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'info': return <Info className="h-4 w-4 text-blue-600" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'error': return 'destructive';
      case 'warning': return 'secondary';
      case 'info': return 'default';
      default: return 'outline';
    }
  };

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
        {mockAlerts.map((alert) => (
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
        ))}
        
        <Button variant="outline" className="w-full">
          View All Alerts
        </Button>
      </CardContent>
    </Card>
  );
}