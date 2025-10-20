// components/ImpersonationWidget.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Users, 
  Play, 
  Square, 
  AlertTriangle, 
  MoreHorizontal,
  Clock
} from 'lucide-react';
import { useActiveImpersonations, useEndImpersonation } from '@/hooks/useSupport';
import { ImpersonationSession } from '@/types/support';
import { useState } from 'react';

export function ImpersonationWidget() {
  const { data: activeSessions, isLoading } = useActiveImpersonations();
  const endImpersonation = useEndImpersonation();
  const [endingSession, setEndingSession] = useState<string | null>(null);

  const handleEndSession = async (session: ImpersonationSession) => {
    setEndingSession(session.id);
    try {
      await endImpersonation.mutateAsync({ 
        logId: session.id, 
        reason: 'Manual termination by admin' 
      });
    } finally {
      setEndingSession(null);
    }
  };

  const handleForceEndSession = async (session: ImpersonationSession) => {
    setEndingSession(session.id);
    try {
      await endImpersonation.mutateAsync({ 
        logId: session.id, 
        reason: 'Force terminated by admin' 
      });
    } finally {
      setEndingSession(null);
    }
  };

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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Active Impersonations</span>
          </CardTitle>
          <CardDescription>Loading sessions...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="w-5 h-5" />
          <span>Active Impersonations</span>
          {activeSessions && activeSessions.length > 0 && (
            <Badge variant="secondary">{activeSessions.length}</Badge>
          )}
        </CardTitle>
        <CardDescription>
          Monitor and manage active user sessions
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!activeSessions || activeSessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No active impersonation sessions</p>
          </div>
        ) : (
          activeSessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <Play className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <p className="font-medium">
                      {session.adminUser.name} → {session.targetUser.name}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {getSessionDuration(session.startedAt)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {session.reason}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Started: {new Date(session.startedAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEndSession(session)}
                  disabled={endingSession === session.id}
                >
                  <Square className="w-4 h-4 mr-1" />
                  End
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleForceEndSession(session)}
                      className="text-destructive"
                    >
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Force End
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))
        )}
        
        {activeSessions && activeSessions.length > 0 && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Total active sessions: {activeSessions.length}
              </span>
              <Button variant="ghost" size="sm">
                View All History
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}