// src/app/dashboard/system/settings/page.tsx
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SettingsEditor } from '@/components/system/SettingsEditor';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSystemHealth, useExportSettings, useImportSettings } from '@/hooks/useSystem';
import { Save, Download, Upload, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Category-specific setting definitions with real schema
const categorySettings = {
  general: [
    {
      key: 'app.name',
      value: 'Eagle System',
      type: 'string' as const,
      label: 'Application Name',
      description: 'The display name of your application'
    },
    {
      key: 'app.timezone',
      value: 'UTC',
      type: 'select' as const,
      label: 'Default Timezone',
      description: 'System-wide default timezone',
      options: ['UTC', 'America/New_York', 'America/Chicago', 'America/Los_Angeles', 'Europe/London', 'Europe/Berlin', 'Asia/Tokyo']
    },
    {
      key: 'app.language',
      value: 'en',
      type: 'select' as const,
      label: 'Default Language',
      description: 'System default language',
      options: ['en', 'es', 'fr', 'de', 'ja', 'zh']
    },
    {
      key: 'app.maintenance_mode',
      value: false,
      type: 'boolean' as const,
      label: 'Maintenance Mode',
      description: 'Enable maintenance mode to restrict system access'
    }
  ],
  security: [
    {
      key: 'security.2fa_required',
      value: true,
      type: 'boolean' as const,
      label: 'Require Two-Factor Authentication',
      description: 'Force all users to enable 2FA for enhanced security'
    },
    {
      key: 'security.session_timeout',
      value: 3600,
      type: 'number' as const,
      label: 'Session Timeout (seconds)',
      description: 'Automatic logout time for inactive users',
      validation: { min: 300, max: 86400 }
    },
    {
      key: 'security.password_policy',
      value: 'strong',
      type: 'select' as const,
      label: 'Password Policy',
      description: 'Minimum password strength requirements',
      options: ['basic', 'medium', 'strong', 'very-strong']
    },
    {
      key: 'security.max_login_attempts',
      value: 5,
      type: 'number' as const,
      label: 'Max Login Attempts',
      description: 'Maximum failed login attempts before account lockout',
      validation: { min: 3, max: 10 }
    }
  ],
  performance: [
    {
      key: 'performance.cache_ttl',
      value: 3600,
      type: 'number' as const,
      label: 'Cache TTL (seconds)',
      description: 'Default cache time-to-live for application data',
      validation: { min: 60, max: 86400 }
    },
    {
      key: 'performance.query_timeout',
      value: 30,
      type: 'number' as const,
      label: 'Database Query Timeout (seconds)',
      description: 'Maximum time to wait for database queries',
      validation: { min: 5, max: 300 }
    },
    {
      key: 'performance.enable_compression',
      value: true,
      type: 'boolean' as const,
      label: 'Enable Response Compression',
      description: 'Compress API responses to reduce bandwidth usage'
    },
    {
      key: 'performance.max_file_size',
      value: 10485760,
      type: 'number' as const,
      label: 'Max Upload Size (bytes)',
      description: 'Maximum file upload size limit',
      validation: { min: 1048576, max: 104857600 }
    }
  ],
  notifications: [
    {
      key: 'notifications.email_enabled',
      value: true,
      type: 'boolean' as const,
      label: 'Email Notifications',
      description: 'Enable system email notifications'
    },
    {
      key: 'notifications.slack_webhook_url',
      value: '',
      type: 'string' as const,
      label: 'Slack Webhook URL',
      description: 'Slack webhook URL for system notifications'
    },
    {
      key: 'notifications.alert_threshold',
      value: 'medium',
      type: 'select' as const,
      label: 'Alert Threshold',
      description: 'Minimum severity level for sending alerts',
      options: ['low', 'medium', 'high', 'critical']
    },
    {
      key: 'notifications.digest_frequency',
      value: 'daily',
      type: 'select' as const,
      label: 'Digest Frequency',
      description: 'How often to send notification digests',
      options: ['hourly', 'daily', 'weekly', 'monthly']
    }
  ]
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Real API hooks
  const { data: systemHealth } = useSystemHealth();
  const exportMutation = useExportSettings();
  const importMutation = useImportSettings();

  const handleExport = async (category?: string) => {
    try {
      setIsExporting(true);
      const result = await exportMutation.mutateAsync(category);
      
      // Create and download file
      const blob = new Blob([JSON.stringify(result, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `settings-${category || 'all'}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success(`Settings exported successfully`);
    } catch (error: any) {
      console.error('Export failed:', error);
      toast.error(error.message || 'Failed to export settings');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    try {
      setIsImporting(true);
      
      // Create file input
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      
      input.onchange = async (event: any) => {
        const file = event.target.files[0];
        if (!file) return;
        
        try {
          const text = await file.text();
          const data = JSON.parse(text);
          
          const result = await importMutation.mutateAsync(data);
          toast.success(`Imported ${result.imported} settings successfully`);
          
          if (result.failed > 0) {
            toast.warning(`${result.failed} settings failed to import`);
          }
        } catch (error: any) {
          console.error('Import failed:', error);
          toast.error(error.message || 'Failed to import settings');
        } finally {
          setIsImporting(false);
        }
      };
      
      input.click();
    } catch (error: any) {
      console.error('Import failed:', error);
      toast.error(error.message || 'Failed to import settings');
      setIsImporting(false);
    }
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
          <Button 
            variant="outline" 
            onClick={() => handleExport(activeTab)} 
            disabled={isExporting}
            className="flex items-center gap-2"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Export {activeTab}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleImport} 
            disabled={isImporting}
            className="flex items-center gap-2"
          >
            {isImporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Import
          </Button>
        </div>
      </div>

      {/* System Status Alert */}
      {systemHealth && systemHealth.status !== 'healthy' && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            System health: {systemHealth.status}. Some settings may not be available.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <SettingsEditor 
            category="general" 
            settings={categorySettings.general}
          />
        </TabsContent>

        <TabsContent value="security">
          <SettingsEditor 
            category="security" 
            settings={categorySettings.security}
          />
        </TabsContent>

        <TabsContent value="performance">
          <SettingsEditor 
            category="performance" 
            settings={categorySettings.performance}
          />
        </TabsContent>

        <TabsContent value="notifications">
          <SettingsEditor 
            category="notifications" 
            settings={categorySettings.notifications}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}