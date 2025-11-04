// app/dashboard/support/impersonation/page.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Users, Shield, Clock, AlertTriangle, Plus } from 'lucide-react';
import { useImpersonationHistory, useImpersonationStats, useActiveImpersonations } from '@/hooks/useSupport';
import { useState } from 'react';
import Link from 'next/link';
import { StartImpersonationModal } from '@/components/support/start-impersonation-modal';

export default function ImpersonationDashboard() {
  const { data: history, isLoading: historyLoading } = useImpersonationHistory({ page: 1, limit: 10 });
  const { data: stats, isLoading: statsLoading } = useImpersonationStats();
  const { data: activeSessions, isLoading: activeLoading } = useActiveImpersonations();
  const [searchQuery, setSearchQuery] = useState('');
  const [showStartModal, setShowStartModal] = useState(false);

  const filteredSessions = history?.sessions?.filter(session =>
    session.adminUser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.targetUser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.reason.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Impersonation Dashboard</h1>
          <p className="text-muted-foreground">
            Secure user impersonation management and monitoring
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/dashboard/support/impersonation/active">
            <Button variant="outline">
              <Shield className="w-4 h-4 mr-2" />
              Active Sessions ({activeSessions?.length || 0})
            </Button>
          </Link>
          <Link href="/dashboard/support/impersonation/history">
            <Button variant="outline">
              <Clock className="w-4 h-4 mr-2" />
              History
            </Button>
          </Link>
          <Button onClick={() => setShowStartModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Start Impersonation
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : (stats?.totalSessions || history?.total || 0)}
            </div>
            <p className="text-xs text-muted-foreground">All time impersonations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Shield className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeLoading ? '...' : (activeSessions?.length || stats?.activeSessions || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : `${Math.round((stats?.averageDuration || 0) / 60)}m`}
            </div>
            <p className="text-xs text-muted-foreground">Average session length</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Admin</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">
              {statsLoading ? '...' : (stats?.sessionsByAdmin[0]?.admin || 'N/A')}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.sessionsByAdmin[0]?.sessions || 0} sessions
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Impersonation Sessions</CardTitle>
          <CardDescription>
            Monitor and review user impersonation activities
          </CardDescription>
          <div className="flex items-center space-x-4 pt-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sessions..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="w-10 h-10 bg-muted rounded-full animate-pulse" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted rounded w-1/4 animate-pulse" />
                    <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : !filteredSessions || filteredSessions.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Impersonation Sessions</h3>
              <p className="text-muted-foreground">
                {searchQuery ? 'No sessions match your search criteria' : 'No impersonation sessions have been recorded yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSessions.slice(0, 10).map((session) => (
                <Link 
                  key={session.id} 
                  href={`/dashboard/support/impersonation/${session.id}`}
                  className="block"
                >
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">
                            {session.adminUser.name} → {session.targetUser.name}
                          </p>
                          <Badge variant={
                            session.status === 'active' ? 'default' : 
                            session.status === 'force_ended' ? 'destructive' : 'secondary'
                          }>
                            {session.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {session.reason} • {new Date(session.startedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        Duration: {session.endedAt ? 
                          `${Math.round(session.duration || 
                            (new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime()) / 60000)}m` : 
                          'Active'
                        }
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {session.endedAt ? 'Ended' : 'Started'} {new Date(session.endedAt || session.startedAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
              
              {filteredSessions.length > 10 && (
                <div className="text-center pt-4">
                  <Link href="/dashboard/support/impersonation/history">
                    <Button variant="outline">
                      View All Sessions ({history?.total || filteredSessions.length})
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <StartImpersonationModal 
        open={showStartModal}
        onOpenChange={setShowStartModal}
      />
    </div>
  );
}