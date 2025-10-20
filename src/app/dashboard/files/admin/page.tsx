// app/dashboard/files/admin/page.tsx
'use client';

import { useState } from 'react';
import { FilesDashboardShell } from '@/components/files/files-dashboard-shell';
import { FilesNavigation } from '@/components/files/files-navigation';
import { FileListView } from '@/components/files/file-list-view';
import { FileSearchFilter } from '@/components/files/file-search-filter';
import { StorageQuotaDisplay } from '@/components/files/storage-quota-display';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Download, Trash2, RefreshCw } from 'lucide-react';
import { FileItem } from '@/types/files';

const mockAdminFiles: FileItem[] = [
  {
    id: '1',
    key: 'user1/documents/report.pdf',
    name: 'report.pdf',
    size: 2048576,
    type: 'application/pdf',
    lastModified: new Date('2024-01-15')
  },
  {
    id: '2', 
    key: 'user2/images/photo.jpg',
    name: 'photo.jpg',
    size: 3456789,
    type: 'image/jpeg',
    lastModified: new Date('2024-01-14')
  },
  {
    id: '3',
    key: 'user3/documents/proposal.docx',
    name: 'proposal.docx', 
    size: 1024576,
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    lastModified: new Date('2024-01-13')
  }
];

const mockStorageBreakdown = [
  { type: 'Images', size: 1024 * 1024 * 1024 * 8.2, color: '#3b82f6' },
  { type: 'Documents', size: 1024 * 1024 * 1024 * 1.5, color: '#10b981' },
  { type: 'PDFs', size: 1024 * 1024 * 1024 * 0.8, color: '#ef4444' },
  { type: 'Archives', size: 1024 * 1024 * 1024 * 4.1, color: '#f59e0b' },
  { type: 'Others', size: 1024 * 1024 * 1024 * 1.1, color: '#8b5cf6' }
];

export default function AdminFileManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [fileType, setFileType] = useState('all');
  const [dateRange, setDateRange] = useState({ from: undefined as Date | undefined, to: undefined as Date | undefined });
  const [sizeRange, setSizeRange] = useState<[number, number]>([0, 100 * 1024 * 1024]);
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'date' | 'type'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Files', href: '/dashboard/files' },
    { label: 'Admin' }
  ];

  const handleFileSelect = (file: FileItem) => {
    setSelectedFiles(prev =>
      prev.includes(file.id)
        ? prev.filter(id => id !== file.id)
        : [...prev, file.id]
    );
  };

  const handleSort = (field: 'name' | 'size' | 'date' | 'type') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setFileType('all');
    setDateRange({ from: undefined, to: undefined });
    setSizeRange([0, 100 * 1024 * 1024]);
  };

  const filteredFiles = mockAdminFiles.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         file.key.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = fileType === 'all' || file.type.includes(fileType);
    const matchesSize = file.size >= sizeRange[0] && file.size <= sizeRange[1];
    
    let matchesDate = true;
    if (dateRange.from && file.lastModified < dateRange.from) matchesDate = false;
    if (dateRange.to && file.lastModified > dateRange.to) matchesDate = false;
    
    return matchesSearch && matchesType && matchesSize && matchesDate;
  });

  return (
    <FilesDashboardShell
      title="Admin File Management"
      description="Manage all files across the system"
      breadcrumbs={breadcrumbs}
      actions={
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <FilesNavigation />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <Tabs defaultValue="files">
              <TabsList>
                <TabsTrigger value="files">All Files</TabsTrigger>
                <TabsTrigger value="users">User Management</TabsTrigger>
                <TabsTrigger value="system">System Operations</TabsTrigger>
              </TabsList>

              <TabsContent value="files" className="space-y-4">
                <FileSearchFilter
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  fileType={fileType}
                  onFileTypeChange={setFileType}
                  dateRange={dateRange}
                  onDateRangeChange={setDateRange}
                  sizeRange={sizeRange}
                  onSizeRangeChange={setSizeRange}
                  onReset={handleResetFilters}
                />

                <FileListView
                  files={filteredFiles}
                  onFileSelect={handleFileSelect}
                  onFileDelete={(id) => console.log('Delete:', id)}
                  onFileDownload={(id) => console.log('Download:', id)}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                />
              </TabsContent>

              <TabsContent value="users">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center space-y-4">
                      <Users className="w-12 h-12 text-gray-400 mx-auto" />
                      <div>
                        <h3 className="text-lg font-medium">User Management</h3>
                        <p className="text-muted-foreground">
                          Manage user storage quotas and permissions
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="system">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center space-y-4">
                      <Trash2 className="w-12 h-12 text-gray-400 mx-auto" />
                      <div>
                        <h3 className="text-lg font-medium">System Operations</h3>
                        <p className="text-muted-foreground">
                          System maintenance and cleanup operations
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <StorageQuotaDisplay
              used={15.7}
              total={100}
              unit="GB"
              breakdown={mockStorageBreakdown}
              showDetails={true}
            />

            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold">Quick Stats</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Total Files</span>
                    <span className="font-medium">1,247</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Users</span>
                    <span className="font-medium">24</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Today</span>
                    <span className="font-medium">8</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Storage Used</span>
                    <span className="font-medium">15.7 GB</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </FilesDashboardShell>
  );
}