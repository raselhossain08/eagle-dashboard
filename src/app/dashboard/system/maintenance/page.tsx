// src/app/dashboard/system/maintenance/page.tsx
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useHealthStore } from '@/stores/health-store';
import { Database, Trash2, Calendar, Play, Pause } from 'lucide-react';
import Link from 'next/link';

export default function MaintenancePage() {
  const [isProcessingMaintenance, setProcessingMaintenance] = useState(false);

  const handleRunCleanup = async () => {
    setProcessingMaintenance(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setProcessingMaintenance(false);
  };

  const handleCreateBackup = async () => {
    setProcessingMaintenance(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 3000));
    setProcessingMaintenance(false);
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
              <Backup className="h-5 w-5" />
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
                <Badge variant="outline">2 hours ago</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Backup Size</span>
                <span className="text-sm">2.4 GB</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleCreateBackup} 
                disabled={isProcessingMaintenance}
                className="flex-1"
              >
                <Backup className="h-4 w-4 mr-2" />
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
                <Badge variant="outline">1 day ago</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Space Reclaimable</span>
                <span className="text-sm">450 MB</span>
              </div>
            </div>
            <Button 
              onClick={handleRunCleanup} 
              disabled={isProcessingMaintenance}
              variant="outline"
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
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

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>
            Current maintenance operations and system health
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">98%</div>
              <div className="text-sm text-gray-500">Uptime</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">24/7</div>
              <div className="text-sm text-gray-500">Monitoring</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">2</div>
              <div className="text-sm text-gray-500">Pending Tasks</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-red-600">0</div>
              <div className="text-sm text-gray-500">Critical Issues</div>
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