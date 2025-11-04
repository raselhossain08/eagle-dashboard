import { useEffect, useRef } from 'react';
import { healthWebSocketService } from '@/lib/websocket/health-websocket';

export const useHealthWebSocket = () => {
  const connectionAttempted = useRef(false);

  useEffect(() => {
    // Prevent multiple connection attempts
    if (connectionAttempted.current) {
      return;
    }
    
    connectionAttempted.current = true;
    
    // Connect to WebSocket when component mounts (with fallback polling)
    try {
      healthWebSocketService.connect();
    } catch (error) {
      console.error('Failed to initialize health WebSocket service:', error);
    }

    // Cleanup on unmount
    return () => {
      healthWebSocketService.disconnect();
      connectionAttempted.current = false;
    };
  }, []);
};