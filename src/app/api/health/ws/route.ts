import { NextRequest } from 'next/server';
import { WebSocketServer } from 'ws';
import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const API_PREFIX = process.env.API_PREFIX || '/api/v1';

export async function GET(req: NextRequest) {
  if (!global.wss) {
    const wss = new WebSocketServer({ noServer: true });
    global.wss = wss;
    
    // Store connected clients
    global.clients = new Set();

    wss.on('connection', (ws) => {
      console.log('Client connected to health WebSocket');
      global.clients.add(ws);

      // Send initial health data from backend
      fetchAndSendHealthData(ws);

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

    // Real-time updates every 15 seconds (fetch from backend)
    setInterval(async () => {
      await broadcastHealthUpdates();
    }, 15000);
  }

  return NextResponse.json({ status: 'WebSocket server running' });
}

async function fetchAndSendHealthData(ws?: any) {
  try {
    // Fetch health data from backend
    const healthResponse = await fetch(`${BACKEND_URL}${API_PREFIX}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const alertsResponse = await fetch(`${BACKEND_URL}${API_PREFIX}/health/alerts`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      const healthMessage = {
        type: 'health_update',
        payload: healthData
      };

      if (ws) {
        // Send to specific client
        ws.send(JSON.stringify(healthMessage));
      } else {
        // Broadcast to all clients
        global.clients?.forEach((client) => {
          if (client.readyState === 1) {
            client.send(JSON.stringify(healthMessage));
          }
        });
      }
    }

    if (alertsResponse.ok) {
      const alertsData = await alertsResponse.json();
      if (alertsData && alertsData.length > 0) {
        alertsData.forEach((alert: any) => {
          const alertMessage = {
            type: 'alert',
            payload: alert
          };

          if (ws) {
            ws.send(JSON.stringify(alertMessage));
          } else {
            global.clients?.forEach((client) => {
              if (client.readyState === 1) {
                client.send(JSON.stringify(alertMessage));
              }
            });
          }
        });
      }
    }
  } catch (error) {
    console.error('Failed to fetch health data from backend:', error);
    
    // Send fallback data
    const fallbackData = {
      type: 'health_update',
      payload: {
        overall: 'critical',
        services: [
          { name: 'backend', status: 'down', details: { error: 'Backend unavailable' } }
        ],
        systemMetrics: {
          memory: { heap: 0, rss: 0, total: 0, used: 0 },
          disk: { total: 0, used: 0, free: 0, usagePercentage: 0 },
          cpu: { usage: 0, cores: 1 },
          timestamp: new Date().toISOString()
        },
        lastCheck: new Date().toISOString(),
        healthScore: 0
      }
    };

    if (ws) {
      ws.send(JSON.stringify(fallbackData));
    } else {
      global.clients?.forEach((client) => {
        if (client.readyState === 1) {
          client.send(JSON.stringify(fallbackData));
        }
      });
    }
  }
}

async function broadcastHealthUpdates() {
  if (global.clients && global.clients.size > 0) {
    await fetchAndSendHealthData();
  }
}

// Add to global type definitions
declare global {
  var wss: WebSocketServer | undefined;
  var clients: Set<any>;
}