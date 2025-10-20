// src/app/dashboard/system/settings/feature-flags/page.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFeatureFlags, useToggleFeatureFlag } from '@/hooks/useSystem';
import { Plus, Search, Users, Beaker } from 'lucide-react';

const mockFeatureFlags = [
  {
    key: 'dark_mode',
    name: 'Dark Mode',
    description: 'Enable dark mode theme across the application',
    enabled: true,
    type: 'release' as const,
    rollout: 100
  },
  {
    key: 'new_checkout',
    name: 'New Checkout Experience',
    description: 'Beta testing for the new checkout flow',
    enabled: false,
    type: 'beta' as const,
    rollout: 25
  },
  {
    key: 'ai_assistant',
    name: 'AI Assistant',
    description: 'Enable AI-powered customer support assistant',
    enabled: true,
    type: 'experimental' as const,
    rollout: 50
  },
  {
    key: 'advanced_analytics',
    name: 'Advanced Analytics',
    description: 'New analytics dashboard with enhanced metrics',
    enabled: false,
    type: 'release' as const,
    rollout: 0
  }
];

export default function FeatureFlagsPage() {
  const { data: flags, isLoading } = useFeatureFlags();
  const toggleMutation = useToggleFeatureFlag();

  const handleToggleFlag = (key: string, enabled: boolean) => {
    toggleMutation.mutate({ key, enabled: !enabled });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
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
            <div className="text-2xl font-bold">{mockFeatureFlags.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Flags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {mockFeatureFlags.filter(f => f.enabled).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Beta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {mockFeatureFlags.filter(f => f.type === 'beta').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Experimental</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {mockFeatureFlags.filter(f => f.type === 'experimental').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Feature Flags</CardTitle>
          <CardDescription>
            Toggle features and manage rollout percentages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input placeholder="Search feature flags..." className="pl-8" />
            </div>
          </div>

          <div className="space-y-4">
            {mockFeatureFlags.map((flag) => (
              <div key={flag.key} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">{flag.name}</h3>
                    <Badge variant={
                      flag.type === 'release' ? 'default' :
                      flag.type === 'beta' ? 'secondary' : 'outline'
                    }>
                      {flag.type}
                    </Badge>
                    {flag.enabled && (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {flag.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{flag.rollout}% rollout</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Beaker className="h-3 w-3" />
                      <span>Key: {flag.key}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <Switch
                      checked={flag.enabled}
                      onCheckedChange={() => handleToggleFlag(flag.key, flag.enabled)}
                    />
                    <Label className="text-sm text-gray-500 ml-2">
                      {flag.enabled ? 'Enabled' : 'Disabled'}
                    </Label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}