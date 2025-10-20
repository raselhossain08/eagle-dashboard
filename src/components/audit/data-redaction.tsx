'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Shield, User, Mail, MapPin } from 'lucide-react';

interface DataRedactionProps {
  log: any;
  onRedactionChange?: (redacted: boolean) => void;
}

export function DataRedaction({ log, onRedactionChange }: DataRedactionProps) {
  const [isRedacted, setIsRedacted] = useState(false);
  const [redactionSettings, setRedactionSettings] = useState({
    emails: true,
    ipAddresses: true,
    locations: true,
    userAgents: false,
    metadata: false,
  });

  const redactEmail = (email: string) => {
    if (!isRedacted || !redactionSettings.emails) return email;
    const [name, domain] = email.split('@');
    return `${name[0]}***@${domain}`;
  };

  const redactIP = (ip: string) => {
    if (!isRedacted || !redactionSettings.ipAddresses) return ip;
    return ip.replace(/\d+$/, 'xxx');
  };

  const redactLocation = (location: string) => {
    if (!isRedacted || !redactionSettings.locations) return location;
    return location.split(',')[0] + ', ***';
  };

  const redactUserAgent = (userAgent: string) => {
    if (!isRedacted || !redactionSettings.userAgents) return userAgent;
    const parts = userAgent.split(' ');
    return parts.slice(0, 2).join(' ') + ' ***';
  };

  const redactMetadata = (metadata: any) => {
    if (!isRedacted || !redactionSettings.metadata || !metadata) return metadata;
    
    const redacted = { ...metadata };
    if (redacted.userId) redacted.userId = '***';
    if (redacted.sessionData) redacted.sessionData = '***';
    if (redacted.deviceInfo) redacted.deviceInfo = '***';
    
    return redacted;
  };

  const handleRedactionToggle = (redacted: boolean) => {
    setIsRedacted(redacted);
    onRedactionChange?.(redacted);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Data Redaction
        </CardTitle>
        <CardDescription>
          Protect sensitive information in audit logs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Redaction Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isRedacted ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <Label htmlFor="redaction-toggle">Enable Data Redaction</Label>
          </div>
          <Switch
            id="redaction-toggle"
            checked={isRedacted}
            onCheckedChange={handleRedactionToggle}
          />
        </div>

        {/* Redaction Settings */}
        {isRedacted && (
          <div className="space-y-3 border rounded-lg p-4">
            <div className="text-sm font-medium">Redaction Settings</div>
            
            <div className="grid gap-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="redact-emails"
                  checked={redactionSettings.emails}
                  onCheckedChange={(checked) => 
                    setRedactionSettings(prev => ({ ...prev, emails: checked }))
                  }
                />
                <Label htmlFor="redact-emails" className="flex items-center gap-2">
                  <Mail className="h-3 w-3" />
                  Email Addresses
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="redact-ip"
                  checked={redactionSettings.ipAddresses}
                  onCheckedChange={(checked) => 
                    setRedactionSettings(prev => ({ ...prev, ipAddresses: checked }))
                  }
                />
                <Label htmlFor="redact-ip" className="flex items-center gap-2">
                  <User className="h-3 w-3" />
                  IP Addresses
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="redact-locations"
                  checked={redactionSettings.locations}
                  onCheckedChange={(checked) => 
                    setRedactionSettings(prev => ({ ...prev, locations: checked }))
                  }
                />
                <Label htmlFor="redact-locations" className="flex items-center gap-2">
                  <MapPin className="h-3 w-3" />
                  Geographic Locations
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="redact-useragents"
                  checked={redactionSettings.userAgents}
                  onCheckedChange={(checked) => 
                    setRedactionSettings(prev => ({ ...prev, userAgents: checked }))
                  }
                />
                <Label htmlFor="redact-useragents">
                  User Agent Details
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="redact-metadata"
                  checked={redactionSettings.metadata}
                  onCheckedChange={(checked) => 
                    setRedactionSettings(prev => ({ ...prev, metadata: checked }))
                  }
                />
                <Label htmlFor="redact-metadata">
                  Sensitive Metadata
                </Label>
              </div>
            </div>
          </div>
        )}

        {/* Preview */}
        {isRedacted && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Preview</div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Email: {redactEmail(log.adminUserEmail)}</div>
              {log.ipAddress && <div>IP: {redactIP(log.ipAddress)}</div>}
              {log.location && <div>Location: {redactLocation(log.location)}</div>}
              {log.userAgent && <div>User Agent: {redactUserAgent(log.userAgent)}</div>}
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Data Protected
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}