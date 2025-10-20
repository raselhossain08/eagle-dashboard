interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: string;
}

type MessageHandler = (message: WebSocketMessage) => void;

class SupportWebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageHandlers: Map<string, MessageHandler[]> = new Map();
  private connectionCallbacks: ((connected: boolean) => void)[] = [];

  connect() {
    try {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001/support';
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected to support service');
        this.reconnectAttempts = 0;
        this.notifyConnectionChange(true);
        
        // Send authentication token if available
        this.sendAuthentication();
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        this.notifyConnectionChange(false);
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Error connecting WebSocket:', error);
      this.attemptReconnect();
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
      
      setTimeout(() => {
        if (this.ws?.readyState !== WebSocket.OPEN) {
          this.connect();
        }
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  private sendAuthentication() {
    // In a real implementation, you would send an authentication token
    const token = localStorage.getItem('auth_token');
    if (token) {
      this.sendMessage('AUTHENTICATE', { token });
    }
  }

  private handleMessage(message: WebSocketMessage) {
    const handlers = this.messageHandlers.get(message.type) || [];
    handlers.forEach(handler => {
      try {
        handler(message);
      } catch (error) {
        console.error('Error in message handler:', error);
      }
    });
  }

  onMessage(type: string, handler: MessageHandler) {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    this.messageHandlers.get(type)!.push(handler);
    
    // Return unsubscribe function
    return () => {
      const handlers = this.messageHandlers.get(type) || [];
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    };
  }

  onConnectionChange(callback: (connected: boolean) => void) {
    this.connectionCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.connectionCallbacks.indexOf(callback);
      if (index > -1) {
        this.connectionCallbacks.splice(index, 1);
      }
    };
  }

  private notifyConnectionChange(connected: boolean) {
    this.connectionCallbacks.forEach(callback => {
      try {
        callback(connected);
      } catch (error) {
        console.error('Error in connection callback:', error);
      }
    });
  }

  sendMessage(type: string, payload: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type,
        payload,
        timestamp: new Date().toISOString()
      };
      this.ws.send(JSON.stringify(message));
      return true;
    } else {
      console.warn('WebSocket not connected, message not sent:', type);
      return false;
    }
  }

  // Specific message types for support module
  subscribeToSupportNotes(customerId?: string) {
    this.sendMessage('SUBSCRIBE_NOTES', { customerId });
  }

  unsubscribeFromSupportNotes(customerId?: string) {
    this.sendMessage('UNSUBSCRIBE_NOTES', { customerId });
  }

  subscribeToImpersonation() {
    this.sendMessage('SUBSCRIBE_IMPERSONATION', {});
  }

  unsubscribeFromImpersonation() {
    this.sendMessage('UNSUBSCRIBE_IMPERSONATION', {});
  }

  subscribeToTeamActivity() {
    this.sendMessage('SUBSCRIBE_TEAM_ACTIVITY', {});
  }

  unsubscribeFromTeamActivity() {
    this.sendMessage('UNSUBSCRIBE_TEAM_ACTIVITY', {});
  }

  // Utility methods
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.messageHandlers.clear();
  }
}

// Create singleton instance
export const supportWebSocketService = new SupportWebSocketService();

// React hook for using WebSocket in components
export const useSupportWebSocket = () => {
  // This would be implemented as a custom hook in a real application
  return {
    isConnected: supportWebSocketService.isConnected(),
    subscribeToNotes: supportWebSocketService.subscribeToSupportNotes,
    unsubscribeFromNotes: supportWebSocketService.unsubscribeFromSupportNotes,
    subscribeToImpersonation: supportWebSocketService.subscribeToImpersonation,
    unsubscribeFromImpersonation: supportWebSocketService.unsubscribeFromImpersonation,
    sendMessage: supportWebSocketService.sendMessage
  };
};