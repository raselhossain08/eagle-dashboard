// src/components/system/MaintenancePanel.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Play, Pause, Calendar } from 'lucide-react';

interface MaintenancePanelProps {
  isMaintenanceMode: boolean;
  onToggleMaintenance: () => void;
  onRunOperation: (operation: string) => void;
}

export function MaintenancePanel({ 
  isMaintenanceMode, 
  onToggleMaintenance, 
  onRunOperation 
}: MaintenancePanelProps) {
  const maintenanceTasks = [
    {
      id: 'cleanup',
      name: 'Database Cleanup',
      description: 'Remove temporary data and optimize tables',
      duration: '2-5 minutes',
      impact: 'low'
    },
    {
      id: 'cache_clear',
      name: 'Cache Clear',
      description: 'Clear all system caches',
      duration: '1-2 minutes', 
      impact: 'medium'
    },
    {
      id: 'log_rotate',
      name: 'Log Rotation',
      description: 'Rotate and archive system logs',
      duration: '1 minute',
      impact: 'low'
    }
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Maintenance Operations</CardTitle>
        <CardDescription>
          System maintenance tasks and operations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Maintenance Mode Toggle */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-1">
            <Label htmlFor="maintenance-mode" className="text-base font-semibold">
              Maintenance Mode
            </Label>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Enable to put the system in maintenance mode
            </p>
          </div>
          <Switch
            id="maintenance-mode"
            checked={isMaintenanceMode}
            onCheckedChange={onToggleMaintenance}
          />
        </div>

        {isMaintenanceMode && (
          <div className="p-4 border border-amber-200 rounded-lg bg-amber-50 dark:bg-amber-900/20">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-semibold">Maintenance Mode Active</span>
            </div>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
              The system is in maintenance mode. Some features may be unavailable.
            </p>
          </div>
        )}

        {/* Quick Maintenance Tasks */}
        <div className="space-y-4">
          <h3 className="font-semibold">Quick Maintenance Tasks</h3>
          {maintenanceTasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{task.name}</span>
                  <Badge className={getImpactColor(task.impact)}>
                    {task.impact} impact
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {task.description}
                </p>
                <p className="text-xs text-gray-500">Duration: {task.duration}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRunOperation(task.id)}
              >
                <Play className="h-4 w-4 mr-1" />
                Run
              </Button>
            </div>
          ))}
        </div>

        {/* Scheduled Maintenance */}
        <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
          <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200 mb-2">
            <Calendar className="h-4 w-4" />
            <span className="font-semibold">Scheduled Maintenance</span>
          </div>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Next maintenance window: Saturday, 2:00 AM - 4:00 AM UTC
          </p>
          <Button variant="outline" size="sm" className="mt-2">
            View Schedule
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}