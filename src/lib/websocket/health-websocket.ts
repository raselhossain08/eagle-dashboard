import { HealthMetrics, Alert } from '@/types/health';
import { useHealthStore } from '@/stores/health-store';

class HealthWebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3; // Reduced attempts
  private reconnectInterval = 5000; // Increased interval
  private isWebSocketSupported = true;
  private fallbackPollingInterval: NodeJS.Timeout | null = null;

  connect() {
    // Don't attempt WebSocket if not supported or already disabled
    if (!this.isWebSocketSupported) {
      console.log('WebSocket not supported, using fallback polling');
      this.startFallbackPolling();
      return;
    }

    // Don't attempt to connect if already connecting or connected
    if (this.socket && (this.socket.readyState === WebSocket.CONNECTING || this.socket.readyState === WebSocket.OPEN)) {
      return;
    }

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/health/ws`;
      
      console.log(`Attempting to connect to health WebSocket: ${wsUrl}`);
      this.socket = new WebSocket(wsUrl);
      
      // Set a timeout for connection
      const connectionTimeout = setTimeout(() => {
        if (this.socket && this.socket.readyState === WebSocket.CONNECTING) {
          console.log('WebSocket connection timeout, falling back to polling');
          this.socket.close();
          this.disableWebSocket();
        }
      }, 5000);

      this.socket.onopen = () => {
        clearTimeout(connectionTimeout);
        console.log('Health WebSocket connected successfully');
        this.reconnectAttempts = 0;
        
        // Send initial ping to establish connection
        this.send({ type: 'ping', timestamp: new Date().toISOString() });
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error, event.data);
        }
      };

      this.socket.onclose = (event) => {
        clearTimeout(connectionTimeout);
        console.log(`Health WebSocket disconnected: Code ${event.code}, Reason: ${event.reason || 'No reason provided'}`);
        this.socket = null;
        
        // If connection failed immediately, disable WebSocket
        if (event.code === 1006 && this.reconnectAttempts === 0) {
          console.info('Health WebSocket not available on server, using API polling instead');
          this.disableWebSocket();
          return;
        }
        
        // Only attempt reconnection if it wasn't a clean close and we haven't exceeded max attempts
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.handleReconnect();
        } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.info('Max WebSocket reconnection attempts reached, using API polling only');
          this.disableWebSocket();
        }
      };

      this.socket.onerror = (error) => {
        clearTimeout(connectionTimeout);
        console.warn('Health WebSocket error, this is expected if WebSocket is not implemented on backend:', error);
        if (this.socket) {
          this.socket.close();
        }
      };
    } catch (error) {
      console.error('Failed to create Health WebSocket:', error);
      this.disableWebSocket();
    }
  }

  private handleMessage(data: any) {
    try {
      const store = useHealthStore.getState();

      switch (data.type) {
        case 'health_update':
          if (data.payload && typeof data.payload === 'object') {
            store.setHealth(data.payload as HealthMetrics);
            console.log('Health data updated via WebSocket');
          }
          break;

        case 'alert':
          if (data.payload && typeof data.payload === 'object') {
            store.addAlert(data.payload as Alert);
            console.log('New alert received via WebSocket:', data.payload.title);
          }
          break;

        case 'metrics_update':
          // Update specific metrics
          if (data.payload && store.currentHealth) {
            const updatedHealth = {
              ...store.currentHealth,
              systemMetrics: {
                ...store.currentHealth.systemMetrics,
                ...data.payload,
                timestamp: new Date().toISOString(),
              },
              lastCheck: new Date().toISOString(),
            };
            store.setHealth(updatedHealth);
            console.log('System metrics updated via WebSocket');
          }
          break;

        case 'pong':
          // Handle ping/pong for connection health
          console.log('WebSocket pong received');
          break;

        case 'service_status_change':
          if (data.payload && store.currentHealth) {
            const updatedServices = store.currentHealth.services.map(service => 
              service.name === data.payload.name 
                ? { ...service, ...data.payload }
                : service
            );
            
            const updatedHealth = {
              ...store.currentHealth,
              services: updatedServices,
              lastCheck: new Date().toISOString(),
            };
            store.setHealth(updatedHealth);
            console.log(`Service status changed: ${data.payload.name} is now ${data.payload.status}`);
          }
          break;

        default:
          console.log('Unknown WebSocket message type:', data.type);
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error, data);
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

  private disableWebSocket() {
    this.isWebSocketSupported = false;
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    console.log('WebSocket disabled, health data will be fetched via regular API polling');
    // Don't start fallback polling here as React Query already handles this
  }

  private startFallbackPolling() {
    // Clear any existing polling
    if (this.fallbackPollingInterval) {
      clearInterval(this.fallbackPollingInterval);
    }

    // Not needed - React Query already handles polling
    console.log('WebSocket not available, relying on React Query polling for health data');
  }

  disconnect() {
    // Clear fallback polling
    if (this.fallbackPollingInterval) {
      clearInterval(this.fallbackPollingInterval);
      this.fallbackPollingInterval = null;
    }

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  send(message: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else if (!this.isWebSocketSupported) {
      console.log('WebSocket not available, message ignored:', message.type);
    }
  }
}

export const healthWebSocketService = new HealthWebSocketService();