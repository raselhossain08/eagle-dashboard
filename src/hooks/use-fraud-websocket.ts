// hooks/use-fraud-websocket.ts
import { useEffect, useRef, useState } from 'react';
import { RealTimeFraudAlert } from '@/lib/api/fraud-detection.service';
import { toast } from 'sonner';

interface WebSocketMessage {
  type: 'fraud_alert' | 'investigation_update' | 'block_status' | 'system_status';
  payload: any;
  timestamp: string;
}

interface UseFraudWebSocketOptions {
  autoConnect?: boolean;
  onAlert?: (alert: RealTimeFraudAlert) => void;
  onInvestigationUpdate?: (update: any) => void;
  onBlockStatus?: (status: any) => void;
  enableNotifications?: boolean;
}

export const useFraudWebSocket = (options: UseFraudWebSocketOptions = {}) => {
  const {
    autoConnect = true,
    onAlert,
    onInvestigationUpdate,
    onBlockStatus,
    enableNotifications = true
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [alerts, setAlerts] = useState<RealTimeFraudAlert[]>([]);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  
  const ws = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = useRef(1000);

  const connect = () => {
    if (ws.current?.readyState === WebSocket.OPEN) return;

    setConnectionStatus('connecting');
    
    try {
      // Use environment variable for WebSocket URL, fallback to localhost
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001/fraud-alerts';
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('Fraud detection WebSocket connected');
        setIsConnected(true);
        setConnectionStatus('connected');
        reconnectAttempts.current = 0;
        reconnectDelay.current = 1000;

        // Send authentication if needed
        const token = localStorage.getItem('token');
        if (token && ws.current) {
          ws.current.send(JSON.stringify({
            type: 'authenticate',
            token
          }));
        }
      };

      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);

          switch (message.type) {
            case 'fraud_alert':
              const alert: RealTimeFraudAlert = {
                ...message.payload,
                timestamp: new Date(message.payload.timestamp)
              };
              
              setAlerts(prev => [alert, ...prev.slice(0, 49)]); // Keep last 50 alerts
              
              if (onAlert) {
                onAlert(alert);
              }

              // Show toast notification for critical alerts
              if (enableNotifications && (alert.severity === 'critical' || alert.severity === 'high')) {
                toast.error(`${alert.severity.toUpperCase()} Fraud Alert`, {
                  description: alert.message,
                  action: {
                    label: 'View Details',
                    onClick: () => {
                      console.log('Navigate to alert details:', alert.id);
                    }
                  },
                  duration: alert.severity === 'critical' ? 10000 : 5000,
                });
              }
              break;

            case 'investigation_update':
              if (onInvestigationUpdate) {
                onInvestigationUpdate(message.payload);
              }
              
              if (enableNotifications) {
                toast.info('Investigation Update', {
                  description: `Investigation ${message.payload.id} status: ${message.payload.status}`
                });
              }
              break;

            case 'block_status':
              if (onBlockStatus) {
                onBlockStatus(message.payload);
              }

              if (enableNotifications) {
                toast.success('Block Status Update', {
                  description: message.payload.message
                });
              }
              break;

            case 'system_status':
              console.log('Fraud detection system status:', message.payload);
              break;
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.current.onclose = (event) => {
        console.log('Fraud detection WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        setConnectionStatus('disconnected');

        // Attempt to reconnect if not manually closed
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          setTimeout(() => {
            reconnectAttempts.current++;
            reconnectDelay.current = Math.min(reconnectDelay.current * 2, 30000); // Max 30 seconds
            console.log(`Reconnecting to fraud detection WebSocket (attempt ${reconnectAttempts.current}/${maxReconnectAttempts})`);
            connect();
          }, reconnectDelay.current);
        }
      };

      ws.current.onerror = (error) => {
        console.error('Fraud detection WebSocket error:', error);
        setConnectionStatus('error');
        
        if (enableNotifications) {
          toast.error('Connection Error', {
            description: 'Lost connection to fraud monitoring system'
          });
        }
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionStatus('error');
    }
  };

  const disconnect = () => {
    if (ws.current) {
      ws.current.close(1000, 'Manual disconnect');
      ws.current = null;
    }
  };

  const sendMessage = (message: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  };

  const clearAlerts = () => {
    setAlerts([]);
  };

  // Subscribe to specific alert types
  const subscribeToAlerts = (alertTypes: string[]) => {
    sendMessage({
      type: 'subscribe',
      alertTypes
    });
  };

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect]);

  // Ping to keep connection alive
  useEffect(() => {
    if (!isConnected) return;

    const pingInterval = setInterval(() => {
      sendMessage({ type: 'ping' });
    }, 30000); // Ping every 30 seconds

    return () => clearInterval(pingInterval);
  }, [isConnected]);

  return {
    // Connection state
    isConnected,
    connectionStatus,
    
    // Data
    alerts,
    lastMessage,
    
    // Actions
    connect,
    disconnect,
    sendMessage,
    clearAlerts,
    subscribeToAlerts,
    
    // Stats
    totalAlerts: alerts.length,
    criticalAlerts: alerts.filter(a => a.severity === 'critical').length,
    highAlerts: alerts.filter(a => a.severity === 'high').length,
    recentAlerts: alerts.filter(a => 
      new Date().getTime() - a.timestamp.getTime() < 5 * 60 * 1000 // Last 5 minutes
    ).length
  };
};