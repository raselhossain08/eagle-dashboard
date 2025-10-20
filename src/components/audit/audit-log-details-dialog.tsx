'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuditLogDetails } from '@/hooks/use-audit';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ChangesVisualization } from '@/components/audit/changes-visualization';
import { DataRedaction } from '@/components/audit/data-redaction';
import { format } from 'date-fns';
import { 
  User, 
  Calendar, 
  Shield, 
  Globe, 
  Monitor, 
  MapPin, 
  Cpu,
  AlertCircle
} from 'lucide-react';
import { useState } from 'react';

interface AuditLogDetailsDialogProps {
  logId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AuditLogDetailsDialog({ logId, isOpen, onClose }: AuditLogDetailsDialogProps) {
  const { data: log, isLoading } = useAuditLogDetails(logId || '');
  const [isRedacted, setIsRedacted] = useState(false);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'success': return 'default';
      case 'failure': return 'destructive';
      case 'error': return 'destructive';
      default: return 'secondary';
    }
  };

  // Redaction functions
  const redactEmail = (email: string) => {
    if (!isRedacted) return email;
    const [name, domain] = email.split('@');
    return `${name[0]}***@${domain}`;
  };

  const redactIP = (ip: string) => {
    if (!isRedacted) return ip;
    return ip.replace(/\d+$/, 'xxx');
  };

  const redactLocation = (location: string) => {
    if (!isRedacted) return location;
    return location.split(',')[0] + ', ***';
  };

  const redactUserAgent = (userAgent: string) => {
    if (!isRedacted) return userAgent;
    const parts = userAgent.split(' ');
    return parts.slice(0, 2).join(' ') + ' ***';
  };

  if (isLoading || !log) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Audit Log Details
            <Badge variant={getStatusVariant(log.status)}>
              {log.status.toUpperCase()}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <section>
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <InfoItem
                  icon={<User className="h-4 w-4" />}
                  label="Admin User"
                  value={redactEmail(log.adminUserEmail)}
                  subvalue={log.adminUserRole}
                />
                <InfoItem
                  icon={<Calendar className="h-4 w-4" />}
                  label="Timestamp"
                  value={format(new Date(log.timestamp), 'PPpp')}
                />
                <InfoItem
                  icon={<Shield className="h-4 w-4" />}
                  label="Action"
                  value={log.action}
                />
                {log.resourceType && (
                  <InfoItem
                    icon={<Cpu className="h-4 w-4" />}
                    label="Resource"
                    value={log.resourceType}
                    subvalue={log.resourceId}
                  />
                )}
              </div>
            </section>

            {/* Technical Details */}
            <section>
              <h3 className="text-lg font-semibold mb-4">Technical Details</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {log.ipAddress && (
                  <InfoItem
                    icon={<Globe className="h-4 w-4" />}
                    label="IP Address"
                    value={redactIP(log.ipAddress)}
                  />
                )}
                {log.location && (
                  <InfoItem
                    icon={<MapPin className="h-4 w-4" />}
                    label="Location"
                    value={redactLocation(log.location)}
                  />
                )}
                {log.userAgent && (
                  <InfoItem
                    icon={<Monitor className="h-4 w-4" />}
                    label="User Agent"
                    value={redactUserAgent(log.userAgent)}
                  />
                )}
                {log.sessionId && (
                  <InfoItem
                    icon={<Shield className="h-4 w-4" />}
                    label="Session ID"
                    value={log.sessionId}
                  />
                )}
              </div>
            </section>

            {/* Error Information */}
            {log.errorMessage && (
              <section>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  Error Details
                </h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <code className="text-sm text-red-800 whitespace-pre-wrap">
                    {log.errorMessage}
                  </code>
                </div>
              </section>
            )}

            {/* Changes Visualization */}
            {(log.beforeState || log.afterState || log.changes) && (
              <section>
                <h3 className="text-lg font-semibold mb-4">Changes</h3>
                <ChangesVisualization
                  beforeState={log.beforeState}
                  afterState={log.afterState}
                  changes={log.changes}
                  mode="side-by-side"
                />
              </section>
            )}

            {/* Metadata */}
            {log.metadata && Object.keys(log.metadata).length > 0 && (
              <section>
                <h3 className="text-lg font-semibold mb-4">Metadata</h3>
                <div className="bg-muted rounded-lg p-4">
                  <pre className="text-sm whitespace-pre-wrap">
                    {JSON.stringify(log.metadata, null, 2)}
                  </pre>
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <DataRedaction 
              log={log}
              onRedactionChange={setIsRedacted}
            />

            {/* Security Assessment */}
            <section className="border rounded-lg p-4">
              <h4 className="font-semibold mb-3">Security Assessment</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Risk Level:</span>
                  <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                    {log.status === 'success' ? 'Low' : 'High'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Data Sensitivity:</span>
                  <span>Medium</span>
                </div>
                <div className="flex justify-between">
                  <span>Compliance:</span>
                  <span>Compliant</span>
                </div>
              </div>
            </section>

            {/* Related Actions */}
            <section className="border rounded-lg p-4">
              <h4 className="font-semibold mb-3">Related Actions</h4>
              <div className="space-y-2 text-sm">
                <button className="text-blue-600 hover:underline text-left">
                  View all actions by {redactEmail(log.adminUserEmail)}
                </button>
                {log.resourceType && log.resourceId && (
                  <button className="text-blue-600 hover:underline text-left">
                    View history for this resource
                  </button>
                )}
                <button className="text-blue-600 hover:underline text-left">
                  Export this log entry
                </button>
              </div>
            </section>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InfoItem({ 
  icon, 
  label, 
  value, 
  subvalue 
}: { 
  icon: React.ReactNode;
  label: string;
  value: string;
  subvalue?: string;
}) {
  return (
    <div className="flex items-start space-x-3">
      <div className="mt-1 text-muted-foreground">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-sm truncate">{value}</p>
        {subvalue && (
          <p className="text-xs text-muted-foreground truncate font-mono">
            {subvalue}
          </p>
        )}
      </div>
    </div>
  );
}