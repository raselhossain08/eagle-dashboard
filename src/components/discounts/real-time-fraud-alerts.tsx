// components/discounts/real-time-fraud-alerts.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  AlertTriangle, 
  Shield, 
  Eye, 
  X, 
  Wifi, 
  WifiOff, 
  Clock,
  MapPin,
  User,
  Activity
} from 'lucide-react';
import { useFraudWebSocket } from '@/hooks/use-fraud-websocket';
import { RealTimeFraudAlert } from '@/lib/api/fraud-detection.service';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface RealTimeFraudAlertsProps {
  onAlertClick?: (alert: RealTimeFraudAlert) => void;
  maxHeight?: string;
}

export function RealTimeFraudAlerts({ 
  onAlertClick, 
  maxHeight = "400px" 
}: RealTimeFraudAlertsProps) {
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);

  const {
    isConnected,
    connectionStatus,
    alerts,
    totalAlerts,
    criticalAlerts,
    highAlerts,
    recentAlerts,
    clearAlerts,
    connect,
    disconnect
  } = useFraudWebSocket({
    autoConnect: true,
    enableNotifications: true,
    onAlert: (alert) => {
      console.log('New fraud alert received:', alert);
    }
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'high':
        return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'low':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'medium':
        return <Shield className="h-4 w-4 text-yellow-600" />;
      case 'low':
        return <Shield className="h-4 w-4 text-blue-600" />;
      default:
        return <Shield className="h-4 w-4 text-gray-600" />;
    }
  };

  const getConnectionStatus = () => {
    switch (connectionStatus) {
      case 'connected':
        return (
          <div className="flex items-center space-x-2 text-green-600">
            <Wifi className="h-4 w-4" />
            <span className="text-sm">Live</span>
          </div>
        );
      case 'connecting':
        return (
          <div className="flex items-center space-x-2 text-yellow-600">
            <Activity className="h-4 w-4 animate-spin" />
            <span className="text-sm">Connecting...</span>
          </div>
        );
      case 'error':
      case 'disconnected':
        return (
          <div className="flex items-center space-x-2 text-red-600">
            <WifiOff className="h-4 w-4" />
            <span className="text-sm">Offline</span>
          </div>
        );
    }
  };

  const handleAlertClick = (alert: RealTimeFraudAlert) => {
    setSelectedAlert(alert.id === selectedAlert ? null : alert.id);
    if (onAlertClick) {
      onAlertClick(alert);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Real-time Fraud Alerts
            {recentAlerts > 0 && (
              <Badge variant="destructive" className="ml-2">
                {recentAlerts} New
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center space-x-3">
            {getConnectionStatus()}
            
            {!isConnected && (
              <Button size="sm" variant="outline" onClick={connect}>
                Reconnect
              </Button>
            )}
            
            {alerts.length > 0 && (
              <Button size="sm" variant="ghost" onClick={clearAlerts}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Alert Stats */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="text-sm font-medium">{totalAlerts}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div className="text-center p-2 bg-red-50 rounded">
            <div className="text-sm font-medium text-red-700">{criticalAlerts}</div>
            <div className="text-xs text-muted-foreground">Critical</div>
          </div>
          <div className="text-center p-2 bg-orange-50 rounded">
            <div className="text-sm font-medium text-orange-700">{highAlerts}</div>
            <div className="text-xs text-muted-foreground">High</div>
          </div>
          <div className="text-center p-2 bg-blue-50 rounded">
            <div className="text-sm font-medium text-blue-700">{recentAlerts}</div>
            <div className="text-xs text-muted-foreground">Recent</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <ScrollArea style={{ height: maxHeight }}>
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No fraud alerts detected</p>
              <p className="text-sm">System is monitoring for suspicious activity</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert, index) => (
                <div key={alert.id}>
                  <div
                    className={cn(
                      "p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md",
                      getSeverityColor(alert.severity),
                      selectedAlert === alert.id && "ring-2 ring-blue-500 ring-offset-2"
                    )}
                    onClick={() => handleAlertClick(alert)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        {getSeverityIcon(alert.severity)}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="text-sm font-semibold truncate">
                              {alert.type.replace(/_/g, ' ').toUpperCase()}
                            </h4>
                            <Badge 
                              variant="outline" 
                              className={cn("text-xs", getSeverityColor(alert.severity))}
                            >
                              {alert.severity}
                            </Badge>
                            {alert.autoBlocked && (
                              <Badge variant="destructive" className="text-xs">
                                Auto-blocked
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm mb-2">{alert.message}</p>
                          
                          <div className="flex items-center space-x-4 text-xs">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{formatDistanceToNow(alert.timestamp, { addSuffix: true })}</span>
                            </div>
                            
                            {alert.ipAddress && (
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-3 w-3" />
                                <span>{alert.ipAddress}</span>
                              </div>
                            )}
                            
                            {alert.userId && (
                              <div className="flex items-center space-x-1">
                                <User className="h-3 w-3" />
                                <span>{alert.userId}</span>
                              </div>
                            )}
                          </div>

                          {/* Expanded Details */}
                          {selectedAlert === alert.id && alert.deviceInfo && (
                            <div className="mt-3 p-2 bg-white/50 rounded border">
                              <h5 className="text-xs font-medium mb-1">Device Information:</h5>
                              <div className="text-xs text-muted-foreground">
                                <div>User Agent: {alert.deviceInfo.userAgent}</div>
                                <div>Platform: {alert.deviceInfo.platform}</div>
                                <div>Redemption ID: {alert.redemptionId}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {index < alerts.length - 1 && <Separator className="my-2" />}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Connection Status Footer */}
        <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {isConnected ? 'Monitoring in real-time' : 'Connection lost - attempting to reconnect'}
          </span>
          <span>Last updated: {formatDistanceToNow(new Date(), { addSuffix: true })}</span>
        </div>
      </CardContent>
    </Card>
  );
}