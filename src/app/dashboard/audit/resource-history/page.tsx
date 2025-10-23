'use client';

import { AuditDashboardShell } from '@/components/audit/audit-dashboard-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, History, Database, Info, Clock, Activity } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useResourceTypes, useResourceSearch } from '@/hooks/use-audit';
import { format } from 'date-fns';

export default function ResourceHistoryPage() {
  const router = useRouter();
  const [resourceType, setResourceType] = useState('');
  const [resourceId, setResourceId] = useState('');
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch dynamic resource types
  const { data: resourceTypesData, isLoading: typesLoading } = useResourceTypes();
  
  // Search for resources when user types
  const { data: searchResults, isLoading: searchLoading } = useResourceSearch(
    resourceType, 
    searchQuery, 
    5
  );

  const staticResourceTypes = [
    { value: 'user', label: 'User', description: 'User accounts and profiles' },
    { value: 'subscription', label: 'Subscription', description: 'Customer subscriptions' },
    { value: 'role', label: 'Role', description: 'User roles and permissions' },
    { value: 'permission', label: 'Permission', description: 'Individual permissions' },
    { value: 'organization', label: 'Organization', description: 'Organization settings' },
    { value: 'project', label: 'Project', description: 'Project configurations' },
  ];

  // Combine static and dynamic resource types
  const getResourceTypes = () => {
    if (resourceTypesData?.types) {
      return resourceTypesData.types.map(type => {
        const staticType = staticResourceTypes.find(st => st.value === type);
        return {
          value: type,
          label: staticType?.label || type.charAt(0).toUpperCase() + type.slice(1),
          description: staticType?.description || `${type} resources`,
          count: resourceTypesData.counts[type] || 0
        };
      });
    }
    return staticResourceTypes;
  };

  const validateResourceId = (type: string, id: string): string | null => {
    if (!id.trim()) return 'Resource ID is required';
    
    // Basic validation patterns for different resource types
    const patterns = {
      user: /^(usr_|user_)?[a-zA-Z0-9_-]+$/,
      subscription: /^(sub_|subscription_)?[a-zA-Z0-9_-]+$/,
      role: /^(role_)?[a-zA-Z0-9_-]+$/,
      permission: /^(perm_)?[a-zA-Z0-9_-]+$/,
      organization: /^(org_)?[a-zA-Z0-9_-]+$/,
      project: /^(proj_|project_)?[a-zA-Z0-9_-]+$/,
    };

    const pattern = patterns[type as keyof typeof patterns];
    if (pattern && !pattern.test(id)) {
      return `Invalid ${type} ID format`;
    }

    if (id.length < 3) return 'Resource ID must be at least 3 characters';
    if (id.length > 50) return 'Resource ID must be less than 50 characters';

    return null;
  };

  const handleSearch = () => {
    setError('');
    
    if (!resourceType) {
      setError('Please select a resource type');
      return;
    }
    
    if (!resourceId) {
      setError('Please enter a resource ID');
      return;
    }

    const validationError = validateResourceId(resourceType, resourceId);
    if (validationError) {
      setError(validationError);
      return;
    }

    router.push(`/dashboard/audit/resource-history/${resourceType}/${encodeURIComponent(resourceId)}`);
  };

  const handleExampleClick = (type: string, id: string) => {
    setResourceType(type);
    setResourceId(id);
    setError('');
  };

  const handleResourceIdChange = (value: string) => {
    setResourceId(value);
    setSearchQuery(value);
    setError('');
  };

  const handleSuggestionClick = (id: string) => {
    setResourceId(id);
    setSearchQuery('');
  };

  useEffect(() => {
    // Reset search when resource type changes
    setSearchQuery('');
  }, [resourceType]);

  return (
    <AuditDashboardShell
      title="Resource History"
      description="Track changes and audit history for specific resources"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <History className="h-6 w-6 text-primary" />
            <h3 className="text-2xl font-semibold">Find Resource History</h3>
          </div>
          <p className="text-muted-foreground">
            Enter resource type and ID to view complete audit history and track all changes
          </p>
        </div>

        {/* Search Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Search Resource</span>
            </CardTitle>
            <CardDescription>
              Select the resource type and enter the unique identifier to view its audit trail
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Resource Type */}
            <div className="space-y-2">
              <Label htmlFor="resourceType">Resource Type</Label>
              {typesLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select value={resourceType} onValueChange={setResourceType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select resource type" />
                  </SelectTrigger>
                  <SelectContent>
                    {getResourceTypes().map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex flex-col">
                          <div className="flex items-center justify-between w-full">
                            <span>{type.label}</span>
                            {'count' in type && typeof type.count === 'number' && type.count > 0 && (
                              <span className="text-xs bg-muted px-1.5 py-0.5 rounded ml-2">
                                {type.count}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">{type.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Resource ID with Search Suggestions */}
            <div className="space-y-2">
              <Label htmlFor="resourceId">Resource ID</Label>
              <div className="relative">
                <Database className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="resourceId"
                  placeholder="Enter resource ID..."
                  className="pl-8"
                  value={resourceId}
                  onChange={(e) => handleResourceIdChange(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              
              {/* Search Suggestions */}
              {resourceType && searchQuery && searchQuery.length >= 2 && (
                <div className="relative">
                  {searchLoading ? (
                    <div className="border rounded-md p-2">
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ) : searchResults?.resources && searchResults.resources.length > 0 ? (
                    <div className="border rounded-md divide-y bg-background">
                      {searchResults.resources.map((resource, index) => (
                        <div
                          key={index}
                          className="p-2 hover:bg-muted cursor-pointer flex items-center justify-between"
                          onClick={() => handleSuggestionClick(resource.id)}
                        >
                          <div className="flex items-center space-x-2">
                            <Database className="h-3 w-3 text-muted-foreground" />
                            <code className="text-sm">{resource.id}</code>
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <Activity className="h-3 w-3" />
                            <span>{resource.actionCount}</span>
                            <Clock className="h-3 w-3" />
                            <span>{format(new Date(resource.lastModified), 'MMM dd')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : searchQuery.length >= 2 && (
                    <div className="border rounded-md p-2 text-center text-sm text-muted-foreground">
                      No matching resources found
                    </div>
                  )}
                </div>
              )}

              {resourceType && (
                <p className="text-xs text-muted-foreground">
                  <Info className="inline h-3 w-3 mr-1" />
                  Enter the unique identifier for the {getResourceTypes().find(t => t.value === resourceType)?.label.toLowerCase()}
                </p>
              )}
            </div>

            {/* Search Button */}
            <Button 
              onClick={handleSearch}
              disabled={!resourceType || !resourceId}
              className="w-full"
              size="lg"
            >
              <Search className="h-4 w-4 mr-2" />
              View Resource History
            </Button>
          </CardContent>
        </Card>

        {/* Examples */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Common Examples</CardTitle>
            <CardDescription>
              Click on any example below to auto-fill the search form
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              <div 
                className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => handleExampleClick('user', 'usr_123456789')}
              >
                <Search className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">User Account</span>
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">usr_123456789</code>
                  </div>
                  <p className="text-xs text-muted-foreground">Track user account changes</p>
                </div>
              </div>

              <div 
                className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => handleExampleClick('subscription', 'sub_987654321')}
              >
                <Search className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Subscription</span>
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">sub_987654321</code>
                  </div>
                  <p className="text-xs text-muted-foreground">View subscription modifications</p>
                </div>
              </div>

              <div 
                className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => handleExampleClick('role', 'role_admin')}
              >
                <Search className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Role</span>
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">role_admin</code>
                  </div>
                  <p className="text-xs text-muted-foreground">Monitor role permission changes</p>
                </div>
              </div>

              <div 
                className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => handleExampleClick('organization', 'org_company_123')}
              >
                <Search className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Organization</span>
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">org_company_123</code>
                  </div>
                  <p className="text-xs text-muted-foreground">Track organization settings</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="text-blue-900 flex items-center space-x-2">
              <Info className="h-5 w-5" />
              <span>What You'll See</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-800">
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                <span>Complete chronological history of all changes</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                <span>Who made each change and when</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                <span>Before and after values for each modification</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                <span>Success/failure status of each operation</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                <span>Export capability for compliance reporting</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AuditDashboardShell>
  );
}