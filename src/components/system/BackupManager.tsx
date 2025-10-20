// src/components/system/BackupManager.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Trash2, RefreshCw, Database } from 'lucide-react';

const mockBackups = [
  {
    id: '1',
    filename: 'backup-2024-01-15.sql',
    size: 2147483648, // 2GB
    createdAt: '2024-01-15T04:00:00Z',
    status: 'completed' as const
  },
  {
    id: '2', 
    filename: 'backup-2024-01-14.sql',
    size: 2147483648,
    createdAt: '2024-01-14T04:00:00Z',
    status: 'completed'
  },
  {
    id: '3',
    filename: 'backup-2024-01-13.sql',
    size: 2147483648,
    createdAt: '2024-01-13T04:00:00Z',
    status: 'completed'
  }
];

export function BackupManager() {
  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleCreateBackup = async () => {
    // Implement backup creation
    console.log('Creating backup...');
  };

  const handleDownloadBackup = (backupId: string) => {
    // Implement download
    console.log('Downloading backup:', backupId);
  };

  const handleDeleteBackup = (backupId: string) => {
    // Implement delete
    console.log('Deleting backup:', backupId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Backup Management
        </CardTitle>
        <CardDescription>
          Manage database backups and restore points
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-2">
          <Button onClick={handleCreateBackup} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Create New Backup
          </Button>
          <Button variant="outline" disabled>
            Configure Schedule
          </Button>
        </div>

        <div>
          <h3 className="font-semibold mb-4">Recent Backups</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Filename</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockBackups.map((backup) => (
                <TableRow key={backup.id}>
                  <TableCell className="font-mono text-sm">
                    {backup.filename}
                  </TableCell>
                  <TableCell>{formatFileSize(backup.size)}</TableCell>
                  <TableCell>
                    {new Date(backup.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      backup.status === 'completed' ? 'default' :
                      backup.status === 'failed' ? 'destructive' : 'secondary'
                    }>
                      {backup.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadBackup(backup.id)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteBackup(backup.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
          <h4 className="font-semibold mb-2">Backup Information</h4>
          <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
            <li>• Backups are automatically created daily at 4:00 AM UTC</li>
            <li>• Backups are retained for 30 days</li>
            <li>• Total backup storage used: 6 GB</li>
            <li>• Next scheduled backup: Today at 4:00 AM UTC</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}