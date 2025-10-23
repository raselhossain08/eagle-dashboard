// app/dashboard/subscribers/[id]/activity/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  User,
  CreditCard,
  Settings,
  MessageSquare,
  ShoppingCart,
  AlertTriangle,
  FileText,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useSubscriber } from '@/hooks/useSubscribers';
import { useSubscriberActivity } from '@/hooks/useBilling';

const getActivityIcon = (type: string) => {
  const icons = {
    login: User,
    transaction: CreditCard,
    invoice: FileText,
    subscription: CreditCard,
    purchase: ShoppingCart,
    subscription_change: CreditCard,
    profile_update: Settings,
    support_ticket: MessageSquare,
    default: AlertTriangle
  };
  return icons[type as keyof typeof icons] || icons.default;
};

const getActivityColor = (type: string) => {
  const colors = {
    login: 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300',
    transaction: 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300',
    invoice: 'text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-300',
    subscription: 'text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-300',
    purchase: 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300',
    subscription_change: 'text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-300',
    profile_update: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300',
    support_ticket: 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-300',
    default: 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-300'
  };
  return colors[type as keyof typeof colors] || colors.default;
};

export default function ActivityPage() {
  const params = useParams();
  const id = params.id as string;
  
  const { data: subscriber, isLoading: subscriberLoading } = useSubscriber(id);
  const { data: activities, isLoading: activitiesLoading } = useSubscriberActivity(id, { limit: 50 });

  const isLoading = subscriberLoading || activitiesLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 w-48 bg-muted rounded animate-pulse" />
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex gap-4">
                  <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-48 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-32 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/subscribers/${id}`}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Activity Timeline</h1>
            <p className="text-muted-foreground">
              Recent activity and events for {subscriber?.firstName} {subscriber?.lastName}
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Timeline of all subscriber activities and events
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activitiesLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading activity...</span>
            </div>
          ) : activities && activities.length > 0 ? (
            <div className="space-y-8">
              {activities.map((activity, index) => {
                const IconComponent = getActivityIcon(activity.type);
                return (
                  <div key={activity.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      {index < activities.length - 1 && (
                        <div className="w-0.5 h-full bg-border mt-2" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1 pb-8">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{activity.description}</p>
                        <Badge variant="outline" className="text-xs">
                          {new Date(activity.timestamp).toLocaleDateString()} at{' '}
                          {new Date(activity.timestamp).toLocaleTimeString()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {activity.type.replace('_', ' ').toUpperCase()}
                      </p>
                      {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                        <div className="text-sm text-muted-foreground mt-2">
                          {Object.entries(activity.metadata).map(([key, value]) => (
                            <span key={key} className="inline-block mr-3">
                              <strong>{key}:</strong> {String(value)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No activity recorded for this subscriber
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}