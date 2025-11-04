'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  AlertTriangle, 
  Loader2, 
  RefreshCw,
  Wifi,
  WifiOff,
  Server
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';

interface ApiHealthCheckProps {
  className?: string;
}

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy' | 'checking';
  responseTime: number;
  lastChecked: Date;
  error?: string;
}

export default function ApiHealthCheck({ className }: ApiHealthCheckProps) {
  const [health, setHealth] = useState<HealthStatus>({
    status: 'checking',
    responseTime: 0,
    lastChecked: new Date()
  });
  const [isManualCheck, setIsManualCheck] = useState(false);

  const checkHealth = async (manual = false) => {
    if (manual) setIsManualCheck(true);
    
    setHealth(prev => ({ ...prev, status: 'checking' }));
    
    const startTime = Date.now();
    
    try {
      // Test the notifications templates endpoint
      await apiClient.get('/notifications/templates?limit=1');
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      setHealth({
        status: responseTime < 1000 ? 'healthy' : 'degraded',
        responseTime,
        lastChecked: new Date(),
        error: undefined
      });
    } catch (error: any) {
      setHealth({
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        lastChecked: new Date(),
        error: error.message || 'API connection failed'
      });
    } finally {
      if (manual) setIsManualCheck(false);
    }
  };

  useEffect(() => {
    // Initial check
    checkHealth();
    
    // Periodic health checks every 30 seconds
    const interval = setInterval(() => checkHealth(), 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'degraded': return 'text-yellow-600 bg-yellow-100';
      case 'unhealthy': return 'text-red-600 bg-red-100';
      case 'checking': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-3 w-3" />;
      case 'degraded': return <AlertTriangle className="h-3 w-3" />;
      case 'unhealthy': return <WifiOff className="h-3 w-3" />;
      case 'checking': return <Loader2 className="h-3 w-3 animate-spin" />;
      default: return <Server className="h-3 w-3" />;
    }
  };

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-sm">API Status</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={getStatusColor(health.status)}>
                {getStatusIcon(health.status)}
                {health.status}
              </Badge>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => checkHealth(true)}
                disabled={health.status === 'checking' || isManualCheck}
                className="h-6 w-6 p-0"
              >
                <RefreshCw className={`h-3 w-3 ${isManualCheck ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Response Time Indicator */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Response Time</span>
              <span>{health.responseTime}ms</span>
            </div>
            <Progress 
              value={Math.min((health.responseTime / 2000) * 100, 100)} 
              className="h-1"
            />
          </div>

          {/* Error Message */}
          {health.error && (
            <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
              {health.error}
            </div>
          )}

          {/* Last Checked */}
          <div className="text-xs text-muted-foreground text-center">
            Last checked: {health.lastChecked.toLocaleTimeString()}
          </div>

          {/* Status Details */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-center p-2 bg-muted/50 rounded">
              <div className="font-medium">Templates API</div>
              <div className={`text-xs ${health.status === 'healthy' ? 'text-green-600' : 'text-red-600'}`}>
                {health.status === 'healthy' ? 'Operational' : 'Issues Detected'}
              </div>
            </div>
            <div className="text-center p-2 bg-muted/50 rounded">
              <div className="font-medium">Real-time</div>
              <div className="text-green-600 text-xs">Active</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}