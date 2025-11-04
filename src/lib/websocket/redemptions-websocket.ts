// lib/websocket/redemptions-websocket.ts - Real-time Redemptions WebSocket Integration
import { useEffect, useRef, useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface RedemptionWebSocketEvent {
  type: 'redemption_created' | 'redemption_flagged' | 'suspicious_activity' | 'fraud_alert' | 'stats_updated';
  payload: {
    redemption?: any;
    message?: string;
    severity?: 'info' | 'warning' | 'error';
    stats?: any;
    timestamp: string;
  };
}

interface UseRedemptionWebSocketOptions {
  enabled?: boolean;
  onRedemptionCreated?: (redemption: any) => void;
  onSuspiciousActivity?: (activity: any) => void;
  onFraudAlert?: (alert: any) => void;
  onStatsUpdated?: (stats: any) => void;
  onError?: (error: Error) => void;
}

export function useRedemptionWebSocket(options: UseRedemptionWebSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [lastEvent, setLastEvent] = useState<RedemptionWebSocketEvent | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      setConnectionStatus('connecting');
      
      // Use environment variable for WebSocket URL
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
      const token = localStorage.getItem('accessToken');
      
      ws.current = new WebSocket(`${wsUrl}/redemptions?token=${token}`);

      ws.current.onopen = () => {
        console.log('✅ Redemption WebSocket connected');
        setIsConnected(true);
        setConnectionStatus('connected');
        reconnectAttempts.current = 0;
        
        toast.success('Real-time monitoring enabled', {
          duration: 2000,
          position: 'bottom-right'
        });
      };

      ws.current.onmessage = (event) => {
        try {
          const data: RedemptionWebSocketEvent = JSON.parse(event.data);
          setLastEvent(data);
          
          // Handle different event types
          switch (data.type) {
            case 'redemption_created':
              console.log('🆕 New redemption:', data.payload.redemption);
              options.onRedemptionCreated?.(data.payload.redemption);
              
              toast.info('New redemption received', {
                description: `Code: ${data.payload.redemption?.code}`,
                duration: 3000,
              });
              break;

            case 'suspicious_activity':
              console.log('⚠️ Suspicious activity detected:', data.payload);
              options.onSuspiciousActivity?.(data.payload);
              
              toast.warning('Suspicious activity detected!', {
                description: data.payload.message || 'Review required',
                duration: 5000,
                action: {
                  label: 'View Details',
                  onClick: () => {
                    // Navigate to suspicious redemptions
                    window.location.href = '/dashboard/discounts/redemptions?filter=suspicious';
                  }
                }
              });
              break;

            case 'fraud_alert':
              console.log('🚨 Fraud alert:', data.payload);
              options.onFraudAlert?.(data.payload);
              
              toast.error('FRAUD ALERT!', {
                description: data.payload.message || 'Immediate attention required',
                duration: 10000,
                action: {
                  label: 'Investigate',
                  onClick: () => {
                    // Navigate to fraud investigation
                    window.location.href = '/dashboard/fraud-detection';
                  }
                }
              });
              break;

            case 'redemption_flagged':
              console.log('🏴 Redemption flagged:', data.payload);
              
              toast.info('Redemption flagged for review', {
                description: data.payload.message,
                duration: 4000,
              });
              break;

            case 'stats_updated':
              console.log('📊 Stats updated:', data.payload.stats);
              options.onStatsUpdated?.(data.payload.stats);
              break;

            default:
              console.log('📨 Unknown event type:', data.type);
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.current.onclose = (event) => {
        console.log('❌ Redemption WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        setConnectionStatus('disconnected');

        // Attempt to reconnect if not a clean close
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts && options.enabled !== false) {
          reconnectAttempts.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000);
          
          console.log(`🔄 Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts.current}/${maxReconnectAttempts})`);
          
          setTimeout(() => {
            connect();
          }, delay);
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          setConnectionStatus('error');
          toast.error('Connection lost', {
            description: 'Real-time updates disabled. Please refresh the page.',
            duration: 8000,
            action: {
              label: 'Refresh',
              onClick: () => window.location.reload()
            }
          });
        }
      };

      ws.current.onerror = (error) => {
        console.error('❌ Redemption WebSocket error:', error);
        setConnectionStatus('error');
        options.onError?.(new Error('WebSocket connection failed'));
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionStatus('error');
      options.onError?.(error as Error);
    }
  }, [options]);

  const disconnect = useCallback(() => {
    if (ws.current) {
      ws.current.close(1000, 'Manual disconnect');
      ws.current = null;
    }
    setIsConnected(false);
    setConnectionStatus('disconnected');
  }, []);

  // Send message to server
  const sendMessage = useCallback((message: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, cannot send message:', message);
    }
  }, []);

  // Subscribe to specific redemption updates
  const subscribeToRedemption = useCallback((redemptionId: string) => {
    sendMessage({
      type: 'subscribe',
      target: 'redemption',
      redemptionId
    });
  }, [sendMessage]);

  // Subscribe to user-specific updates
  const subscribeToUser = useCallback((userId: string) => {
    sendMessage({
      type: 'subscribe',
      target: 'user',
      userId
    });
  }, [sendMessage]);

  // Subscribe to fraud alerts
  const subscribeToFraudAlerts = useCallback(() => {
    sendMessage({
      type: 'subscribe',
      target: 'fraud_alerts'
    });
  }, [sendMessage]);

  useEffect(() => {
    if (options.enabled !== false) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [options.enabled, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  return {
    isConnected,
    connectionStatus,
    lastEvent,
    connect,
    disconnect,
    sendMessage,
    subscribeToRedemption,
    subscribeToUser,
    subscribeToFraudAlerts,
    // Connection helpers
    isConnecting: connectionStatus === 'connecting',
    hasError: connectionStatus === 'error',
    canReconnect: reconnectAttempts.current < maxReconnectAttempts,
  };
}

// Hook for live redemption stats
export function useRedemptionStatsWebSocket() {
  const [liveStats, setLiveStats] = useState<any>(null);
  
  const { isConnected, sendMessage } = useRedemptionWebSocket({
    onStatsUpdated: (stats) => {
      setLiveStats(stats);
    }
  });

  useEffect(() => {
    if (isConnected) {
      // Request initial stats
      sendMessage({
        type: 'subscribe',
        target: 'stats'
      });
    }
  }, [isConnected, sendMessage]);

  return {
    liveStats,
    isConnected
  };
}

// Status helper functions
export const getConnectionStatusColor = (connectionStatus: string) => {
  switch (connectionStatus) {
    case 'connected': return 'bg-green-500';
    case 'connecting': return 'bg-yellow-500 animate-pulse';
    case 'error': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

export const getConnectionStatusText = (connectionStatus: string) => {
  switch (connectionStatus) {
    case 'connected': return 'Live';
    case 'connecting': return 'Connecting...';
    case 'error': return 'Error';
    default: return 'Offline';
  }
};