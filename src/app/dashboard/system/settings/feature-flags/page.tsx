// src/app/dashboard/system/settings/feature-flags/page.tsx
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useFeatureFlags, useToggleFeatureFlag } from '@/hooks/useSystem';
import { Plus, Search, Users, Beaker, AlertTriangle, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

// Feature flag metadata for enhanced display
const flagMetadata: Record<string, {
  name: string;
  description: string;
  type: 'release' | 'beta' | 'experimental';
  category: string;
  dependencies?: string[];
}> = {
  'dark_mode': {
    name: 'Dark Mode Theme',
    description: 'Enable dark mode theme across the application interface',
    type: 'release',
    category: 'UI/UX'
  },
  'new_checkout': {
    name: 'Enhanced Checkout Flow',
    description: 'New streamlined checkout experience with improved conversion',
    type: 'beta',
    category: 'E-commerce'
  },
  'ai_assistant': {
    name: 'AI-Powered Assistant',
    description: 'Intelligent customer support and help assistant',
    type: 'experimental',
    category: 'AI/ML'
  },
  'advanced_analytics': {
    name: 'Advanced Analytics Dashboard',
    description: 'Enhanced analytics with real-time insights and custom reports',
    type: 'release',
    category: 'Analytics'
  },
  'two_factor_auth': {
    name: 'Two-Factor Authentication',
    description: 'Enhanced security with 2FA for all user accounts',
    type: 'release',
    category: 'Security'
  },
  'real_time_notifications': {
    name: 'Real-Time Notifications',
    description: 'Live notification system with WebSocket support',
    type: 'beta',
    category: 'Communication'
  }
};

export default function FeatureFlagsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Real API data
  const { 
    data: flags, 
    isLoading, 
    error,
    refetch 
  } = useFeatureFlags();
  
  const toggleMutation = useToggleFeatureFlag();

  const handleToggleFlag = async (key: string, currentEnabled: boolean) => {
    try {
      await toggleMutation.mutateAsync({ 
        key, 
        enabled: !currentEnabled 
      });
      
      toast.success(`Feature flag "${flagMetadata[key]?.name || key}" ${!currentEnabled ? 'enabled' : 'disabled'}`);
    } catch (error: any) {
      console.error('Failed to toggle feature flag:', error);
      toast.error(error.message || 'Failed to update feature flag');
    }
  };

  // Filter flags based on search and category
  const filteredFlags = React.useMemo(() => {
    if (!flags) return [];
    
    return Object.entries(flags)
      .filter(([key, enabled]) => {
        const metadata = flagMetadata[key];
        const matchesSearch = !searchQuery || 
          key.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (metadata?.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (metadata?.description.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesCategory = selectedCategory === 'all' || 
          metadata?.category === selectedCategory;
        
        return matchesSearch && matchesCategory;
      })
      .map(([key, enabled]) => ({
        key,
        enabled: Boolean(enabled),
        ...flagMetadata[key],
        name: flagMetadata[key]?.name || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      }));
  }, [flags, searchQuery, selectedCategory]);

  // Get unique categories
  const categories = React.useMemo(() => {
    const cats = new Set(Object.values(flagMetadata).map(meta => meta.category));
    return Array.from(cats).sort();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-80 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load feature flags: {error.message || 'Unknown error'}
          </AlertDescription>
        </Alert>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Feature Flags</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage feature toggles and rollout percentages
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Feature Flag
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Flags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {flags ? Object.keys(flags).length : 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Flags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {flags ? Object.values(flags).filter(Boolean).length : 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {categories.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Filtered Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {filteredFlags.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Feature Flags
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </CardTitle>
          <CardDescription>
            Toggle features and manage system capabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input 
                placeholder="Search feature flags..." 
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="px-3 py-2 border rounded-md bg-background"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {filteredFlags.length === 0 ? (
            <div className="text-center py-12">
              <Beaker className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No feature flags found
              </h3>
              <p className="text-gray-500">
                {searchQuery || selectedCategory !== 'all' 
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'No feature flags are currently configured.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFlags.map((flag) => (
                <div key={flag.key} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-semibold">{flag.name}</h3>
                      <Badge variant={
                        flag.type === 'release' ? 'default' :
                        flag.type === 'beta' ? 'secondary' : 'outline'
                      }>
                        {flag.type}
                      </Badge>
                      {flag.category && (
                        <Badge variant="outline" className="text-xs">
                          {flag.category}
                        </Badge>
                      )}
                      {flag.enabled && (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {flag.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Beaker className="h-3 w-3" />
                        <span>Key: {flag.key}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 ml-4">
                    <div className="text-right flex items-center gap-2">
                      <Switch
                        checked={flag.enabled}
                        onCheckedChange={() => handleToggleFlag(flag.key, flag.enabled)}
                        disabled={toggleMutation.isPending}
                      />
                      <Label className="text-sm text-gray-500">
                        {flag.enabled ? 'Enabled' : 'Disabled'}
                      </Label>
                      {toggleMutation.isPending && (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}