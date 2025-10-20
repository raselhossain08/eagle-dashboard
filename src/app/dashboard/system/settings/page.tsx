// src/app/dashboard/system/settings/page.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SettingsEditor } from '@/components/system/SettingsEditor';
import { Button } from '@/components/ui/button';
import { Save, Download, Upload } from 'lucide-react';

const generalSettings = [
  {
    key: 'app.name',
    value: 'Eagle System',
    type: 'string' as const,
    label: 'Application Name',
    description: 'The name of your application'
  },
  {
    key: 'app.timezone',
    value: 'UTC',
    type: 'select' as const,
    label: 'Timezone',
    description: 'Default timezone for the system',
    options: ['UTC', 'EST', 'PST', 'CET']
  },
  {
    key: 'app.maintenance',
    value: false,
    type: 'boolean' as const,
    label: 'Maintenance Mode',
    description: 'Put the system in maintenance mode'
  }
];

const securitySettings = [
  {
    key: 'security.2fa',
    value: true,
    type: 'boolean' as const,
    label: 'Two-Factor Authentication',
    description: 'Require 2FA for all users'
  },
  {
    key: 'security.session_timeout',
    value: 60,
    type: 'number' as const,
    label: 'Session Timeout (minutes)',
    description: 'User session timeout duration'
  }
];

export default function SettingsPage() {
  const handleExport = () => {
    // Implement export logic
    console.log('Exporting settings...');
  };

  const handleImport = () => {
    // Implement import logic
    console.log('Importing settings...');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            System Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Configure system-wide settings and preferences
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" onClick={handleImport} className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Import
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <SettingsEditor settings={generalSettings} category="General" />
        </TabsContent>

        <TabsContent value="security">
          <SettingsEditor settings={securitySettings} category="Security" />
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Settings</CardTitle>
              <CardDescription>
                Configure system performance and optimization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Performance settings coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Manage system notifications and alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Notification settings coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}