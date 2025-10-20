import { HealthMetrics, Alert } from '@/types/health';
import { useHealthStore } from '@/stores/health-store';

class HealthWebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;

  connect() {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/health/ws`;
      
      this.socket = new WebSocket(wsUrl);
      
      this.socket.onopen = () => {
        console.log('Health WebSocket connected');
        this.reconnectAttempts = 0;
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.socket.onclose = () => {
        console.log('Health WebSocket disconnected');
        this.handleReconnect();
      };

      this.socket.onerror = (error) => {
        console.error('Health WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  }

  private handleMessage(data: any) {
    const store = useHealthStore.getState();

    if (data.type === 'health_update') {
      store.setHealth(data.payload as HealthMetrics);
    } else if (data.type === 'alert') {
      store.addAlert(data.payload as Alert);
    } else if (data.type === 'metrics_update') {
      // Update specific metrics
      if (store.currentHealth) {
        const updatedHealth = {
          ...store.currentHealth,
          systemMetrics: {
            ...store.currentHealth.systemMetrics,
            ...data.payload,
          },
        };
        store.setHealth(updatedHealth);
      }
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, this.reconnectInterval);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  send(message: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }
}

export const healthWebSocketService = new HealthWebSocketService();