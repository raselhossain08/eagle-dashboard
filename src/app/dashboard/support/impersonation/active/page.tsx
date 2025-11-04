'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Clock, AlertTriangle, Square, MoreHorizontal, ArrowLeft } from 'lucide-react';
import { useActiveImpersonations, useEndImpersonation, useForceEndImpersonation } from '@/hooks/useSupport';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { toast } from 'sonner';

export default function ActiveImpersonationsPage() {
  const { data: activeSessions, isLoading, error } = useActiveImpersonations();
  const endImpersonation = useEndImpersonation();
  const forceEndImpersonation = useForceEndImpersonation();

  const getSessionDuration = (startedAt: string) => {
    const start = new Date(startedAt);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  const handleEndSession = async (sessionId: string) => {
    try {
      await endImpersonation.mutateAsync({ logId: sessionId, reason: 'Manual termination' });
      toast.success('Impersonation session ended successfully');
    } catch (error) {
      console.error('Failed to end session:', error);
      toast.error('Failed to end impersonation session');
    }
  };

  const handleForceEndSession = async (sessionId: string) => {
    try {
      await forceEndImpersonation.mutateAsync({ logId: sessionId, reason: 'Forced termination by admin' });
      toast.success('Impersonation session force-ended successfully');
    } catch (error) {
      console.error('Failed to force end session:', error);
      toast.error('Failed to force end impersonation session');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/support/impersonation">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Active Impersonation Sessions</h1>
            <p className="text-muted-foreground">
              Monitor and manage currently active user impersonation sessions
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Active Sessions</span>
            {activeSessions && activeSessions.length > 0 && (
              <Badge variant="secondary">{activeSessions.length}</Badge>
            )}
          </CardTitle>
          <CardDescription>
            Real-time monitoring of all active impersonation sessions with security controls
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg animate-pulse">
                  <div className="w-10 h-10 bg-muted rounded-full" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted rounded w-1/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-destructive opacity-50" />
              <h3 className="text-lg font-medium mb-2">Failed to Load Sessions</h3>
              <p className="text-muted-foreground">
                Unable to load active impersonation sessions. Please try again.
              </p>
            </div>
          ) : !activeSessions || activeSessions.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Active Sessions</h3>
              <p className="text-muted-foreground">
                There are currently no active impersonation sessions
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Admin User</TableHead>
                  <TableHead>Target User</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Started At</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeSessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          {session.adminUser.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium">{session.adminUser.name}</div>
                          <div className="text-sm text-muted-foreground">{session.adminUser.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                          {session.targetUser.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium">{session.targetUser.name}</div>
                          <div className="text-sm text-muted-foreground">{session.targetUser.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate" title={session.reason}>
                        {session.reason}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{getSessionDuration(session.startedAt)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(session.startedAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">Active</Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => handleEndSession(session.id)}
                            disabled={endImpersonation.isPending}
                          >
                            <Square className="w-4 h-4 mr-2" />
                            End Session
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleForceEndSession(session.id)}
                            disabled={forceEndImpersonation.isPending}
                          >
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Force End
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Security Alert Card */}
      <Card className="border-yellow-200 dark:border-yellow-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-yellow-600 dark:text-yellow-400">
            <AlertTriangle className="w-5 h-5" />
            <span>Security Notice</span>
          </CardTitle>
          <CardDescription className="text-yellow-700 dark:text-yellow-300">
            Active impersonation sessions have elevated privileges. Monitor sessions closely and 
            ensure they are properly terminated after use. All activities are logged for security auditing.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}