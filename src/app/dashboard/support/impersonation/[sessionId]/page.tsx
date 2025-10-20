'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Calendar, Clock, Shield, AlertTriangle, Download } from 'lucide-react';
import Link from 'next/link';

// Mock session data
const mockSession = {
  id: '1',
  adminUser: {
    id: 'admin1',
    name: 'Sarah Johnson',
    email: 'sarah@company.com',
    role: 'Support Manager'
  },
  targetUser: {
    id: 'user1', 
    name: 'John Doe',
    email: 'john@example.com',
    company: 'Acme Inc'
  },
  startedAt: '2024-01-15T10:30:00Z',
  endedAt: '2024-01-15T11:15:00Z',
  reason: 'Troubleshooting account login issues reported by customer',
  status: 'ended' as const,
  actions: [
    { time: '2024-01-15T10:32:00Z', action: 'Viewed user profile' },
    { time: '2024-01-15T10:35:00Z', action: 'Checked login history' },
    { time: '2024-01-15T10:40:00Z', action: 'Reset password' },
    { time: '2024-01-15T10:45:00Z', action: 'Verified email settings' },
    { time: '2024-01-15T11:00:00Z', action: 'Tested login functionality' }
  ]
};

export default function SessionDetailPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;

  const getDuration = (start: string, end: string) => {
    const startTime = new Date(start);
    const endTime = new Date(end);
    const diff = endTime.getTime() - startTime.getTime();
    const minutes = Math.floor(diff / 60000);
    return `${minutes} minutes`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/support/impersonation">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Impersonation
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Session Details</h1>
            <p className="text-muted-foreground">
              Detailed view of impersonation session #{sessionId.slice(-8)}
            </p>
          </div>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Log
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Session Information</CardTitle>
              <CardDescription>
                Complete details of the impersonation session
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="font-semibold mb-2">Admin User</h3>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="font-medium">{mockSession.adminUser.name}</div>
                      <div className="text-sm text-muted-foreground">{mockSession.adminUser.email}</div>
                      <Badge variant="outline" className="mt-1">{mockSession.adminUser.role}</Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Target User</h3>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <div className="font-medium">{mockSession.targetUser.name}</div>
                      <div className="text-sm text-muted-foreground">{mockSession.targetUser.email}</div>
                      <div className="text-sm text-muted-foreground">{mockSession.targetUser.company}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Reason for Impersonation</h3>
                <p className="text-muted-foreground p-3 border rounded-lg bg-muted/50">
                  {mockSession.reason}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="font-semibold mb-2">Session Duration</h3>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <span>{getDuration(mockSession.startedAt, mockSession.endedAt!)}</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Session Status</h3>
                  <div className="p-3 border rounded-lg">
                    <Badge variant={mockSession.status === 'ended' ? 'secondary' : 'default'}>
                      {mockSession.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
              <CardDescription>
                All actions performed during the impersonation session
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockSession.actions.map((action, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-medium">{action.action}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(action.time).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Security Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">IP Address</span>
                <Badge variant="outline">192.168.1.100</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Location</span>
                <Badge variant="outline">New York, US</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">User Agent</span>
                <Badge variant="outline">Chrome/120.0</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Security Level</span>
                <Badge variant="default">Standard</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 dark:border-yellow-800">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-yellow-600 dark:text-yellow-400">
                <AlertTriangle className="w-5 h-5" />
                <span>Security Notice</span>
              </CardTitle>
              <CardDescription className="text-yellow-700 dark:text-yellow-300">
                This session has been logged for security auditing purposes. 
                All activities are monitored and recorded.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                View Full Audit Log
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Generate Security Report
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Contact Admin User
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}