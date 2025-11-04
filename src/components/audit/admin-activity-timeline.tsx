import { AuditLog } from '@/types/audit';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format, isValid, parseISO } from 'date-fns';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  ChevronRight,
  Eye,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminActivityTimelineProps {
  adminId: string;
  activities: AuditLog[];
  isLoading?: boolean;
}

export function AdminActivityTimeline({ adminId, activities, isLoading }: AdminActivityTimelineProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'failure':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      default:
        return <ChevronRight className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'success': return 'default';
      case 'failure': return 'destructive';
      case 'error': return 'destructive';
      default: return 'secondary';
    }
  };

  const formatTimestamp = (timestamp: string | Date) => {
    try {
      const date = typeof timestamp === 'string' ? parseISO(timestamp) : timestamp;
      if (!isValid(date)) {
        return 'Invalid date';
      }
      return format(date, 'MMM dd, HH:mm');
    } catch (error) {
      console.error('Error formatting timestamp:', timestamp, error);
      return 'Invalid date';
    }
  };

  const getActionDisplayName = (action: string) => {
    // Extract the last part of the action for display
    const parts = action.split('.');
    return parts[parts.length - 1] || action;
  };

  const getActionDescription = (action: string) => {
    // Provide human-readable descriptions for common actions
    const actionMap: Record<string, string> = {
      'user.create': 'Created a new user account',
      'user.update': 'Updated user information',
      'user.delete': 'Deleted user account',
      'auth.login': 'Logged into the system',
      'auth.logout': 'Logged out of the system',
      'admin.settings.update': 'Updated system settings',
      'admin.permissions.grant': 'Granted permissions',
      'admin.permissions.revoke': 'Revoked permissions',
      'system.backup.create': 'Created system backup',
      'system.backup.restore': 'Restored system backup',
    };

    return actionMap[action] || action;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start space-x-4">
            <Skeleton className="h-8 w-8 rounded-full mt-1" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="rounded-full bg-muted p-6">
            <Eye className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">No Activity Found</h3>
            <p className="text-muted-foreground text-sm max-w-md">
              No activity has been recorded for this administrator in the last 30 days.
              This could mean the admin hasn't performed any logged actions recently.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Showing {activities.length} activities</span>
        <span>Sorted by most recent</span>
      </div>

      {activities.map((activity, index) => (
        <div key={activity.id || index} className="flex items-start space-x-4 group">
          {/* Timeline dot */}
          <div className={cn(
            "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 transition-colors",
            activity.status === 'success' && "bg-green-100 group-hover:bg-green-200",
            activity.status === 'failure' && "bg-red-100 group-hover:bg-red-200",
            activity.status === 'error' && "bg-orange-100 group-hover:bg-orange-200",
            !activity.status && "bg-gray-100 group-hover:bg-gray-200"
          )}>
            {getStatusIcon(activity.status)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2 pb-6 border-b group-hover:border-border transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 flex-wrap">
                  <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                    {getActionDisplayName(activity.action)}
                  </code>
                  <Badge variant={getStatusVariant(activity.status)}>
                    {activity.status || 'unknown'}
                  </Badge>
                  {activity.ipAddress && (
                    <span className="text-xs text-muted-foreground font-mono">
                      {activity.ipAddress}
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground mt-1">
                  {getActionDescription(activity.action)}
                </p>

                {activity.resourceType && (
                  <div className="flex items-center space-x-2 mt-1 text-xs text-muted-foreground">
                    <span className="font-medium">{activity.resourceType}</span>
                    {activity.resourceId && (
                      <>
                        <span>•</span>
                        <code className="font-mono bg-muted px-1 rounded">
                          {activity.resourceId.length > 12 
                            ? `${activity.resourceId.slice(0, 8)}...${activity.resourceId.slice(-4)}`
                            : activity.resourceId
                          }
                        </code>
                      </>
                    )}
                  </div>
                )}

                {/* Additional metadata */}
                {(activity.userAgent || activity.sessionId) && (
                  <div className="flex items-center space-x-2 mt-1 text-xs text-muted-foreground">
                    {activity.sessionId && (
                      <>
                        <span>Session:</span>
                        <code className="font-mono bg-muted px-1 rounded">
                          {activity.sessionId.slice(0, 8)}...
                        </code>
                      </>
                    )}
                    {activity.userAgent && activity.sessionId && <span>•</span>}
                    {activity.userAgent && (
                      <span className="truncate max-w-xs">
                        {activity.userAgent.split(' ')[0]} Browser
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                {formatTimestamp(activity.timestamp)}
              </div>
            </div>

            {/* Error message if present */}
            {activity.errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-red-800 font-medium">Error Details</p>
                    <p className="text-sm text-red-700 mt-1">{activity.errorMessage}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Changes information */}
            {activity.changes && Object.keys(activity.changes).length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <div className="flex items-start space-x-2">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-blue-800 font-medium">Changes Made</p>
                    <div className="text-sm text-blue-700 mt-1 space-y-1">
                      {Object.entries(activity.changes).slice(0, 3).map(([key, change]: [string, any]) => (
                        <div key={key} className="font-mono text-xs">
                          <span className="font-medium">{key}:</span>{' '}
                          <span className="text-red-600">{JSON.stringify(change.from)}</span>
                          {' → '}
                          <span className="text-green-600">{JSON.stringify(change.to)}</span>
                        </div>
                      ))}
                      {Object.keys(activity.changes).length > 3 && (
                        <p className="text-xs text-blue-600">
                          +{Object.keys(activity.changes).length - 3} more changes
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}

      {activities.length >= 30 && (
        <div className="text-center py-4 text-sm text-muted-foreground">
          Showing last 30 activities. Use filters to view more specific data.
        </div>
      )}
    </div>
  );
}