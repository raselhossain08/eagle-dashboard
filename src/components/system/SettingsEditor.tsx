// src/components/system/SettingsEditor.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, RefreshCw } from 'lucide-react';

interface Setting {
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'select';
  label: string;
  description: string;
  options?: string[];
}

interface SettingsEditorProps {
  settings: Setting[];
  category: string;
}

export function SettingsEditor({ settings, category }: SettingsEditorProps) {
  const [localSettings, setLocalSettings] = React.useState<Setting[]>(settings);

  const handleSettingChange = (key: string, value: any) => {
    setLocalSettings(prev =>
      prev.map(setting =>
        setting.key === key ? { ...setting, value } : setting
      )
    );
  };

  const handleSave = () => {
    // Implement save logic
    console.log('Saving settings:', localSettings);
  };

  const handleReset = () => {
    setLocalSettings(settings);
  };

  const renderSettingInput = (setting: Setting) => {
    switch (setting.type) {
      case 'boolean':
        return (
          <Switch
            checked={setting.value}
            onCheckedChange={(checked) => handleSettingChange(setting.key, checked)}
          />
        );
      
      case 'select':
        return (
          <Select value={setting.value} onValueChange={(value) => handleSettingChange(setting.key, value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {setting.options?.map(option => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'number':
        return (
          <Input
            type="number"
            value={setting.value}
            onChange={(e) => handleSettingChange(setting.key, Number(e.target.value))}
          />
        );
      
      default:
        return (
          <Input
            value={setting.value}
            onChange={(e) => handleSettingChange(setting.key, e.target.value)}
          />
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings Editor</CardTitle>
        <CardDescription>
          Manage your system configuration for {category}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {localSettings.map((setting) => (
          <div key={setting.key} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor={setting.key} className="text-sm font-medium">
                {setting.label}
              </Label>
              {renderSettingInput(setting)}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {setting.description}
            </p>
          </div>
        ))}
        
        <div className="flex gap-2 pt-4">
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
          <Button variant="outline" onClick={handleReset} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}