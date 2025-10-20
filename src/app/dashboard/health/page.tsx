'use client';

import { useSystemHealth, useHealthHistory } from '@/hooks/useHealth';
import { useHealthStore } from '@/stores/health-store';
import { useHealthWebSocket } from '@/hooks/useHealthWebSocket';
import { HealthOverview } from '@/components/HealthOverview';
import { ServiceStatus } from '@/components/ServiceStatus';
import { SystemMetrics } from '@/components/SystemMetrics';
import { SystemMetricsCharts } from '@/components/health/SystemMetricsCharts';
import { AlertsPanel } from '@/components/AlertsPanel';
import { HealthHistory } from '@/components/health/HealthHistory';
import { ExportHealthReport } from '@/components/health/ExportHealthReport';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, RefreshCw, BarChart3, History } from 'lucide-react';
import { useEffect } from 'react';

export default function HealthDashboard() {
  const { data: healthData, error, isLoading, isError } = useSystemHealth();
  const { data: historyData } = useHealthHistory();
  const { setHealth, alerts } = useHealthStore();

  // Initialize WebSocket connection
  useHealthWebSocket();

  // Update store when data changes
  useEffect(() => {
    if (healthData) {
      setHealth(healthData);
    }
  }, [healthData, setHealth]);

  if (isLoading) {
    return <HealthDashboardLoading />;
  }

  if (isError || !healthData) {
    return <HealthDashboardError error={error} />;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Health Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time monitoring of system health and performance
          </p>
        </div>
        <ExportHealthReport healthData={healthData} historyData={historyData} />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <HealthOverview
            overall={healthData.overall}
            healthScore={healthData.healthScore}
            lastCheck={healthData.lastCheck}
          />
          
          <Tabs defaultValue="current" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="current" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Current Metrics
              </TabsTrigger>
              <TabsTrigger value="charts" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Trends & Charts
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="current">
              <SystemMetrics metrics={healthData.systemMetrics} />
            </TabsContent>
            
            <TabsContent value="charts">
              <SystemMetricsCharts metrics={healthData.systemMetrics} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <ServiceStatus services={healthData.services} />
          <AlertsPanel alerts={alerts} />
          <HealthHistory />
        </div>
      </div>
    </div>
  );
}

// Loading component
function HealthDashboardLoading() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading health data...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Error component
function HealthDashboardError({ error }: { error: any }) {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to load health data</h3>
            <p className="text-muted-foreground">
              {error instanceof Error ? error.message : 'Unknown error occurred'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}