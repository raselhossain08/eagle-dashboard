import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';
import { ServiceStatus as ServiceStatusType } from '@/types/health';
import { ServiceDiagnostics } from './ServiceDiagnostics';

// ... existing imports and StatusIcon, StatusBadge components ...

export function ServiceStatus({ services }: ServiceStatusProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-blue-500" />
          Service Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {services.map((service, index) => (
          <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center space-x-3">
              <StatusIcon status={service.status} />
              <div>
                <p className="font-medium text-sm capitalize">
                  {service.name.replace(/([A-Z])/g, ' $1').trim()}
                </p>
                {service.responseTime && (
                  <p className="text-xs text-muted-foreground">
                    {service.responseTime}ms
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={service.status} />
              <ServiceDiagnostics service={service} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}