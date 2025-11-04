'use client';

import { useState } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  Eye,
  EyeOff,
  RefreshCw,
  Activity,
  Users,
  Ban,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/loading-spinner';
import { 
  useSecurityDashboard, 
  useSecurityHealth, 
  useSecurityAlerts,
  useSecuritySessions,
  useResolveSecurityAlert,
  useDismissSecurityAlert,
  useTerminateSecuritySession,
  useDetectAnomalies
} from '@/hooks/use-security';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { SecurityErrorBoundary } from '@/components/security/error-boundary';

function SecurityPageContent() {
  const [showSensitive, setShowSensitive] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState(30);
  
  const { data: dashboard, isLoading: dashboardLoading, refetch: refetchDashboard } = useSecurityDashboard(selectedTimeRange);
  const { data: health, isLoading: healthLoading } = useSecurityHealth();
  const { data: alertsData, isLoading: alertsLoading } = useSecurityAlerts({ 
    active: true, 
    limit: 20 
  });
  const { data: sessionsData, isLoading: sessionsLoading } = useSecuritySessions({ 
    isActive: true, 
    limit: 20 
  });

  const resolveAlert = useResolveSecurityAlert();
  const dismissAlert = useDismissSecurityAlert();
  const terminateSession = useTerminateSecuritySession();
  const detectAnomalies = useDetectAnomalies();

  const handleRefresh = async () => {
    try {
      await Promise.all([
        refetchDashboard(),
        // You can add other refetch calls here if needed
      ]);
      toast.success('Security dashboard refreshed');
    } catch (error) {
      console.error('Refresh error:', error);
      toast.error('Failed to refresh dashboard');
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      await resolveAlert.mutateAsync({ 
        id: alertId, 
        notes: 'Resolved from security dashboard' 
      });
    } catch (error) {
      console.error('Failed to resolve alert:', error);
      // Error is already handled in the hook
    }
  };

  const handleDismissAlert = async (alertId: string) => {
    try {
      await dismissAlert.mutateAsync(alertId);
    } catch (error) {
      console.error('Failed to dismiss alert:', error);
      // Error is already handled in the hook
    }
  };

  const handleTerminateSession = async (sessionId: string) => {
    try {
      await terminateSession.mutateAsync({ 
        sessionId, 
        reason: 'Terminated from security dashboard' 
      });
    } catch (error) {
      console.error('Failed to terminate session:', error);
      // Error is already handled in the hook
    }
  };

  const handleDetectAnomalies = async () => {
    try {
      await detectAnomalies.mutateAsync();
    } catch (error) {
      console.error('Failed to detect anomalies:', error);
      // Error is already handled in the hook
    }
  };

  const SecurityStatCard = ({ title, value, icon: Icon, color, trend }: any) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <div className="flex items-center gap-2 mt-1">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              {trend && (
                <div className="flex items-center text-xs text-gray-500">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {trend}
                </div>
              )}
            </div>
          </div>
          <Icon className="h-8 w-8 text-gray-400" />
        </div>
      </CardContent>
    </Card>
  );

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Show loading state for initial load
  if ((dashboardLoading && !dashboard) || (healthLoading && !health)) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 mt-2" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="space-y-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Security Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor and manage security events and sessions</p>
        </div>
        <div className="flex items-center gap-2">
          <Select 
            value={selectedTimeRange.toString()} 
            onValueChange={(value) => setSelectedTimeRange(Number(value))}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={handleDetectAnomalies}
            disabled={detectAnomalies.isPending}
          >
            {detectAnomalies.isPending ? (
              <LoadingSpinner className="h-4 w-4 mr-2" />
            ) : (
              <AlertCircle className="h-4 w-4 mr-2" />
            )}
            Detect Anomalies
          </Button>
          <Button onClick={handleRefresh} disabled={dashboardLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${dashboardLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Health Status */}
      {health && (
        <Alert className={`${
          health.status === 'critical' ? 'border-red-200 bg-red-50' :
          health.status === 'warning' ? 'border-yellow-200 bg-yellow-50' :
          'border-green-200 bg-green-50'
        }`}>
          <Activity className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>
                Security system status: <strong className="capitalize">{health.status}</strong>
              </span>
              <Badge variant={health.status === 'healthy' ? 'default' : 'destructive'}>
                {health.status}
              </Badge>
            </div>
            {health.recommendations.length > 0 && (
              <ul className="mt-2 text-sm space-y-1">
                {health.recommendations.map((rec, index) => (
                  <li key={index}>• {rec}</li>
                ))}
              </ul>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Security Stats */}
      {dashboard && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SecurityStatCard
            title="Critical Alerts"
            value={dashboard.alertStats.critical}
            icon={AlertTriangle}
            color="text-red-600"
          />
          <SecurityStatCard
            title="High Severity"
            value={dashboard.alertStats.high}
            icon={Shield}
            color="text-orange-600"
          />
          <SecurityStatCard
            title="Active Sessions"
            value={dashboard.sessionStats.active}
            icon={Users}
            color="text-green-600"
          />
          <SecurityStatCard
            title="Suspicious Activity"
            value={dashboard.sessionStats.suspicious}
            icon={Ban}
            color="text-yellow-600"
          />
        </div>
      )}

      {/* Tabs for different views */}
      <Tabs defaultValue="alerts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="alerts">Security Alerts</TabsTrigger>
          <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Security Alerts</CardTitle>
                  <CardDescription>
                    Latest security alerts requiring attention
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSensitive(!showSensitive)}
                >
                  {showSensitive ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                  {showSensitive ? 'Hide' : 'Show'} Sensitive Data
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {alertsLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : alertsData?.alerts.length ? (
                <div className="space-y-4">
                  {alertsData.alerts.map((alert) => (
                    <div
                      key={alert._id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                          <span className="font-medium">{alert.type.replace('_', ' ')}</span>
                          <span className="text-sm text-gray-500">
                            {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-1">{alert.message}</p>
                        {alert.description && (
                          <p className="text-xs text-gray-500">{alert.description}</p>
                        )}
                        {showSensitive && alert.ipAddress && (
                          <p className="text-xs text-gray-500 mt-1">IP: {alert.ipAddress}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResolveAlert(alert._id)}
                          disabled={resolveAlert.isPending}
                        >
                          Resolve
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDismissAlert(alert._id)}
                          disabled={dismissAlert.isPending}
                        >
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 text-green-400 mx-auto mb-4" />
                  <p className="text-gray-500">No active security alerts</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle>Active Security Sessions</CardTitle>
              <CardDescription>
                Currently active user sessions and their security status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sessionsLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : sessionsData?.sessions.length ? (
                <div className="space-y-4">
                  {sessionsData.sessions.map((session) => (
                    <div
                      key={session._id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-medium">User: {session.userId}</span>
                          {session.isSuspicious && (
                            <Badge variant="destructive">Suspicious</Badge>
                          )}
                          {session.isBlocked && (
                            <Badge variant="outline">Blocked</Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          {showSensitive && (
                            <p>IP: {session.ipAddress}</p>
                          )}
                          <p>Last Activity: {formatDistanceToNow(new Date(session.lastActivity), { addSuffix: true })}</p>
                          {session.userAgent && (
                            <p className="truncate">Device: {session.userAgent}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {session.isSuspicious && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleTerminateSession(session.sessionId)}
                            disabled={terminateSession.isPending}
                          >
                            Terminate
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No active sessions</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {dashboard && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Alert Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">{dashboard.alertStats.total}</p>
                          <p className="text-sm text-gray-600">Total Alerts</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">{dashboard.alertStats.resolved}</p>
                          <p className="text-sm text-gray-600">Resolved</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Critical</span>
                          <span className="font-semibold text-red-600">{dashboard.alertStats.critical}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>High</span>
                          <span className="font-semibold text-orange-600">{dashboard.alertStats.high}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Medium</span>
                          <span className="font-semibold text-yellow-600">{dashboard.alertStats.medium}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Low</span>
                          <span className="font-semibold text-blue-600">{dashboard.alertStats.low}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Session Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">{dashboard.sessionStats.active}</p>
                          <p className="text-sm text-gray-600">Active Sessions</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-yellow-600">{dashboard.sessionStats.suspicious}</p>
                          <p className="text-sm text-gray-600">Suspicious</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Total Sessions</span>
                          <span className="font-semibold">{dashboard.sessionStats.total}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Blocked Sessions</span>
                          <span className="font-semibold text-red-600">{dashboard.sessionStats.blocked}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function SecurityPage() {
  return (
    <SecurityErrorBoundary>
      <SecurityPageContent />
    </SecurityErrorBoundary>
  );
}