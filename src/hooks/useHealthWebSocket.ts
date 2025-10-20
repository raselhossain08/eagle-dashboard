import { useEffect } from 'react';
import { healthWebSocketService } from '@/lib/websocket/health-websocket';

export const useHealthWebSocket = () => {
  useEffect(() => {
    // Connect to WebSocket when component mounts
    healthWebSocketService.connect();

    // Cleanup on unmount
    return () => {
      healthWebSocketService.disconnect();
    };
  }, []);
};