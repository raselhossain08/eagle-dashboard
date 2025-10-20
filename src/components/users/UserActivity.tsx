// app/dashboard/users/components/UserActivity.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserActivity as UserActivityType } from '@/types/users';
import { Download, Filter, Calendar } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface UserActivityProps {
  userId: string;
}

const mockActivities: UserActivityType[] = [
  {
    id: '1',
    userId: 'user-1',
    action: 'login',
    description: 'User logged in successfully',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  },
  {
    id: '2',
    userId: 'user-1',
    action: 'profile_update',
    description: 'Updated profile information',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    ipAddress: '192.168.1.1',
  },
  {
    id: '3',
    userId: 'user-1',
    action: 'password_change',
    description: 'Password changed successfully',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: '4',
    userId: 'user-1',
    action: 'email_verification',
    description: 'Email address verified',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: '5',
    userId: 'user-1',
    action: 'subscription_update',
    description: 'Upgraded to Premium plan',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: '6',
    userId: 'user-1',
    action: 'support_ticket',
    description: 'Created support ticket #TKT-001',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
];

export function UserActivity({ userId }: UserActivityProps) {
  const activities = mockActivities.filter(activity => activity.userId === userId);

  const getActionVariant = (action: string) => {
    switch (action) {
      case 'login': return 'default';
      case 'profile_update': return 'secondary';
      case 'password_change': return 'outline';
      case 'email_verification': return 'default';
      case 'subscription_update': return 'secondary';
      case 'support_ticket': return 'outline';
      default: return 'secondary';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'login': return '🔐';
      case 'profile_update': return '👤';
      case 'password_change': return '🔑';
      case 'email_verification': return '📧';
      case 'subscription_update': return '💎';
      case 'support_ticket': return '🎫';
      default: return '📝';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Activity Timeline</CardTitle>
            <CardDescription>
              Recent user actions and system events
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Select defaultValue="all">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="login">Logins</SelectItem>
                <SelectItem value="profile">Profile</SelectItem>
                <SelectItem value="security">Security</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={activity.id} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm">
                  {getActionIcon(activity.action)}
                </div>
                {index < activities.length - 1 && (
                  <div className="w-0.5 h-full bg-border mt-2" />
                )}
              </div>
              
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{activity.description}</p>
                  <Badge variant={getActionVariant(activity.action)} className="text-xs">
                    {activity.action.replace('_', ' ')}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{new Date(activity.timestamp).toLocaleString()}</span>
                  {activity.ipAddress && (
                    <>
                      <span>•</span>
                      <span>IP: {activity.ipAddress}</span>
                    </>
                  )}
                </div>
                
                {activity.userAgent && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {activity.userAgent}
                  </p>
                )}
              </div>
            </div>
          ))}
          
          {activities.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Activity Found</h3>
              <p className="text-muted-foreground">
                This user hasn't performed any actions yet.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}