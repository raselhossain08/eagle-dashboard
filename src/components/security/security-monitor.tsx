'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { toast } from 'sonner';
import { SecurityAlert, SecuritySession } from '@/lib/api/security';
import { useSecurityHealth, useSecurityAlerts, useSecuritySessions } from '@/hooks/use-security';

interface SecurityNotification {
  id: string;
  type: 'alert' | 'session' | 'health';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  data?: SecurityAlert | SecuritySession | any;
  timestamp: Date;
  read: boolean;
}

interface SecurityMonitorContextType {
  notifications: SecurityNotification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  isMonitoring: boolean;
  lastHealthCheck: Date | null;
}

const SecurityMonitorContext = createContext<SecurityMonitorContextType | undefined>(undefined);

interface SecurityMonitorProviderProps {
  children: ReactNode;
  enableRealTimeMonitoring?: boolean;
  healthCheckInterval?: number; // in milliseconds
  alertCheckInterval?: number;
}

export function SecurityMonitorProvider({ 
  children, 
  enableRealTimeMonitoring = true,
  healthCheckInterval = 5 * 60 * 1000, // 5 minutes
  alertCheckInterval = 2 * 60 * 1000, // 2 minutes
}: SecurityMonitorProviderProps) {
  const [notifications, setNotifications] = useState<SecurityNotification[]>([]);
  const [lastAlertCheck, setLastAlertCheck] = useState<Date>(new Date());
  const [lastHealthCheck, setLastHealthCheck] = useState<Date | null>(null);
  
  const { data: healthData, isError: healthError } = useSecurityHealth();
  const { data: alertsData } = useSecurityAlerts({ 
    active: true, 
    startDate: lastAlertCheck.toISOString(),
    limit: 50 
  });

  // Monitor health status changes
  useEffect(() => {
    if (healthData) {
      setLastHealthCheck(new Date());
      
      // Check for critical or warning health status
      if (healthData.status === 'critical') {
        const notification: SecurityNotification = {
          id: `health-${Date.now()}`,
          type: 'health',
          severity: 'critical',
          title: 'Critical Security Status',
          message: 'Security system requires immediate attention',
          data: healthData,
          timestamp: new Date(),
          read: false,
        };

        setNotifications(prev => [notification, ...prev]);
        toast.error(notification.title, {
          description: notification.message,
          duration: 10000,
        });
      } else if (healthData.status === 'warning') {
        const notification: SecurityNotification = {
          id: `health-${Date.now()}`,
          type: 'health',
          severity: 'medium',
          title: 'Security Warning',
          message: 'Security system status requires attention',
          data: healthData,
          timestamp: new Date(),
          read: false,
        };

        setNotifications(prev => [notification, ...prev]);
        toast.warning(notification.title, {
          description: notification.message,
        });
      }
    }
  }, [healthData]);

  // Monitor health errors
  useEffect(() => {
    if (healthError) {
      const notification: SecurityNotification = {
        id: `health-error-${Date.now()}`,
        type: 'health',
        severity: 'high',
        title: 'Security Health Check Failed',
        message: 'Unable to retrieve security system status',
        timestamp: new Date(),
        read: false,
      };

      setNotifications(prev => [notification, ...prev]);
      toast.error(notification.title);
    }
  }, [healthError]);

  // Monitor new alerts
  useEffect(() => {
    if (alertsData?.alerts && enableRealTimeMonitoring) {
      const newAlerts = alertsData.alerts.filter(alert => 
        new Date(alert.createdAt) > lastAlertCheck
      );

      newAlerts.forEach(alert => {
        const notification: SecurityNotification = {
          id: `alert-${alert._id}`,
          type: 'alert',
          severity: alert.severity,
          title: `Security Alert: ${alert.type.replace('_', ' ')}`,
          message: alert.message,
          data: alert,
          timestamp: new Date(alert.createdAt),
          read: false,
        };

        setNotifications(prev => [notification, ...prev]);

        // Show toast based on severity
        if (alert.severity === 'critical') {
          toast.error(notification.title, {
            description: notification.message,
            duration: 15000,
            action: {
              label: 'View Details',
              onClick: () => {
                // Navigate to alert details or open modal
                console.log('View alert:', alert);
              },
            },
          });
        } else if (alert.severity === 'high') {
          toast.warning(notification.title, {
            description: notification.message,
            duration: 10000,
          });
        } else {
          toast.info(notification.title, {
            description: notification.message,
          });
        }
      });

      if (newAlerts.length > 0) {
        setLastAlertCheck(new Date());
      }
    }
  }, [alertsData, enableRealTimeMonitoring, lastAlertCheck]);

  // Periodic monitoring intervals
  useEffect(() => {
    if (!enableRealTimeMonitoring) return;

    const healthInterval = setInterval(() => {
      setLastHealthCheck(new Date());
    }, healthCheckInterval);

    const alertInterval = setInterval(() => {
      setLastAlertCheck(new Date());
    }, alertCheckInterval);

    return () => {
      clearInterval(healthInterval);
      clearInterval(alertInterval);
    };
  }, [enableRealTimeMonitoring, healthCheckInterval, alertCheckInterval]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const contextValue: SecurityMonitorContextType = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    isMonitoring: enableRealTimeMonitoring,
    lastHealthCheck,
  };

  return (
    <SecurityMonitorContext.Provider value={contextValue}>
      {children}
    </SecurityMonitorContext.Provider>
  );
}

export function useSecurityMonitor() {
  const context = useContext(SecurityMonitorContext);
  if (!context) {
    throw new Error('useSecurityMonitor must be used within a SecurityMonitorProvider');
  }
  return context;
}

// Security notification badge component
export function SecurityNotificationBadge() {
  const { unreadCount } = useSecurityMonitor();

  if (unreadCount === 0) return null;

  return (
    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
      {unreadCount > 99 ? '99+' : unreadCount}
    </div>
  );
}

// Security status indicator
export function SecurityStatusIndicator() {
  const { lastHealthCheck, isMonitoring } = useSecurityMonitor();
  const { data: healthData, isLoading } = useSecurityHealth();

  if (!isMonitoring) return null;

  const getStatusColor = () => {
    if (isLoading) return 'bg-gray-400';
    if (!healthData) return 'bg-red-500';
    
    switch (healthData.status) {
      case 'healthy': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = () => {
    if (isLoading) return 'Checking...';
    if (!healthData) return 'Unknown';
    return healthData.status.charAt(0).toUpperCase() + healthData.status.slice(1);
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
      <span className="text-gray-600">Security: {getStatusText()}</span>
      {lastHealthCheck && (
        <span className="text-gray-400 text-xs">
          (Last check: {lastHealthCheck.toLocaleTimeString()})
        </span>
      )}
    </div>
  );
}