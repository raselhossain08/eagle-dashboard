import { AuditLog } from '@/types/audit';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  ChevronRight
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

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No activity recorded for this period.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {activities.map((activity, index) => (
        <div key={activity.id} className="flex items-start space-x-4 group">
          {/* Timeline dot */}
          <div className={cn(
            "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1",
            activity.status === 'success' && "bg-green-100",
            activity.status === 'failure' && "bg-red-100",
            activity.status === 'error' && "bg-orange-100"
          )}>
            {getStatusIcon(activity.status)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2 pb-6 border-b">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                    {activity.action.split('.').pop()}
                  </code>
                  <Badge variant={getStatusVariant(activity.status)}>
                    {activity.status}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground mt-1">
                  {activity.action}
                </p>

                {activity.resourceType && (
                  <div className="flex items-center space-x-2 mt-1 text-xs text-muted-foreground">
                    <span>{activity.resourceType}</span>
                    {activity.resourceId && (
                      <>
                        <span>•</span>
                        <code className="font-mono">
                          {activity.resourceId.slice(0, 8)}...
                        </code>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                {format(new Date(activity.timestamp), 'MMM dd, HH:mm')}
              </div>
            </div>

            {/* Error message if present */}
            {activity.errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="text-sm text-red-800 font-medium">Error</p>
                <p className="text-sm text-red-700 mt-1">{activity.errorMessage}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}