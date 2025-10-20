import { useEffect, useRef, useState } from 'react';
import { supportWebSocketService } from '@/lib/realtime/support-websocket';

export const useSupportWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const messageHandlers = useRef<Map<string, Function>>(new Map());

  useEffect(() => {
    // Connect to WebSocket
    supportWebSocketService.connect();

    // Listen for connection changes
    const unsubscribeConnection = supportWebSocketService.onConnectionChange((connected) => {
      setIsConnected(connected);
    });

    // Set up message handlers
    const unsubscribeMessages = setupMessageHandlers();

    return () => {
      unsubscribeConnection();
      unsubscribeMessages.forEach(unsub => unsub());
      supportWebSocketService.disconnect();
    };
  }, []);

  const setupMessageHandlers = () => {
    const unsubscribes = [
      // New support note created
      supportWebSocketService.onMessage('NEW_SUPPORT_NOTE', (message) => {
        const handler = messageHandlers.current.get('NEW_SUPPORT_NOTE');
        if (handler) {
          handler(message.payload);
        }
      }),

      // Support note updated
      supportWebSocketService.onMessage('SUPPORT_NOTE_UPDATED', (message) => {
        const handler = messageHandlers.current.get('SUPPORT_NOTE_UPDATED');
        if (handler) {
          handler(message.payload);
        }
      }),

      // Impersonation started
      supportWebSocketService.onMessage('IMPERSONATION_STARTED', (message) => {
        const handler = messageHandlers.current.get('IMPERSONATION_STARTED');
        if (handler) {
          handler(message.payload);
        }
      }),

      // Impersonation ended
      supportWebSocketService.onMessage('IMPERSONATION_ENDED', (message) => {
        const handler = messageHandlers.current.get('IMPERSONATION_ENDED');
        if (handler) {
          handler(message.payload);
        }
      }),

      // Team member status changed
      supportWebSocketService.onMessage('TEAM_MEMBER_STATUS', (message) => {
        const handler = messageHandlers.current.get('TEAM_MEMBER_STATUS');
        if (handler) {
          handler(message.payload);
        }
      }),

      // High priority ticket created
      supportWebSocketService.onMessage('HIGH_PRIORITY_TICKET', (message) => {
        const handler = messageHandlers.current.get('HIGH_PRIORITY_TICKET');
        if (handler) {
          handler(message.payload);
        }
      })
    ];

    return unsubscribes;
  };

  const onMessage = (type: string, handler: Function) => {
    messageHandlers.current.set(type, handler);
    
    // Return unsubscribe function
    return () => {
      messageHandlers.current.delete(type);
    };
  };

  const subscribeToCustomerNotes = (customerId: string) => {
    supportWebSocketService.subscribeToSupportNotes(customerId);
    
    // Return unsubscribe function
    return () => {
      supportWebSocketService.unsubscribeFromSupportNotes(customerId);
    };
  };

  const subscribeToImpersonation = () => {
    supportWebSocketService.subscribeToImpersonation();
    
    // Return unsubscribe function
    return () => {
      supportWebSocketService.unsubscribeFromImpersonation();
    };
  };

  return {
    isConnected,
    onMessage,
    subscribeToCustomerNotes,
    subscribeToImpersonation,
    sendMessage: supportWebSocketService.sendMessage
  };
};