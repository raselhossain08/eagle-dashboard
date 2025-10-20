import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { HealthStatus } from '@/types/health';
import { useRefreshHealth } from '@/hooks/useHealth';
import { useHealthStore } from '@/stores/health-store';

interface HealthOverviewProps {
  overall: HealthStatus;
  healthScore: number;
  lastCheck: string;
}

const StatusIcon = ({ status }: { status: HealthStatus }) => {
  switch (status) {
    case 'healthy':
      return <CheckCircle className="h-6 w-6 text-green-500" />;
    case 'warning':
      return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
    case 'critical':
      return <XCircle className="h-6 w-6 text-red-500" />;
    default:
      return <AlertTriangle className="h-6 w-6 text-gray-500" />;
  }
};

const StatusBadge = ({ status }: { status: HealthStatus }) => {
  const variant = status === 'healthy' ? 'default' : 
                  status === 'warning' ? 'secondary' : 'destructive';
  
  return (
    <Badge variant={variant} className="capitalize">
      {status}
    </Badge>
  );
};

export function HealthOverview({ overall, healthScore, lastCheck }: HealthOverviewProps) {
  const { mutate: refreshHealth, isPending } = useRefreshHealth();
  const alerts = useHealthStore((state) => state.alerts);
  const activeAlerts = alerts.filter(alert => !alert.acknowledged);

  const handleRefresh = () => {
    refreshHealth();
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">System Health</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isPending}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isPending ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <StatusIcon status={overall} />
            <div>
              <p className="text-sm font-medium">Overall Status</p>
              <StatusBadge status={overall} />
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">Health Score</p>
            <p className="text-2xl font-bold">{healthScore}%</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div>
            <p className="text-muted-foreground">Active Alerts</p>
            <p className={`font-medium ${activeAlerts.length > 0 ? 'text-red-500' : 'text-green-500'}`}>
              {activeAlerts.length}
            </p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground">Last Check</p>
            <p className="font-medium">
              {new Date(lastCheck).toLocaleTimeString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}