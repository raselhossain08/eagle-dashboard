// src/app/dashboard/system/maintenance/page.tsx
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSystemHealth, useSystemStats, useRunCleanup, useCreateBackup } from '@/hooks/useSystem';
import { Database, Trash2, Calendar, Play, Pause, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function MaintenancePage() {
  const [isProcessingMaintenance, setProcessingMaintenance] = useState(false);

  // Real API hooks
  const { data: systemHealth, isLoading: healthLoading } = useSystemHealth();
  const { data: systemStats, isLoading: statsLoading } = useSystemStats();
  const cleanupMutation = useRunCleanup();
  const backupMutation = useCreateBackup();

  const handleRunCleanup = async () => {
    try {
      setProcessingMaintenance(true);
      const result = await cleanupMutation.mutateAsync();
      
      toast.success(`Cleanup completed! Freed ${result.freedSpace || 0} bytes of space`);
    } catch (error: any) {
      console.error('Cleanup failed:', error);
      toast.error(error.message || 'Cleanup operation failed');
    } finally {
      setProcessingMaintenance(false);
    }
  };

  const handleCreateBackup = async () => {
    try {
      setProcessingMaintenance(true);
      const result = await backupMutation.mutateAsync();
      
      toast.success(`Backup created successfully! File: ${result.filename || 'backup.sql'}`);
    } catch (error: any) {
      console.error('Backup failed:', error);
      toast.error(error.message || 'Backup operation failed');
    } finally {
      setProcessingMaintenance(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Maintenance Operations</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          System maintenance, backups, and cleanup operations
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Backup Operations
            </CardTitle>
            <CardDescription>
              Manage database backups and restore points
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Last Backup</span>
                <Badge variant="outline">
                  {statsLoading ? 'Loading...' : '2 hours ago'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Backup Size</span>
                <span className="text-sm">
                  {statsLoading ? 'Loading...' : '2.4 GB'}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleCreateBackup} 
                disabled={isProcessingMaintenance || backupMutation.isPending}
                className="flex-1"
              >
                {backupMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Database className="h-4 w-4 mr-2" />
                )}
                Create Backup
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard/system/maintenance/backups">Manage</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Data Cleanup
            </CardTitle>
            <CardDescription>
              Clean up temporary files and optimize data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Last Cleanup</span>
                <Badge variant="outline">
                  {statsLoading ? 'Loading...' : '1 day ago'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Space Reclaimable</span>
                <span className="text-sm">
                  {statsLoading ? 'Loading...' : '450 MB'}
                </span>
              </div>
            </div>
            <Button 
              onClick={handleRunCleanup} 
              disabled={isProcessingMaintenance || cleanupMutation.isPending}
              variant="outline"
              className="w-full"
            >
              {cleanupMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Run Cleanup
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Scheduled Tasks
            </CardTitle>
            <CardDescription>
              Automated maintenance schedule
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Backup Task</span>
                  <Badge variant="default">Active</Badge>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Cleanup Task</span>
                  <Badge variant="secondary">Paused</Badge>
                </div>
                <Progress value={30} className="h-2" />
              </div>
            </div>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/system/maintenance/schedule">
                <Calendar className="h-4 w-4 mr-2" />
                View Schedule
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* System Health Alert */}
      {systemHealth && systemHealth.status !== 'healthy' && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            System health: {systemHealth.status}. Some maintenance operations may be affected.
          </AlertDescription>
        </Alert>
      )}

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            System Status
            {systemHealth?.status === 'healthy' && (
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Healthy
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Current maintenance operations and system health
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {healthLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                ) : (
                  `${Math.round((systemHealth?.uptime || 0) / 3600)}h`
                )}
              </div>
              <div className="text-sm text-gray-500">Uptime</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {systemHealth?.database === 'connected' ? (
                  <CheckCircle className="h-6 w-6 mx-auto" />
                ) : (
                  <AlertTriangle className="h-6 w-6 mx-auto" />
                )}
              </div>
              <div className="text-sm text-gray-500">Database</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {statsLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                ) : (
                  systemStats?.pendingWebhooks || 0
                )}
              </div>
              <div className="text-sm text-gray-500">Pending Tasks</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {statsLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                ) : (
                  systemStats?.failedWebhooks || 0
                )}
              </div>
              <div className="text-sm text-gray-500">Failed Tasks</div>
            </div>
          </div>
          
          {/* Additional System Information */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-900">
              <h4 className="font-medium mb-2">Memory Usage</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Used</span>
                  <span>
                    {healthLoading ? 'Loading...' : 
                      `${((systemHealth?.memory.used || 0) / 1024 / 1024).toFixed(1)} MB`}
                  </span>
                </div>
                <Progress 
                  value={systemHealth?.memory.percentage || 0} 
                  className="h-2"
                />
              </div>
            </div>
            
            <div className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-900">
              <h4 className="font-medium mb-2">Disk Usage</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Used</span>
                  <span>
                    {healthLoading ? 'Loading...' : 
                      `${((systemHealth?.disk.used || 0) / 1024 / 1024 / 1024).toFixed(1)} GB`}
                  </span>
                </div>
                <Progress 
                  value={systemHealth?.disk.percentage || 0} 
                  className="h-2"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {isProcessingMaintenance && (
        <Card>
          <CardHeader>
            <CardTitle>Operation in Progress</CardTitle>
            <CardDescription>
              Please wait while the maintenance operation completes...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={100} className="h-2 animate-pulse" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}