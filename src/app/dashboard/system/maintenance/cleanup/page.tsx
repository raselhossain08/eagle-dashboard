// src/app/dashboard/system/maintenance/cleanup/page.tsx
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useRunCleanup } from '@/hooks/useSystem';
import { Trash2, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';

const cleanupTasks = [
  {
    id: 'temp_files',
    name: 'Temporary Files',
    description: 'Remove temporary and cache files',
    size: 1024 * 1024 * 250, // 250MB
    lastCleaned: '2024-01-14T04:00:00Z',
    enabled: true
  },
  {
    id: 'old_logs',
    name: 'Old Log Files',
    description: 'Remove log files older than 30 days',
    size: 1024 * 1024 * 150, // 150MB
    lastCleaned: '2024-01-14T04:00:00Z',
    enabled: true
  },
  {
    id: 'database_cache',
    name: 'Database Cache',
    description: 'Clear database query cache',
    size: 1024 * 1024 * 50, // 50MB
    lastCleaned: '2024-01-15T10:00:00Z',
    enabled: false
  },
  {
    id: 'user_sessions',
    name: 'Expired Sessions',
    description: 'Remove expired user sessions',
    size: 1024 * 1024 * 75, // 75MB
    lastCleaned: '2024-01-15T12:00:00Z', 
    enabled: true
  }
];

export default function MaintenanceCleanupPage() {
  const [enabledTasks, setEnabledTasks] = useState<Set<string>>(
    new Set(cleanupTasks.filter(t => t.enabled).map(t => t.id))
  );
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const cleanupMutation = useRunCleanup();

  const handleRunCleanup = async () => {
    setIsRunning(true);
    setProgress(0);
    
    // Simulate progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRunning(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    try {
      await cleanupMutation.mutateAsync();
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  };

  const toggleTask = (taskId: string) => {
    setEnabledTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const totalReclaimable = cleanupTasks
    .filter(task => enabledTasks.has(task.id))
    .reduce((sum, task) => sum + task.size, 0);

  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Data Cleanup</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Clean up temporary data and optimize system storage
          </p>
        </div>
        <Button 
          onClick={handleRunCleanup} 
          disabled={isRunning || enabledTasks.size === 0}
          className="flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Run Cleanup
        </Button>
      </div>

      {/* Cleanup Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Reclaimable Space</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatFileSize(totalReclaimable)}</div>
            <p className="text-sm text-gray-500">From {enabledTasks.size} tasks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Last Cleanup</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2 days ago</div>
            <p className="text-sm text-gray-500">512MB reclaimed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Next Scheduled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Tomorrow</div>
            <p className="text-sm text-gray-500">4:00 AM UTC</p>
          </CardContent>
        </Card>
      </div>

      {/* Cleanup Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Cleanup Tasks</CardTitle>
          <CardDescription>
            Select which cleanup tasks to run
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {cleanupTasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4 flex-1">
                <Switch
                  checked={enabledTasks.has(task.id)}
                  onCheckedChange={() => toggleTask(task.id)}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">{task.name}</h3>
                    <Badge variant="outline">
                      {formatFileSize(task.size)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {task.description}
                  </p>
                  <p className="text-xs text-gray-500">
                    Last cleaned: {new Date(task.lastCleaned).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Progress Indicator */}
      {isRunning && (
        <Card>
          <CardHeader>
            <CardTitle>Cleanup in Progress</CardTitle>
            <CardDescription>
              Cleaning up system data...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-gray-600 mt-2 text-center">
              {progress}% complete
            </p>
          </CardContent>
        </Card>
      )}

      {/* Cleanup Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Cleanup Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <p>• Cleanup operations are safe and only remove temporary or expired data</p>
            <p>• User data and important system information is never affected</p>
            <p>• Cleanup tasks can be scheduled to run automatically</p>
            <p>• Running cleanup may temporarily increase system load</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}