'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Calendar, Clock, Shield, AlertTriangle, Download, Square } from 'lucide-react';
import { useImpersonationSessionDetail, useEndImpersonation, useForceEndImpersonation } from '@/hooks/useSupport';
import Link from 'next/link';
import { toast } from 'sonner';

export default function SessionDetailPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  
  const { data: session, isLoading, error } = useImpersonationSessionDetail(sessionId);
  const endImpersonation = useEndImpersonation();
  const forceEndImpersonation = useForceEndImpersonation();

  const handleEndSession = async () => {
    if (!session) return;
    try {
      await endImpersonation.mutateAsync({ 
        logId: session.id, 
        reason: 'Manual termination from session detail page' 
      });
      toast.success('Impersonation session ended successfully');
    } catch (error) {
      console.error('Failed to end session:', error);
      toast.error('Failed to end impersonation session');
    }
  };

  const handleForceEndSession = async () => {
    if (!session) return;
    try {
      await forceEndImpersonation.mutateAsync({ 
        logId: session.id, 
        reason: 'Forced termination from session detail page' 
      });
      toast.success('Impersonation session force-ended successfully');
    } catch (error) {
      console.error('Failed to force end session:', error);
      toast.error('Failed to force end impersonation session');
    }
  };

  const getDuration = (start: string, end: string) => {
    const startTime = new Date(start);
    const endTime = new Date(end);
    const diff = endTime.getTime() - startTime.getTime();
    const minutes = Math.floor(diff / 60000);
    return `${minutes} minutes`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/support/impersonation">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Impersonation
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Session Details</h1>
            <p className="text-muted-foreground">Loading session details...</p>
          </div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-muted rounded w-1/4 animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/support/impersonation">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Impersonation
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Session Details</h1>
            <p className="text-muted-foreground">Session not found</p>
          </div>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">Session Not Found</h3>
            <p className="text-muted-foreground">
              The requested impersonation session could not be found.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
        <div className="flex items-center space-x-2">
          {session.status === 'active' && (
            <>
              <Button 
                variant="outline" 
                onClick={handleEndSession}
                disabled={endImpersonation.isPending}
              >
                <Square className="w-4 h-4 mr-2" />
                End Session
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleForceEndSession}
                disabled={forceEndImpersonation.isPending}
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Force End
              </Button>
            </>
          )}
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Log
          </Button>
        </div>
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
                      <div className="font-medium">{session.adminUser.name}</div>
                      <div className="text-sm text-muted-foreground">{session.adminUser.email}</div>
                      <Badge variant="outline" className="mt-1">{session.adminUser.role}</Badge>
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
                      <div className="font-medium">{session.targetUser.name}</div>
                      <div className="text-sm text-muted-foreground">{session.targetUser.email}</div>
                      {session.targetUser.company && (
                        <div className="text-sm text-muted-foreground">{session.targetUser.company}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Reason for Impersonation</h3>
                <p className="text-muted-foreground p-3 border rounded-lg bg-muted/50">
                  {session.reason}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="font-semibold mb-2">Session Duration</h3>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <span>
                      {session.endedAt ? 
                        getDuration(session.startedAt, session.endedAt) : 
                        'Active'
                      }
                    </span>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Session Status</h3>
                  <div className="p-3 border rounded-lg">
                    <Badge variant={
                      session.status === 'active' ? 'default' : 
                      session.status === 'force_ended' ? 'destructive' : 'secondary'
                    }>
                      {session.status.replace('_', ' ')}
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
              {!session.actions || session.actions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No activity logged for this session</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {session.actions.map((action, index) => (
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
              )}
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
                <Badge variant="outline">{session.ipAddress || 'N/A'}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">User Agent</span>
                <Badge variant="outline">
                  {session.userAgent ? 
                    session.userAgent.split('/')[0] || session.userAgent.substring(0, 20) : 
                    'N/A'
                  }
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Started At</span>
                <Badge variant="outline">
                  {new Date(session.startedAt).toLocaleDateString()}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Security Level</span>
                <Badge variant={session.status === 'active' ? 'default' : 'secondary'}>
                  {session.status === 'active' ? 'Active' : 'Secured'}
                </Badge>
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