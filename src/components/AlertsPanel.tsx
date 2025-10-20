import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, XCircle, Info, CheckCircle, BellOff } from 'lucide-react';
import { Alert as AlertType } from '@/types/health';
import { useHealthStore } from '@/stores/health-store';

interface AlertsPanelProps {
  alerts: AlertType[];
}

const SeverityIcon = ({ severity }: { severity: AlertType['severity'] }) => {
  switch (severity) {
    case 'critical':
      return <XCircle className="h-4 w-4 text-red-500" />;
    case 'high':
      return <XCircle className="h-4 w-4 text-orange-500" />;
    case 'medium':
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case 'low':
      return <Info className="h-4 w-4 text-blue-500" />;
    default:
      return <Info className="h-4 w-4 text-gray-500" />;
  }
};

const SeverityBadge = ({ severity }: { severity: AlertType['severity'] }) => {
  const variant = severity === 'critical' ? 'destructive' : 
                  severity === 'high' ? 'default' :
                  severity === 'medium' ? 'secondary' : 'outline';
  
  return (
    <Badge variant={variant} className="capitalize text-xs">
      {severity}
    </Badge>
  );
};

export function AlertsPanel({ alerts }: AlertsPanelProps) {
  const { acknowledgeAlert, clearAlerts } = useHealthStore();
  
  const unacknowledgedAlerts = alerts.filter(alert => !alert.acknowledged);
  const acknowledgedAlerts = alerts.filter(alert => alert.acknowledged);

  const handleAcknowledge = (alertId: string) => {
    acknowledgeAlert(alertId);
  };

  const handleClearAll = () => {
    clearAlerts();
  };

  if (alerts.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5 text-green-500" />
            Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500 opacity-50" />
            <p>No active alerts</p>
            <p className="text-sm">All systems are operating normally</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Alerts
          {unacknowledgedAlerts.length > 0 && (
            <Badge variant="destructive" className="rounded-full px-2">
              {unacknowledgedAlerts.length}
            </Badge>
          )}
        </CardTitle>
        {alerts.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleClearAll}>
            Clear All
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4 max-h-96 overflow-y-auto">
        {/* Unacknowledged Alerts */}
        {unacknowledgedAlerts.map((alert) => (
          <div key={alert.id} className="p-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <SeverityIcon severity={alert.severity} />
                <span className="font-medium text-sm">{alert.title}</span>
              </div>
              <SeverityBadge severity={alert.severity} />
            </div>
            <p className="text-sm text-muted-foreground mb-3">{alert.description}</p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {alert.service} • {new Date(alert.timestamp).toLocaleString()}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAcknowledge(alert.id)}
              >
                Acknowledge
              </Button>
            </div>
          </div>
        ))}

        {/* Acknowledged Alerts */}
        {acknowledgedAlerts.map((alert) => (
          <div key={alert.id} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/20 opacity-70">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <SeverityIcon severity={alert.severity} />
                <span className="font-medium text-sm line-through">{alert.title}</span>
              </div>
              <Badge variant="outline" className="text-xs">
                Acknowledged
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{alert.description}</p>
            <div className="text-xs text-muted-foreground">
              {alert.service} • {new Date(alert.timestamp).toLocaleString()}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}