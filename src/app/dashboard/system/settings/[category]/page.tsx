// src/app/dashboard/system/settings/[category]/page.tsx
'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { SettingsEditor } from '@/components/system/SettingsEditor';
import { ArrowLeft, Save, RefreshCw } from 'lucide-react';
import Link from 'next/link';

const categorySettings = {
  general: [
    {
      key: 'app.name',
      value: 'Eagle System',
      type: 'string' as const,
      label: 'Application Name',
      description: 'The name of your application displayed throughout the system'
    },
    {
      key: 'app.timezone',
      value: 'UTC',
      type: 'select' as const,
      label: 'Timezone',
      description: 'Default timezone for the system',
      options: ['UTC', 'EST', 'PST', 'CET', 'GMT']
    },
    {
      key: 'app.language',
      value: 'en',
      type: 'select' as const,
      label: 'Language',
      description: 'Default language for the system interface',
      options: ['en', 'es', 'fr', 'de', 'zh']
    }
  ],
  security: [
    {
      key: 'security.2fa',
      value: true,
      type: 'boolean' as const,
      label: 'Two-Factor Authentication',
      description: 'Require 2FA for all user accounts'
    },
    {
      key: 'security.session_timeout',
      value: 60,
      type: 'number' as const,
      label: 'Session Timeout (minutes)',
      description: 'User session timeout duration in minutes'
    },
    {
      key: 'security.password_policy',
      value: 'strong',
      type: 'select' as const,
      label: 'Password Policy',
      description: 'Password strength requirement policy',
      options: ['basic', 'medium', 'strong', 'very-strong']
    }
  ],
  performance: [
    {
      key: 'performance.cache_ttl',
      value: 3600,
      type: 'number' as const,
      label: 'Cache TTL (seconds)',
      description: 'Time-to-live for system cache in seconds'
    },
    {
      key: 'performance.query_timeout',
      value: 30,
      type: 'number' as const,
      label: 'Query Timeout (seconds)',
      description: 'Database query timeout duration'
    },
    {
      key: 'performance.compression',
      value: true,
      type: 'boolean' as const,
      label: 'Response Compression',
      description: 'Enable GZIP compression for API responses'
    }
  ],
  notifications: [
    {
      key: 'notifications.email_enabled',
      value: true,
      type: 'boolean' as const,
      label: 'Email Notifications',
      description: 'Enable email notifications for system events'
    },
    {
      key: 'notifications.slack_webhook',
      value: '',
      type: 'string' as const,
      label: 'Slack Webhook URL',
      description: 'Webhook URL for Slack notifications'
    },
    {
      key: 'notifications.alert_threshold',
      value: 'medium',
      type: 'select' as const,
      label: 'Alert Threshold',
      description: 'Minimum severity level for sending alerts',
      options: ['low', 'medium', 'high', 'critical']
    }
  ]
};

export default function SettingsCategoryPage() {
  const params = useParams();
  const category = params.category as string;

  const categoryTitles = {
    general: 'General Settings',
    security: 'Security Settings',
    performance: 'Performance Settings',
    notifications: 'Notification Settings'
  };

  const categoryDescriptions = {
    general: 'Basic system configuration and preferences',
    security: 'Security policies and authentication settings',
    performance: 'System performance and optimization settings',
    notifications: 'Notification and alert configuration'
  };

  const settings = categorySettings[category as keyof typeof categorySettings] || [];

  if (!settings.length) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Category Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            The settings category "{category}" does not exist.
          </p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/system/settings">
              Back to Settings
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/system/settings">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Settings
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {categoryTitles[category as keyof typeof categoryTitles]}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {categoryDescriptions[category as keyof typeof categoryDescriptions]}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Settings Editor */}
      <SettingsEditor settings={settings} category={category} />

      {/* Category Information */}
      <Card>
        <CardHeader>
          <CardTitle>About {categoryTitles[category as keyof typeof categoryTitles]}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            {category === 'general' && (
              <>
                <p>• General settings control the basic behavior and appearance of your system</p>
                <p>• Changes to these settings affect all users and system components</p>
                <p>• Some settings may require a system restart to take effect</p>
              </>
            )}
            {category === 'security' && (
              <>
                <p>• Security settings help protect your system and user data</p>
                <p>• Enable two-factor authentication for enhanced security</p>
                <p>• Configure session timeouts to balance security and user experience</p>
              </>
            )}
            {category === 'performance' && (
              <>
                <p>• Performance settings optimize system speed and resource usage</p>
                <p>• Adjust cache settings based on your system's memory availability</p>
                <p>• Monitor system performance after changing these settings</p>
              </>
            )}
            {category === 'notifications' && (
              <>
                <p>• Notification settings control how and when alerts are sent</p>
                <p>• Configure multiple notification channels for redundancy</p>
                <p>• Set appropriate alert thresholds to avoid notification fatigue</p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}