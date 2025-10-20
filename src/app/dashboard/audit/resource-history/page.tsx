'use client';

import { AuditDashboardShell } from '@/components/audit/audit-dashboard-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { useState } from 'react';

export default function ResourceHistoryPage() {
  const [resourceType, setResourceType] = useState('');
  const [resourceId, setResourceId] = useState('');

  const resourceTypes = [
    'User',
    'Subscription',
    'Role',
    'Permission',
    'Organization',
    'Project'
  ];

  const handleSearch = () => {
    if (resourceType && resourceId) {
      window.location.href = `/dashboard/audit/resource-history/${resourceType}/${resourceId}`;
    }
  };

  return (
    <AuditDashboardShell
      title="Resource History"
      description="Track changes and audit history for specific resources"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold">Find Resource History</h3>
          <p className="text-muted-foreground">
            Enter resource type and ID to view complete audit history
          </p>
        </div>

        <div className="grid gap-4 p-6 border rounded-lg bg-card">
          {/* Resource Type */}
          <div className="space-y-2">
            <Label htmlFor="resourceType">Resource Type</Label>
            <Select value={resourceType} onValueChange={setResourceType}>
              <SelectTrigger>
                <SelectValue placeholder="Select resource type" />
              </SelectTrigger>
              <SelectContent>
                {resourceTypes.map((type) => (
                  <SelectItem key={type} value={type.toLowerCase()}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Resource ID */}
          <div className="space-y-2">
            <Label htmlFor="resourceId">Resource ID</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="resourceId"
                placeholder="Enter resource ID..."
                className="pl-8"
                value={resourceId}
                onChange={(e) => setResourceId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>

          {/* Search Button */}
          <Button 
            onClick={handleSearch}
            disabled={!resourceType || !resourceId}
            className="w-full"
          >
            <Search className="h-4 w-4 mr-2" />
            View Resource History
          </Button>
        </div>

        {/* Examples */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Examples:</h4>
          <div className="grid gap-2 text-sm">
            <div className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-muted/50 cursor-pointer"
                 onClick={() => {
                   setResourceType('user');
                   setResourceId('usr_123456789');
                 }}>
              <Search className="h-4 w-4 text-muted-foreground" />
              <div>
                <span className="font-medium">User:</span>
                <code className="ml-2 text-xs bg-muted px-1 rounded">usr_123456789</code>
              </div>
            </div>
            <div className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-muted/50 cursor-pointer"
                 onClick={() => {
                   setResourceType('subscription');
                   setResourceId('sub_987654321');
                 }}>
              <Search className="h-4 w-4 text-muted-foreground" />
              <div>
                <span className="font-medium">Subscription:</span>
                <code className="ml-2 text-xs bg-muted px-1 rounded">sub_987654321</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuditDashboardShell>
  );
}