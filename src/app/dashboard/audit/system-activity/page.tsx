'use client';

import { AuditDashboardShell } from '@/components/audit/audit-dashboard-shell';
import { SystemHealthDashboard } from '@/components/audit/system-health-dashboard';
import { ActivityTrendsChart } from '@/components/audit/activity-trends-chart';
import { SessionTracking } from '@/components/audit/session-tracking';
import { ComplianceStandards } from '@/components/audit/compliance-standards';
import { useSystemActivity, useActivityTrends, useSystemHealthMetrics } from '@/hooks/use-audit';
import { useAuditStore } from '@/store/audit-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock data
const mockSessions = [
  {
    id: '1',
    adminEmail: 'admin@company.com',
    adminRole: 'Super Admin',
    startTime: new Date('2024-01-15T08:00:00Z'),
    lastActivity: new Date('2024-01-15T14:30:00Z'),
    ipAddress: '192.168.1.100',
    location: 'New York, USA',
    userAgent: 'Chrome/120.0 Windows 11',
    status: 'active',
    actionsCount: 45,
    riskScore: 15,
    deviceInfo: {
      browser: 'Chrome 120.0',
      os: 'Windows 11',
      device: 'Desktop'
    }
  },
  {
    id: '2',
    adminEmail: 'manager@company.com',
    adminRole: 'Manager',
    startTime: new Date('2024-01-15T09:15:00Z'),
    lastActivity: new Date('2024-01-15T11:45:00Z'),
    ipAddress: '192.168.1.101',
    location: 'London, UK',
    userAgent: 'Firefox/119.0 macOS',
    status: 'expired',
    actionsCount: 23,
    riskScore: 28,
    deviceInfo: {
      browser: 'Firefox 119.0',
      os: 'macOS',
      device: 'Laptop'
    }
  }
];

const mockComplianceData = {
  sox: {
    overallScore: 92,
    requirements: [
      {
        id: 'sox-1',
        name: 'Access Control',
        description: 'Proper user access controls and authentication',
        status: 'compliant',
        evidence: ['Multi-factor authentication enabled', 'Role-based access control implemented'],
        lastAudit: new Date('2024-01-10')
      },
      {
        id: 'sox-2',
        name: 'Audit Trail',
        description: 'Complete and immutable audit trail',
        status: 'compliant',
        evidence: ['All actions logged', 'Log integrity verified'],
        lastAudit: new Date('2024-01-10')
      }
    ],
    recommendations: ['Continue regular access reviews', 'Enhance log retention policies'],
    lastAssessment: new Date('2024-01-15')
  },
  gdpr: {
    overallScore: 88,
    requirements: [
      {
        id: 'gdpr-1',
        name: 'Data Protection',
        description: 'Personal data protection and privacy',
        status: 'compliant',
        evidence: ['Data encryption enabled', 'Privacy policy implemented'],
        lastAudit: new Date('2024-01-12')
      },
      {
        id: 'gdpr-2',
        name: 'Right to Erasure',
        description: 'Proper data deletion procedures',
        status: 'partial',
        evidence: ['Deletion process documented', 'Some manual steps required'],
        lastAudit: new Date('2024-01-12')
      }
    ],
    recommendations: ['Automate data deletion process', 'Enhance consent management'],
    lastAssessment: new Date('2024-01-12')
  },
  hipaa: {
    overallScore: 85,
    requirements: [
      {
        id: 'hipaa-1',
        name: 'Medical Data Security',
        description: 'Protection of medical information',
        status: 'compliant',
        evidence: ['Data encryption', 'Access logging'],
        lastAudit: new Date('2024-01-08')
      },
      {
        id: 'hipaa-2',
        name: 'Access Controls',
        description: 'Strict access controls for medical data',
        status: 'non-compliant',
        evidence: ['Basic controls implemented', 'Advanced controls needed'],
        lastAudit: new Date('2024-01-08')
      }
    ],
    recommendations: ['Implement advanced access controls', 'Enhance data classification'],
    lastAssessment: new Date('2024-01-08')
  }
};

export default function SystemActivityPage() {
  const { dateRange } = useAuditStore();
  const { data: systemActivity, isLoading: systemLoading } = useSystemActivity(7);
  const { data: healthMetrics, isLoading: healthLoading } = useSystemHealthMetrics(dateRange);
  const { data: trendsData, isLoading: trendsLoading } = useActivityTrends({
    groupBy: 'hour',
    dateRange: { from: new Date(Date.now() - 24 * 60 * 60 * 1000), to: new Date() }
  });

  return (
    <AuditDashboardShell
      title="System Activity"
      description="Monitor system-wide activity, performance, and health metrics"
    >
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* System Health Dashboard */}
          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>
                Real-time system performance and health metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {healthLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full" />
                  ))}
                </div>
              ) : (
                <SystemHealthDashboard data={healthMetrics!} />
              )}
            </CardContent>
          </Card>

          {/* Recent Activity Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity (24h)</CardTitle>
              <CardDescription>
                System activity patterns and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              {trendsLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <ActivityTrendsChart 
                  data={trendsData || []}
                  groupBy="hour"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle>Session Monitoring</CardTitle>
              <CardDescription>
                Active administrator sessions and security status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SessionTracking sessions={mockSessions} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Standards</CardTitle>
              <CardDescription>
                Audit compliance with industry standards and regulations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ComplianceStandards data={mockComplianceData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>
                System performance metrics and analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                Performance analytics dashboard coming soon...
                <div className="mt-4 text-sm">
                  Features include: Response time analysis, Error rate tracking, Capacity planning
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AuditDashboardShell>
  );
}