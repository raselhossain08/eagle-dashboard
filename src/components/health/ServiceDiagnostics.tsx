import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ServiceStatus } from '@/types/health';
import { Settings, Database, HardDrive, Cpu, Server, Clock, Activity } from 'lucide-react';

interface ServiceDiagnosticsProps {
  service: ServiceStatus;
}

export function ServiceDiagnostics({ service }: ServiceDiagnosticsProps) {
  const getServiceIcon = (name: string) => {
    switch (name) {
      case 'database': return <Database className="h-5 w-5 text-blue-500" />;
      case 'redis': return <Cpu className="h-5 w-5 text-red-500" />;
      case 'memory': return <Server className="h-5 w-5 text-green-500" />;
      case 'disk': return <HardDrive className="h-5 w-5 text-purple-500" />;
      default: return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getServiceDetails = (service: ServiceStatus) => {
    const baseDetails = {
      database: {
        connections: 45,
        activeQueries: 12,
        cacheHitRate: 94.5,
        replicationLag: 0,
        version: 'MongoDB 6.0'
      },
      redis: {
        connectedClients: 23,
        memoryUsed: '1.2GB',
        keyspaceHits: 125000,
        keyspaceMisses: 3500,
        hitRate: 97.2,
        version: 'Redis 7.0'
      },
      memory: {
        heapUsed: '2.1GB',
        heapTotal: '4GB',
        external: '450MB',
        arrayBuffers: '120MB'
      },
      disk: {
        readOps: 1250,
        writeOps: 890,
        readThroughput: '45MB/s',
        writeThroughput: '28MB/s',
        queueLength: 1.2
      }
    };

    return baseDetails[service.name as keyof typeof baseDetails] || service.details;
  };

  const details = getServiceDetails(service);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Diagnostics
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getServiceIcon(service.name)}
            {service.name.toUpperCase()} Service Diagnostics
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Status Overview */}
          <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
            <div>
              <h4 className="font-semibold mb-3 text-sm">Status Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge 
                    variant={
                      service.status === 'up' ? 'default' :
                      service.status === 'degraded' ? 'secondary' : 'destructive'
                    }
                    className="capitalize"
                  >
                    {service.status}
                  </Badge>
                </div>
                {service.responseTime && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Response Time:</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {service.responseTime}ms
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Check:</span>
                  <span>{new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3 text-sm">Performance</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Health Score</span>
                  <span>85%</span>
                </div>
                <Progress value={85} className="h-2" />
                <div className="flex justify-between text-sm">
                  <span>Availability</span>
                  <span>99.9%</span>
                </div>
                <Progress value={99.9} className="h-2" />
              </div>
            </div>
          </div>

          {/* Detailed Metrics */}
          <div>
            <h4 className="font-semibold mb-3 text-sm">Detailed Metrics</h4>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(details).map(([key, value]) => (
                <div key={key} className="flex justify-between p-2 border rounded text-sm">
                  <span className="text-muted-foreground capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}:
                  </span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Service-specific diagnostics */}
          {service.name === 'database' && (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Database Queries</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Slow Queries</span>
                  <Badge variant="outline">3</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Active Transactions</span>
                  <Badge variant="outline">7</Badge>
                </div>
              </div>
            </div>
          )}

          {service.name === 'redis' && (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Cache Performance</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Hit Rate</span>
                  <span className="font-medium">97.2%</span>
                </div>
                <Progress value={97.2} className="h-2" />
              </div>
            </div>
          )}

          {/* Raw Details */}
          <div>
            <h4 className="font-semibold mb-2 text-sm">Raw Service Data</h4>
            <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-40">
              {JSON.stringify(service.details, null, 2)}
            </pre>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}