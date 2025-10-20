import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useHealthSettingsStore } from '@/stores/health-settings-store';
import { Save, Bell, Mail, MessageSquare, Settings } from 'lucide-react';
import { useState } from 'react';

export function AlertSettings() {
  const {
    maintenanceMode,
    alertPreferences,
    thresholds,
    setMaintenanceMode,
    updateThresholds,
    updateAlertPreferences
  } = useHealthSettingsStore();

  const [localThresholds, setLocalThresholds] = useState(thresholds);
  const [localPreferences, setLocalPreferences] = useState(alertPreferences);

  const handleSave = () => {
    updateThresholds(localThresholds);
    updateAlertPreferences(localPreferences);
  };

  const handleThresholdChange = (key: keyof typeof thresholds, value: string) => {
    setLocalThresholds(prev => ({
      ...prev,
      [key]: parseInt(value) || 0
    }));
  };

  const handlePreferenceChange = (key: keyof typeof alertPreferences, value: boolean) => {
    setLocalPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Alert Settings & Configuration
        </CardTitle>
        <CardDescription>
          Configure alert thresholds and notification preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Maintenance Mode */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-0.5">
            <Label htmlFor="maintenance-mode" className="text-base">
              Maintenance Mode
            </Label>
            <p className="text-sm text-muted-foreground">
              Suppress all alerts during maintenance windows
            </p>
          </div>
          <Switch
            id="maintenance-mode"
            checked={maintenanceMode}
            onCheckedChange={setMaintenanceMode}
          />
        </div>

        {/* Alert Thresholds */}
        <div className="space-y-4">
          <h3 className="font-semibold">Alert Thresholds</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="memory-threshold">Memory Usage (%)</Label>
              <Input
                id="memory-threshold"
                type="number"
                value={localThresholds.memory}
                onChange={(e) => handleThresholdChange('memory', e.target.value)}
                min="0"
                max="100"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="disk-threshold">Disk Usage (%)</Label>
              <Input
                id="disk-threshold"
                type="number"
                value={localThresholds.disk}
                onChange={(e) => handleThresholdChange('disk', e.target.value)}
                min="0"
                max="100"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cpu-threshold">CPU Usage (%)</Label>
              <Input
                id="cpu-threshold"
                type="number"
                value={localThresholds.cpu}
                onChange={(e) => handleThresholdChange('cpu', e.target.value)}
                min="0"
                max="100"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="response-threshold">Response Time (ms)</Label>
              <Input
                id="response-threshold"
                type="number"
                value={localThresholds.responseTime}
                onChange={(e) => handleThresholdChange('responseTime', e.target.value)}
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="space-y-4">
          <h3 className="font-semibold">Notification Preferences</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4" />
                <div>
                  <Label htmlFor="email-alerts" className="text-sm font-medium">
                    Email Notifications
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Receive alerts via email
                  </p>
                </div>
              </div>
              <Switch
                id="email-alerts"
                checked={localPreferences.email}
                onCheckedChange={(checked) => handlePreferenceChange('email', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-4 w-4" />
                <div>
                  <Label htmlFor="sms-alerts" className="text-sm font-medium">
                    SMS Notifications
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Receive critical alerts via SMS
                  </p>
                </div>
              </div>
              <Switch
                id="sms-alerts"
                checked={localPreferences.sms}
                onCheckedChange={(checked) => handlePreferenceChange('sms', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4" />
                <div>
                  <Label htmlFor="browser-alerts" className="text-sm font-medium">
                    Browser Notifications
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Show browser notifications
                  </p>
                </div>
              </div>
              <Switch
                id="browser-alerts"
                checked={localPreferences.browser}
                onCheckedChange={(checked) => handlePreferenceChange('browser', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Settings className="h-4 w-4" />
                <div>
                  <Label htmlFor="critical-only" className="text-sm font-medium">
                    Critical Alerts Only
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Only receive critical severity alerts
                  </p>
                </div>
              </div>
              <Switch
                id="critical-only"
                checked={localPreferences.criticalOnly}
                onCheckedChange={(checked) => handlePreferenceChange('criticalOnly', checked)}
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <Button onClick={handleSave} className="w-full">
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </CardContent>
    </Card>
  );
}