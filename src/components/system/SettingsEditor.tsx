// src/components/system/SettingsEditor.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useSystemSettings, useUpdateSetting, useUpdateBulkSettings } from '@/hooks/useSystem';
import { Save, RefreshCw, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Setting {
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'select' | 'textarea' | 'array' | 'object';
  label: string;
  description: string;
  options?: string[];
  category?: string;
  isEditable?: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    options?: string[];
  };
}

interface SettingsEditorProps {
  category: string;
  settings?: Setting[]; // Optional fallback for static settings
}

export function SettingsEditor({ category, settings: fallbackSettings }: SettingsEditorProps) {
  const [localSettings, setLocalSettings] = useState<Record<string, any>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch real settings from API
  const { 
    data: apiSettings, 
    isLoading, 
    error: loadError,
    refetch 
  } = useSystemSettings(category);
  
  const updateSettingMutation = useUpdateSetting();
  const updateBulkMutation = useUpdateBulkSettings();

  // Initialize local settings when API data loads
  useEffect(() => {
    if (apiSettings) {
      setLocalSettings(apiSettings);
    } else if (fallbackSettings) {
      // Convert fallback settings array to object
      const settingsObj: Record<string, any> = {};
      fallbackSettings.forEach(setting => {
        settingsObj[setting.key] = setting.value;
      });
      setLocalSettings(settingsObj);
    }
  }, [apiSettings, fallbackSettings]);

  const handleSettingChange = (key: string, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
    
    // Clear any existing error for this field
    if (errors[key]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const validateSetting = (key: string, value: any, setting: Setting): string | null => {
    if (!setting.validation) return null;

    const { min, max, pattern, options } = setting.validation;

    // Type validation
    switch (setting.type) {
      case 'number':
        const numValue = Number(value);
        if (isNaN(numValue)) return 'Must be a valid number';
        if (min !== undefined && numValue < min) return `Must be at least ${min}`;
        if (max !== undefined && numValue > max) return `Must be at most ${max}`;
        break;
      
      case 'string':
        if (pattern) {
          const regex = new RegExp(pattern);
          if (!regex.test(value)) return 'Invalid format';
        }
        break;
      
      case 'select':
        if (options && !options.includes(value)) {
          return `Must be one of: ${options.join(', ')}`;
        }
        break;
    }

    return null;
  };

  const handleSave = async () => {
    try {
      // Validate all settings
      const validationErrors: Record<string, string> = {};
      
      if (fallbackSettings) {
        fallbackSettings.forEach(setting => {
          const error = validateSetting(setting.key, localSettings[setting.key], setting);
          if (error) {
            validationErrors[setting.key] = error;
          }
        });
      }

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        toast.error('Please fix validation errors before saving');
        return;
      }

      // Save settings
      await updateBulkMutation.mutateAsync(localSettings);
      
      setHasChanges(false);
      setErrors({});
      toast.success('Settings saved successfully');
    } catch (error: any) {
      console.error('Failed to save settings:', error);
      toast.error(error.message || 'Failed to save settings');
    }
  };

  const handleReset = () => {
    if (apiSettings) {
      setLocalSettings(apiSettings);
    } else if (fallbackSettings) {
      const settingsObj: Record<string, any> = {};
      fallbackSettings.forEach(setting => {
        settingsObj[setting.key] = setting.value;
      });
      setLocalSettings(settingsObj);
    }
    setHasChanges(false);
    setErrors({});
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Settings refreshed');
  };

  const renderSettingInput = (setting: Setting) => {
    const value = localSettings[setting.key];
    const hasError = !!errors[setting.key];
    const isDisabled = setting.isEditable === false;

    const inputProps = {
      disabled: isDisabled,
      className: hasError ? 'border-red-500' : ''
    };

    switch (setting.type) {
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={Boolean(value)}
              onCheckedChange={(checked) => handleSettingChange(setting.key, checked)}
              disabled={isDisabled}
            />
            <span className="text-sm text-gray-500">
              {Boolean(value) ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        );
      
      case 'select':
        return (
          <Select 
            value={value || ''} 
            onValueChange={(newValue) => handleSettingChange(setting.key, newValue)}
            disabled={isDisabled}
          >
            <SelectTrigger className={inputProps.className}>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {setting.options?.map(option => (
                <SelectItem key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'number':
        return (
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => handleSettingChange(setting.key, Number(e.target.value))}
            {...inputProps}
            min={setting.validation?.min}
            max={setting.validation?.max}
          />
        );
      
      case 'textarea':
        return (
          <Textarea
            value={value || ''}
            onChange={(e) => handleSettingChange(setting.key, e.target.value)}
            {...inputProps}
            rows={4}
          />
        );
      
      case 'array':
      case 'object':
        return (
          <Textarea
            value={typeof value === 'object' ? JSON.stringify(value, null, 2) : value || ''}
            onChange={(e) => {
              try {
                const parsedValue = JSON.parse(e.target.value);
                handleSettingChange(setting.key, parsedValue);
              } catch {
                // Keep as string until valid JSON
                handleSettingChange(setting.key, e.target.value);
              }
            }}
            {...inputProps}
            rows={6}
            placeholder={`Enter valid JSON ${setting.type}`}
          />
        );
      
      default:
        return (
          <Input
            value={value || ''}
            onChange={(e) => handleSettingChange(setting.key, e.target.value)}
            {...inputProps}
          />
        );
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent className="space-y-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (loadError && !fallbackSettings) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Failed to Load Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {loadError.message || 'Failed to load system settings. Please try again.'}
            </AlertDescription>
          </Alert>
          <Button 
            variant="outline" 
            onClick={handleRefresh} 
            className="mt-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const settingsToRender = fallbackSettings || Object.keys(localSettings).map(key => ({
    key,
    value: localSettings[key],
    type: 'string' as const,
    label: key.split('.').pop()?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || key,
    description: `Setting for ${key}`,
    isEditable: true
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Settings Editor
              {hasChanges && (
                <Badge variant="secondary" className="text-xs">
                  Unsaved Changes
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Manage your system configuration for {category}
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {settingsToRender.map((setting) => (
          <div key={setting.key} className="space-y-2">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-1">
                <Label htmlFor={setting.key} className="text-sm font-medium flex items-center gap-2">
                  {setting.label}
                  {setting.isEditable === false && (
                    <Badge variant="outline" className="text-xs">Read-only</Badge>
                  )}
                </Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {setting.description}
                </p>
                {errors[setting.key] && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {errors[setting.key]}
                  </p>
                )}
              </div>
              <div className="min-w-0 flex-1 max-w-xs">
                {renderSettingInput(setting)}
              </div>
            </div>
          </div>
        ))}
        
        <div className="flex gap-2 pt-4 border-t">
          <Button 
            onClick={handleSave} 
            disabled={!hasChanges || updateBulkMutation.isPending}
            className="flex items-center gap-2"
          >
            {updateBulkMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Changes
          </Button>
          <Button 
            variant="outline" 
            onClick={handleReset} 
            disabled={!hasChanges}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Reset
          </Button>
          {hasChanges && (
            <Badge variant="outline" className="ml-auto self-center">
              {Object.keys(localSettings).length} setting(s) modified
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}