interface AlertRule {
  service: string;
  metric: string;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  duration?: number; // How long the threshold must be breached
}

export class AlertManager {
  private rules: AlertRule[] = [
    { service: 'memory', metric: 'usagePercentage', threshold: 90, severity: 'critical' },
    { service: 'memory', metric: 'usagePercentage', threshold: 80, severity: 'warning' },
    { service: 'disk', metric: 'usagePercentage', threshold: 85, severity: 'critical' },
    { service: 'database', metric: 'responseTime', threshold: 1000, severity: 'warning' },
  ];

  checkMetrics(metrics: SystemMetrics, services: ServiceStatus[]): Alert[] {
    const alerts: Alert[] = [];

    // Check memory usage
    if (metrics.memory.usagePercentage > 90) {
      alerts.push(this.createAlert('memory', 'critical', metrics.memory.usagePercentage));
    }

    // Check disk usage
    if (metrics.disk.usagePercentage > 85) {
      alerts.push(this.createAlert('disk', 'critical', metrics.disk.usagePercentage));
    }

    // Check service status
    services.forEach(service => {
      if (service.status === 'down') {
        alerts.push(this.createServiceAlert(service.name, 'critical'));
      } else if (service.status === 'degraded') {
        alerts.push(this.createServiceAlert(service.name, 'warning'));
      }
    });

    return alerts;
  }

  private createAlert(service: string, severity: Alert['severity'], value: number): Alert {
    return {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: `${service.toUpperCase()} ${severity.toUpperCase()} Alert`,
      description: `${service} usage is at ${value}% which exceeds threshold`,
      severity,
      service,
      timestamp: new Date().toISOString(),
      acknowledged: false,
    };
  }
}