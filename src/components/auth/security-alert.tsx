// components/auth/security-alert.tsx
'use client';

import React from 'react';
import { AlertTriangle, Shield, Monitor, Users, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface SecurityAlertProps {
  id: string;
  type: 'suspicious_login' | 'new_device' | 'location_change' | 'multiple_sessions';
  message: string;
  timestamp: Date;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  onDismiss?: (id: string) => void;
  onAction?: (id: string) => void;
  actionLabel?: string;
}

const alertConfig = {
  suspicious_login: {
    icon: Shield,
    color: 'red',
    defaultSeverity: 'high' as const,
  },
  new_device: {
    icon: Monitor,
    color: 'orange',
    defaultSeverity: 'medium' as const,
  },
  location_change: {
    icon: AlertTriangle,
    color: 'yellow',
    defaultSeverity: 'medium' as const,
  },
  multiple_sessions: {
    icon: Users,
    color: 'blue',
    defaultSeverity: 'low' as const,
  },
};

const severityColors = {
  low: 'bg-blue-50 border-blue-200 text-blue-800',
  medium: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  high: 'bg-orange-50 border-orange-200 text-orange-800',
  critical: 'bg-red-50 border-red-200 text-red-800',
};

const severityBadges = {
  low: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  medium: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  high: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
  critical: 'bg-red-100 text-red-800 hover:bg-red-100',
};

export function SecurityAlert({ 
  id,
  type, 
  message, 
  timestamp, 
  severity,
  onDismiss, 
  onAction,
  actionLabel = 'View Details'
}: SecurityAlertProps) {
  const config = alertConfig[type];
  const Icon = config.icon;
  const alertSeverity = severity || config.defaultSeverity;
  const colorClass = severityColors[alertSeverity];
  const badgeClass = severityBadges[alertSeverity];

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const handleDismiss = () => {
    onDismiss?.(id);
  };

  const handleAction = () => {
    onAction?.(id);
  };

  return (
    <div className={`p-4 rounded-lg border ${colorClass} flex items-start gap-3 transition-all duration-200 hover:shadow-md`}>
      <div className="flex-shrink-0 mt-0.5">
        <Icon className={`h-5 w-5 text-${config.color}-600`} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium truncate">{message}</p>
            <Badge variant="secondary" className={`text-xs capitalize ${badgeClass}`}>
              {alertSeverity}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-xs opacity-75 mt-2">
          <Clock className="h-3 w-3" />
          <span>{formatTime(timestamp)}</span>
          <span>•</span>
          <span>{timestamp.toLocaleString()}</span>
        </div>
        
        {onAction && (
          <div className="mt-3 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAction}
              className="text-xs h-7"
            >
              {actionLabel}
            </Button>
          </div>
        )}
      </div>
      
      {onDismiss && (
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded"
          aria-label="Dismiss alert"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

// Security Alerts Container Component
interface SecurityAlertsContainerProps {
  alerts: SecurityAlertProps[];
  onDismissAlert: (id: string) => void;
  onActionAlert: (id: string) => void;
  maxAlerts?: number;
}

export function SecurityAlertsContainer({
  alerts,
  onDismissAlert,
  onActionAlert,
  maxAlerts = 5
}: SecurityAlertsContainerProps) {
  const displayedAlerts = alerts.slice(0, maxAlerts);

  if (displayedAlerts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-sm">No security alerts</p>
        <p className="text-xs mt-1">All security activities are normal</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {displayedAlerts.map((alert) => (
        <SecurityAlert
          key={alert.id}
          {...alert}
          onDismiss={onDismissAlert}
          onAction={onActionAlert}
        />
      ))}
      
      {alerts.length > maxAlerts && (
        <div className="text-center pt-2">
          <p className="text-xs text-gray-500">
            +{alerts.length - maxAlerts} more alert{alerts.length - maxAlerts !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}