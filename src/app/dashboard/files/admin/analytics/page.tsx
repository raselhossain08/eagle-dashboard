// app/dashboard/files/admin/analytics/page.tsx
'use client';

import { FilesDashboardShell } from '@/components/files/files-dashboard-shell';
import { FilesNavigation } from '@/components/files/files-navigation';
import { StorageAnalyticsDashboard } from '@/components/files/storage-analytics-dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock analytics data
const mockAnalyticsData = {
  totalFiles: 1247,
  totalSize: 1024 * 1024 * 1024 * 15.7, // 15.7GB
  fileTypes: [
    { type: 'Images', count: 856, size: 1024 * 1024 * 1024 * 8.2 },
    { type: 'Documents', count: 234, size: 1024 * 1024 * 1024 * 1.5 },
    { type: 'PDFs', count: 89, size: 1024 * 1024 * 1024 * 0.8 },
    { type: 'Archives', count: 45, size: 1024 * 1024 * 1024 * 4.1 },
    { type: 'Others', count: 23, size: 1024 * 1024 * 1024 * 1.1 }
  ],
  uploadTrends: [],
  topUsers: [],
  storageGrowth: []
};

export default function AnalyticsPage() {
  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Files', href: '/dashboard/files' },
    { label: 'Admin', href: '/dashboard/files/admin' },
    { label: 'Analytics' }
  ];

  return (
    <FilesDashboardShell
      title="Storage Analytics"
      description="Comprehensive storage usage and analytics"
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        <FilesNavigation />
        
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="usage">Usage Trends</TabsTrigger>
            <TabsTrigger value="users">User Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <StorageAnalyticsDashboard
              data={mockAnalyticsData}
              dateRange={{
                from: new Date('2024-01-01'),
                to: new Date()
              }}
            />
          </TabsContent>

          <TabsContent value="usage">
            <Card>
              <CardHeader>
                <CardTitle>Usage Trends</CardTitle>
                <CardDescription>Storage growth over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  Usage charts and trends will be implemented here
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Analytics</CardTitle>
                <CardDescription>Storage usage by user</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  User analytics will be implemented here
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </FilesDashboardShell>
  );
}