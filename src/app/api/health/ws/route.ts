import { NextRequest } from 'next/server';
import { WebSocketServer } from 'ws';
import { NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  if (!global.wss) {
    const wss = new WebSocketServer({ noServer: true });
    global.wss = wss;
    
    // Store connected clients
    global.clients = new Set();

    wss.on('connection', (ws) => {
      console.log('Client connected to health WebSocket');
      global.clients.add(ws);

      // Send initial health data
      const initialData = {
        type: 'health_update',
        payload: generateMockHealthData()
      };
      ws.send(JSON.stringify(initialData));

      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message.toString());
          console.log('Received WebSocket message:', data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });

      ws.on('close', () => {
        console.log('Client disconnected from health WebSocket');
        global.clients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        global.clients.delete(ws);
      });
    });

    // Simulate real-time updates every 10 seconds
    setInterval(() => {
      const healthData = {
        type: 'health_update',
        payload: generateMockHealthData()
      };
      
      const metricsUpdate = {
        type: 'metrics_update',
        payload: generateMockMetricsUpdate()
      };

      // Broadcast to all connected clients
      global.clients.forEach((client) => {
        if (client.readyState === 1) { // WebSocket.OPEN
          client.send(JSON.stringify(healthData));
          client.send(JSON.stringify(metricsUpdate));
        }
      });
    }, 10000);
  }

  return NextResponse.json({ status: 'WebSocket server running' });
}

function generateMockHealthData() {
  const services = [
    { name: 'database', status: 'up', responseTime: Math.random() * 50 + 20 },
    { name: 'redis', status: 'up', responseTime: Math.random() * 10 + 5 },
    { name: 'memory', status: 'up', responseTime: undefined },
    { name: 'disk', status: 'up', responseTime: undefined }
  ];

  // Randomly degrade a service occasionally
  if (Math.random() > 0.8) {
    const randomService = Math.floor(Math.random() * services.length);
    services[randomService].status = 'degraded';
  }

  const healthScore = calculateHealthScore(services);
  
  return {
    overall: healthScore >= 90 ? 'healthy' : healthScore >= 70 ? 'warning' : 'critical',
    services,
    systemMetrics: generateMockMetricsUpdate(),
    lastCheck: new Date().toISOString(),
    healthScore
  };
}

function generateMockMetricsUpdate() {
  return {
    memory: {
      heap: Math.random() * 1000000000 + 500000000,
      rss: Math.random() * 2000000000 + 1000000000,
      total: 4000000000,
      used: Math.random() * 3000000000 + 1000000000,
      usagePercentage: Math.random() * 30 + 60
    },
    disk: {
      total: 500000000000,
      used: Math.random() * 300000000000 + 150000000000,
      free: 500000000000 - (Math.random() * 300000000000 + 150000000000),
      usagePercentage: Math.random() * 20 + 70
    },
    cpu: {
      usage: Math.random() * 30 + 20,
      cores: 8
    },
    timestamp: new Date().toISOString()
  };
}

function calculateHealthScore(services: any[]): number {
  const weights = { database: 0.3, redis: 0.2, memory: 0.25, disk: 0.25 };
  let totalScore = 0;

  services.forEach(service => {
    const weight = weights[service.name as keyof typeof weights] || 0.1;
    const serviceScore = service.status === 'up' ? 100 : 
                        service.status === 'degraded' ? 50 : 0;
    totalScore += serviceScore * weight;
  });

  return Math.round(totalScore);
}

// Add to global type definitions
declare global {
  var wss: WebSocketServer | undefined;
  var clients: Set<any>;
}