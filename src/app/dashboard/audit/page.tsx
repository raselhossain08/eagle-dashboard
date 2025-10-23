'use client';

import { AuditDashboardShell } from '@/components/audit/audit-dashboard-shell';
import { ActivityOverviewCards } from '@/components/audit/activity-overview-cards';
import { ActivityTrendsChart } from '@/components/audit/activity-trends-chart';
import { TopActionsChart } from '@/components/audit/top-actions-chart';
import { RiskAssessmentPanel } from '@/components/audit/risk-assessment-panel';
import { PredictiveInsights } from '@/components/audit/predictive-insights';
import { CorrelationAnalysis } from '@/components/audit/correlation-analysis';
import { BehavioralAnalysis } from '@/components/audit/behavioral-analysis';
import { AnomalyDetection } from '@/components/audit/anomaly-detection';
import { 
  useActivityOverview, 
  useActivityTrends, 
  useRiskAssessment,
  usePredictiveInsights,
  useCorrelationAnalysis,
  useBehavioralAnalysis,
  useAnomalies,
  useSessions
} from '@/hooks/use-audit';
import { useAuditStore } from '@/store/audit-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { AnomalyData, AnomalyResponse, SessionData } from '@/types/audit';
import { useCallback } from 'react';

// Transform function to convert backend anomaly data to component format
const transformAnomalyData = (data: AnomalyResponse | null): AnomalyData[] => {
  if (!data) return [];
  
  const anomalies: AnomalyData[] = [];
  
  // Transform failure spikes
  data.failureSpikes?.forEach((spike, index) => {
    anomalies.push({
      id: `failure-${index}`,
      type: 'failed_attempts',
      severity: spike.failureCount > 10 ? 'high' : 'medium',
      title: 'Multiple Failed Attempts Detected',
      description: `${spike.failureCount} failed attempts detected for admin ${spike._id.adminId}`,
      timestamp: new Date(spike._id.date),
      adminEmail: spike._id.adminId,
      confidence: Math.min(spike.failureCount * 10, 100),
      recommendations: [
        'Review admin account security',
        'Check for potential password attacks',
        'Consider implementing account lockout policies'
      ]
    });
  });
  
  // Transform unusual activity
  data.unusualActivity?.forEach((activity, index) => {
    anomalies.push({
      id: `unusual-${index}`,
      type: 'time_anomaly',
      severity: activity.count > 100 ? 'high' : 'medium',
      title: 'Unusual Activity Pattern',
      description: `${activity.count} actions performed at hour ${activity._id.hour} by admin ${activity._id.adminId}`,
      timestamp: new Date(),
      adminEmail: activity._id.adminId,
      confidence: Math.min(activity.count, 100),
      recommendations: [
        'Verify business justification for unusual timing',
        'Monitor for similar patterns',
        'Review admin work schedules'
      ]
    });
  });
  
  // Transform suspicious patterns
  data.suspiciousPatterns?.forEach((pattern, index) => {
    anomalies.push({
      id: `suspicious-${index}`,
      type: 'geographic_anomaly',
      severity: pattern.distinctIPs.length > 5 ? 'critical' : 'high',
      title: 'Geographic Anomaly Detected',
      description: `Admin ${pattern._id} accessing from ${pattern.distinctIPs.length} different IP addresses`,
      timestamp: new Date(),
      adminEmail: pattern._id,
      confidence: Math.min(pattern.distinctIPs.length * 15, 100),
      recommendations: [
        'Verify all login locations',
        'Check for compromised credentials',
        'Enable geographic restrictions if possible'
      ]
    });
  });
  
  return anomalies.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export default function AuditOverviewPage() {
  const { dateRange } = useAuditStore();
  
  // Disable automatic fetch - only manual refresh
  const { data: overviewData, isLoading: overviewLoading, error: overviewError, refetch: refetchOverview } = useActivityOverview(dateRange, { 
    enabled: false,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    staleTime: 1,
  });
  const { data: trendsData, isLoading: trendsLoading, error: trendsError, refetch: refetchTrends } = useActivityTrends({
    groupBy: 'day',
    dateRange
  }, { 
    enabled: false,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    staleTime: 1,
  });
  const { data: riskData, isLoading: riskLoading, error: riskError, refetch: refetchRisk } = useRiskAssessment(dateRange, { 
    enabled: false,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    staleTime: 1,
  });
  
  // Advanced Analytics
  const { data: predictiveData, isLoading: predictiveLoading, error: predictiveError, refetch: refetchPredictive } = usePredictiveInsights(dateRange, { 
    enabled: false,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    staleTime: 1,
  });
  const { data: correlationData, isLoading: correlationLoading, error: correlationError, refetch: refetchCorrelation } = useCorrelationAnalysis(dateRange, { 
    enabled: false,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    staleTime: 1,
  });
  const { data: behavioralData, isLoading: behavioralLoading, error: behavioralError, refetch: refetchBehavioral } = useBehavioralAnalysis(dateRange, { 
    enabled: false,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    staleTime: 1,
  });
  
  // Security
  const { data: anomaliesData, isLoading: anomaliesLoading, error: anomaliesError, refetch: refetchAnomalies } = useAnomalies(dateRange, { 
    enabled: false,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    staleTime: 1,
  });
  const { data: sessionsData, isLoading: sessionsLoading, error: sessionsError, refetch: refetchSessions } = useSessions(true, { 
    enabled: false,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    staleTime: 1,
  });

  // Manual refresh function
  const handleRefresh = useCallback(async () => {
    await Promise.all([
      refetchOverview(),
      refetchTrends(),
      refetchRisk(),
      refetchPredictive(),
      refetchCorrelation(),
      refetchBehavioral(),
      refetchAnomalies(),
      refetchSessions(),
    ]);
  }, [refetchOverview, refetchTrends, refetchRisk, refetchPredictive, refetchCorrelation, refetchBehavioral, refetchAnomalies, refetchSessions]);

  // Check if any data is loading
  const isAnyLoading = overviewLoading || trendsLoading || riskLoading || predictiveLoading || correlationLoading || behavioralLoading || anomaliesLoading || sessionsLoading;

  // Check if any data exists
  const hasAnyData = overviewData || trendsData || riskData || predictiveData || correlationData || behavioralData || anomaliesData || sessionsData;

  const renderError = (error: any, title: string) => (
    <Alert>
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        Failed to load {title}: {error?.message || 'Unknown error'}
      </AlertDescription>
    </Alert>
  );

  return (
    <AuditDashboardShell
      title="Audit Overview"
      description="Monitor system activity, security events, and compliance metrics"
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex-1" />
        <Button 
          onClick={handleRefresh}
          disabled={isAnyLoading}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RotateCcw className={`h-4 w-4 ${isAnyLoading ? 'animate-spin' : ''}`} />
          {isAnyLoading ? 'Loading...' : hasAnyData ? 'Refresh Data' : 'Load Data'}
        </Button>
      </div>

      {/* Show message when no data is loaded yet */}
      {!hasAnyData && !isAnyLoading && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="text-lg font-medium text-muted-foreground mb-2">
                No data loaded yet
              </div>
              <div className="text-sm text-muted-foreground mb-4">
                Click the "Load Data" button to fetch the latest audit information
              </div>
              <Button 
                onClick={handleRefresh}
                variant="default"
                size="sm"
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Load Data
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Advanced Analytics</TabsTrigger>
          <TabsTrigger value="security">Security Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Activity Overview Cards */}
          <section>
            {overviewLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <Skeleton className="h-4 w-[100px]" />
                      <Skeleton className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-8 w-[120px] mt-1" />
                      <Skeleton className="h-3 w-[160px] mt-2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : overviewError ? (
              renderError(overviewError, 'activity overview')
            ) : overviewData && typeof overviewData === 'object' && 'totalLogs' in overviewData ? (
              <ActivityOverviewCards 
                data={overviewData as any} 
                dateRange={dateRange}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No overview data available
              </div>
            )}
          </section>

          {/* Charts Section */}
          <section className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Activity Trends</CardTitle>
                <CardDescription>
                  System activity over time with success/failure rates
                </CardDescription>
              </CardHeader>
              <CardContent>
                {trendsLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : trendsError ? (
                  renderError(trendsError, 'activity trends')
                ) : (
                  <ActivityTrendsChart 
                    data={Array.isArray(trendsData) ? trendsData : []}
                    groupBy="day"
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Actions</CardTitle>
                <CardDescription>
                  Most frequent actions and their success rates
                </CardDescription>
              </CardHeader>
              <CardContent>
                {overviewLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : overviewError ? (
                  renderError(overviewError, 'top actions')
                ) : (
                  <TopActionsChart 
                    data={overviewData && typeof overviewData === 'object' && 'topActions' in overviewData ? (overviewData as any).topActions : []}
                  />
                )}
              </CardContent>
            </Card>
          </section>

          {/* Risk Assessment */}
          <section>
            <Card>
              <CardHeader>
                <CardTitle>Risk Assessment</CardTitle>
                <CardDescription>
                  Security risk indicators and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {riskLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ) : riskError ? (
                  renderError(riskError, 'risk assessment')
                ) : riskData && typeof riskData === 'object' && 'overallRiskScore' in riskData ? (
                  <RiskAssessmentPanel data={riskData as any} />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No risk assessment data available
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Predictive Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Predictive Insights</CardTitle>
              <CardDescription>
                Activity forecasting and trend predictions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {predictiveLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : predictiveError ? (
                renderError(predictiveError, 'predictive insights')
              ) : (
                <PredictiveInsights data={Array.isArray(predictiveData) ? predictiveData : []} />
              )}
            </CardContent>
          </Card>

          {/* Correlation Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Correlation Analysis</CardTitle>
              <CardDescription>
                Relationships between different audit actions and patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              {correlationLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : correlationError ? (
                renderError(correlationError, 'correlation analysis')
              ) : (
                <CorrelationAnalysis data={Array.isArray(correlationData) ? correlationData : []} />
              )}
            </CardContent>
          </Card>

          {/* Behavioral Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Behavioral Analysis</CardTitle>
              <CardDescription>
                Administrator behavior patterns and anomaly detection
              </CardDescription>
            </CardHeader>
            <CardContent>
              {behavioralLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : behavioralError ? (
                renderError(behavioralError, 'behavioral analysis')
              ) : (
                <BehavioralAnalysis data={Array.isArray(behavioralData) ? behavioralData : []} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          {/* Anomaly Detection */}
          <Card>
            <CardHeader>
              <CardTitle>Anomaly Detection</CardTitle>
              <CardDescription>
                Suspicious activity patterns and security alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {anomaliesLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : anomaliesError ? (
                renderError(anomaliesError, 'anomaly detection')
              ) : (
                <AnomalyDetection 
                  anomalies={transformAnomalyData(
                    anomaliesData && typeof anomaliesData === 'object' && 'failureSpikes' in anomaliesData 
                      ? anomaliesData as AnomalyResponse 
                      : null
                  )} 
                />
              )}
            </CardContent>
          </Card>

          {/* Session Tracking */}
          <Card>
            <CardHeader>
              <CardTitle>Session Monitoring</CardTitle>
              <CardDescription>
                Active administrator sessions and security status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sessionsLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : sessionsError ? (
                renderError(sessionsError, 'session monitoring')
              ) : (
                <div className="space-y-4">
                  {sessionsData && Array.isArray(sessionsData) && sessionsData.length > 0 ? (
                    <div className="grid gap-4">
                      {sessionsData.map((session: SessionData) => (
                        <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">{session.adminEmail}</p>
                            <p className="text-sm text-muted-foreground">
                              {session.location} • {session.ipAddress}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              User Agent: {session.userAgent}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm">
                              Active since {new Date(session.startTime).toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Last activity: {new Date(session.lastActivity).toLocaleString()}
                            </p>
                            <div className="flex items-center gap-2">
                              <div 
                                className={`w-2 h-2 rounded-full ${session.isActive ? 'bg-green-500' : 'bg-gray-400'}`}
                              />
                              <p className={`text-xs ${
                                session.riskScore > 70 ? 'text-red-600' : 
                                session.riskScore > 40 ? 'text-yellow-600' : 'text-green-600'
                              }`}>
                                Risk: {session.riskScore}%
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      No active sessions found
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AuditDashboardShell>
  );
}