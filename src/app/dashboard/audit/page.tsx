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
import { useActivityOverview, useActivityTrends, useRiskAssessment } from '@/hooks/use-audit';
import { useAuditStore } from '@/store/audit-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock data for new components
const mockPredictiveData = [
  { date: '2024-01', actual: 1200, predicted: 1250, confidence: 85 },
  { date: '2024-02', actual: 1350, predicted: 1300, confidence: 78 },
  { date: '2024-03', actual: 1400, predicted: 1450, confidence: 92 },
  { date: '2024-04', actual: 1550, predicted: 1500, confidence: 88 },
  { date: '2024-05', actual: 1600, predicted: 1650, confidence: 91 },
];

const mockCorrelationData = [
  { action1: 'user.create', action2: 'role.assign', correlation: 0.85, frequency: 245, significance: 'high' },
  { action1: 'subscription.update', action2: 'payment.process', correlation: 0.72, frequency: 189, significance: 'high' },
  { action1: 'permission.grant', action2: 'access.review', correlation: 0.68, frequency: 156, significance: 'medium' },
  { action1: 'user.delete', action2: 'data.cleanup', correlation: 0.45, frequency: 89, significance: 'low' },
];

const mockBehavioralData = [
  {
    adminId: '1',
    adminEmail: 'admin@company.com',
    behaviorPattern: {
      activityFrequency: 85,
      riskScore: 25,
      successRate: 98,
      responseTime: 120,
      anomalyScore: 15,
    },
    patterns: ['security-focused', 'consistent-timing'],
    recommendations: ['Continue current monitoring', 'Consider advanced training']
  },
  {
    adminId: '2',
    adminEmail: 'manager@company.com',
    behaviorPattern: {
      activityFrequency: 65,
      riskScore: 45,
      successRate: 92,
      responseTime: 180,
      anomalyScore: 35,
    },
    patterns: ['moderate-frequency', 'variable-timing'],
    recommendations: ['Review access patterns', 'Monitor for unusual activity']
  }
];

const mockAnomalies = [
  {
    id: '1',
    type: 'suspicious_login',
    severity: 'high',
    title: 'Unusual login location detected',
    description: 'Admin login from unexpected geographic location',
    timestamp: new Date('2024-01-15T14:30:00Z'),
    adminEmail: 'admin@company.com',
    ipAddress: '192.168.1.100',
    location: 'Tokyo, Japan',
    confidence: 87,
    recommendations: [
      'Verify login attempt',
      'Check for compromised credentials',
      'Enable 2FA if not already enabled'
    ]
  },
  {
    id: '2',
    type: 'unusual_activity',
    severity: 'medium',
    title: 'Unusual activity pattern',
    description: 'High frequency of permission changes outside normal hours',
    timestamp: new Date('2024-01-15T03:00:00Z'),
    adminEmail: 'manager@company.com',
    confidence: 72,
    recommendations: [
      'Review permission changes',
      'Verify business justification',
      'Monitor for similar patterns'
    ]
  }
];

export default function AuditOverviewPage() {
  const { dateRange } = useAuditStore();
  
  const { data: overviewData, isLoading: overviewLoading } = useActivityOverview(dateRange);
  const { data: trendsData, isLoading: trendsLoading } = useActivityTrends({
    groupBy: 'day',
    dateRange
  });
  const { data: riskData, isLoading: riskLoading } = useRiskAssessment(dateRange);

  return (
    <AuditDashboardShell
      title="Audit Overview"
      description="Monitor system activity, security events, and compliance metrics"
    >
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
            ) : (
              <ActivityOverviewCards 
                data={overviewData!} 
                dateRange={dateRange}
              />
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
                ) : (
                  <ActivityTrendsChart 
                    data={trendsData || []}
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
                ) : (
                  <TopActionsChart 
                    data={overviewData?.topActions || []}
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
                ) : (
                  <RiskAssessmentPanel data={riskData!} />
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
              <PredictiveInsights data={mockPredictiveData} />
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
              <CorrelationAnalysis data={mockCorrelationData} />
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
              <BehavioralAnalysis data={mockBehavioralData} />
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
              <AnomalyDetection anomalies={mockAnomalies} />
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
              <div className="text-center py-12 text-muted-foreground">
                Session monitoring integration in progress...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AuditDashboardShell>
  );
}