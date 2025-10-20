'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Monitor, Clock, User, Shield, LogOut } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface SessionTrackingProps {
  sessions: Array<{
    id: string;
    adminEmail: string;
    adminRole: string;
    startTime: Date;
    lastActivity: Date;
    ipAddress: string;
    location: string;
    userAgent: string;
    status: 'active' | 'expired' | 'terminated';
    actionsCount: number;
    riskScore: number;
    deviceInfo: {
      browser: string;
      os: string;
      device: string;
    };
  }>;
  isLoading?: boolean;
}

export function SessionTracking({ sessions, isLoading }: SessionTrackingProps) {
  const getSessionStatus = (session: any) => {
    const now = new Date();
    const lastActivity = new Date(session.lastActivity);
    const minutesSinceActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60);

    if (session.status === 'terminated') return 'terminated';
    if (minutesSinceActivity > 60) return 'expired';
    return 'active';
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'expired': return 'secondary';
      case 'terminated': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50 border-green-200';
      case 'expired': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'terminated': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-muted rounded-full" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Session Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {sessions.filter(s => getSessionStatus(s) === 'active').length}
                </div>
                <div className="text-sm text-muted-foreground">Active</div>
              </div>
              <User className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {sessions.filter(s => getSessionStatus(s) === 'expired').length}
                </div>
                <div className="text-sm text-muted-foreground">Expired</div>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {sessions.filter(s => getSessionStatus(s) === 'terminated').length}
                </div>
                <div className="text-sm text-muted-foreground">Terminated</div>
              </div>
              <LogOut className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {sessions.reduce((acc, session) => acc + session.actionsCount, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Actions</div>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Session List */}
      <div className="space-y-4">
        {sessions.map((session) => {
          const status = getSessionStatus(session);
          
          return (
            <Card key={session.id} className={`border-l-4 ${
              status === 'active' ? 'border-l-green-500' :
              status === 'expired' ? 'border-l-yellow-500' : 'border-l-red-500'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {/* Admin Info */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                    </div>

                    <div className="flex-1 space-y-3">
                      {/* Header */}
                      <div className="flex items-center space-x-3">
                        <div>
                          <h4 className="font-semibold">{session.adminEmail}</h4>
                          <p className="text-sm text-muted-foreground">{session.adminRole}</p>
                        </div>
                        <Badge variant="outline" className={getStatusColor(status)}>
                          {status.toUpperCase()}
                        </Badge>
                        {session.riskScore > 70 && (
                          <Badge variant="destructive">
                            High Risk: {session.riskScore}%
                          </Badge>
                        )}
                      </div>

                      {/* Session Details */}
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div>Started {formatDistanceToNow(new Date(session.startTime))} ago</div>
                            <div className="text-xs text-muted-foreground">
                              Last activity: {formatDistanceToNow(new Date(session.lastActivity))} ago
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div>{session.location}</div>
                            <div className="text-xs text-muted-foreground font-mono">
                              {session.ipAddress}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Monitor className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div>{session.deviceInfo.browser}</div>
                            <div className="text-xs text-muted-foreground">
                              {session.deviceInfo.os} • {session.deviceInfo.device}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Shield className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div>{session.actionsCount} actions</div>
                            <div className="text-xs text-muted-foreground">
                              Risk: {session.riskScore}%
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {status === 'active' && (
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <LogOut className="h-4 w-4 mr-2" />
                        Terminate
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {sessions.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">No Active Sessions</h3>
            <p className="text-muted-foreground mt-2">
              No administrator sessions found for the selected period.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}