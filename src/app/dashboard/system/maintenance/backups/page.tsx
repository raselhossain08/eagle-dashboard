// src/app/dashboard/system/maintenance/backups/page.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BackupManager } from '@/components/system/BackupManager';
import { Download, Upload, Calendar, Settings } from 'lucide-react';

export default function MaintenanceBackupsPage() {
  const backupStats = {
    totalSize: 6 * 1024 * 1024 * 1024, // 6GB
    backupCount: 12,
    lastBackup: '2024-01-15T04:00:00Z',
    nextBackup: '2024-01-16T04:00:00Z',
    retentionDays: 30
  };

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Backup Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage database backups and restore operations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* Backup Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Backups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{backupStats.backupCount}</div>
            <p className="text-sm text-gray-500">Stored backups</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatFileSize(backupStats.totalSize)}</div>
            <p className="text-sm text-gray-500">Total size</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Retention</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{backupStats.retentionDays} days</div>
            <p className="text-sm text-gray-500">Backup retention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Next Backup</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date(backupStats.nextBackup).toLocaleTimeString()}
            </div>
            <p className="text-sm text-gray-500">Scheduled</p>
          </CardContent>
        </Card>
      </div>

      {/* Backup Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Backup Operations
            </CardTitle>
            <CardDescription>
              Create and manage backups
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full">
              Create Manual Backup
            </Button>
            <Button variant="outline" className="w-full">
              Configure Auto Backup
            </Button>
            <div className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-900">
              <h4 className="font-semibold text-sm mb-2">Last Backup</h4>
              <p className="text-sm text-gray-600">
                {new Date(backupStats.lastBackup).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Restore Operations
            </CardTitle>
            <CardDescription>
              Restore from backup
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full" disabled>
              Restore from Backup
            </Button>
            <Button variant="outline" className="w-full" disabled>
              Point-in-Time Recovery
            </Button>
            <div className="p-3 border rounded-lg bg-amber-50 dark:bg-amber-900/20">
              <h4 className="font-semibold text-sm mb-2 text-amber-800 dark:text-amber-200">
                Warning
              </h4>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Restore operations will cause system downtime
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Backup Schedule
            </CardTitle>
            <CardDescription>
              Automated backup schedule
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Daily Backup</span>
                  <Badge variant="default">Active</Badge>
                </div>
                <Progress value={100} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">Runs at 4:00 AM UTC</p>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Weekly Archive</span>
                  <Badge variant="secondary">Sunday</Badge>
                </div>
                <Progress value={75} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">Weekly full backup</p>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              Edit Schedule
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Backup Manager Component */}
      <BackupManager />
    </div>
  );
}