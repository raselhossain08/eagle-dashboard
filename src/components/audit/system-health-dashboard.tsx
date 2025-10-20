import { SystemHealthData } from '@/types/audit';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Cpu, 
  AlertTriangle, 
  Gauge, 
  Users, 
  Shield, 
  Activity,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SystemHealthDashboardProps {
  data: SystemHealthData;
}

export function SystemHealthDashboard({ data }: SystemHealthDashboardProps) {
  const metrics = [
    {
      title: "System Load",
      value: data.systemLoad,
      unit: "%",
      icon: Cpu,
      color: data.systemLoad < 70 ? "text-green-600" : data.systemLoad < 90 ? "text-yellow-600" : "text-red-600",
      status: data.systemLoad < 70 ? "normal" : data.systemLoad < 90 ? "warning" : "critical"
    },
    {
      title: "Error Rate",
      value: data.errorRate,
      unit: "%",
      icon: AlertTriangle,
      color: data.errorRate < 1 ? "text-green-600" : data.errorRate < 5 ? "text-yellow-600" : "text-red-600",
      status: data.errorRate < 1 ? "normal" : data.errorRate < 5 ? "warning" : "critical"
    },
    {
      title: "Response Time",
      value: data.averageResponseTime,
      unit: "ms",
      icon: Gauge,
      color: data.averageResponseTime < 100 ? "text-green-600" : data.averageResponseTime < 500 ? "text-yellow-600" : "text-red-600",
      status: data.averageResponseTime < 100 ? "normal" : data.averageResponseTime < 500 ? "warning" : "critical"
    },
    {
      title: "Active Admins",
      value: data.activeAdmins,
      unit: "",
      icon: Users,
      color: "text-blue-600",
      status: "normal"
    },
    {
      title: "Critical Actions",
      value: data.criticalActions,
      unit: "",
      icon: Shield,
      color: data.criticalActions === 0 ? "text-green-600" : "text-red-600",
      status: data.criticalActions === 0 ? "normal" : "critical"
    },
    {
      title: "Security Alerts",
      value: data.securityAlerts,
      unit: "",
      icon: Activity,
      color: data.securityAlerts === 0 ? "text-green-600" : "text-red-600",
      status: data.securityAlerts === 0 ? "normal" : "critical"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "normal":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Normal</Badge>;
      case "warning":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Warning</Badge>;
      case "critical":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Critical</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        
        return (
          <Card key={index} className={cn(
            "relative overflow-hidden",
            metric.status === "critical" && "border-red-200 bg-red-50",
            metric.status === "warning" && "border-yellow-200 bg-yellow-50"
          )}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <Icon className={cn("h-4 w-4", metric.color)} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metric.value}
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  {metric.unit}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                {getStatusBadge(metric.status)}
                
                {/* Progress bar for percentage-based metrics */}
                {(metric.title === "System Load" || metric.title === "Error Rate") && (
                  <Progress 
                    value={metric.value} 
                    className={cn(
                      "w-16 h-2",
                      metric.status === "normal" ? "bg-green-200" :
                      metric.status === "warning" ? "bg-yellow-200" : "bg-red-200"
                    )}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}