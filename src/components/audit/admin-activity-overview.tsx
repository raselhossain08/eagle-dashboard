import { AdminActivitySummary } from '@/types/audit';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Calendar, 
  TrendingUp, 
  AlertTriangle,
  Shield,
  ArrowRight
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface AdminActivityOverviewProps {
  data: AdminActivitySummary[];
  dateRange: { from: Date; to: Date };
  isLoading?: boolean;
}

export function AdminActivityOverview({ data, dateRange, isLoading }: AdminActivityOverviewProps) {
  const getRiskLevel = (score: number) => {
    if (score < 30) return { level: 'low', color: 'text-green-600', bg: 'bg-green-100' };
    if (score < 70) return { level: 'medium', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { level: 'high', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600';
    if (rate >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2 ml-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((admin) => {
        const riskInfo = getRiskLevel(admin.riskScore);
        
        return (
          <div key={admin.adminId} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
            {/* Admin Info */}
            <div className="flex items-center space-x-4 flex-1">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-sm truncate">
                    {admin.adminEmail}
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    {admin.adminRole}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>{admin.actionsCount.toLocaleString()} actions</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>Last active: {format(new Date(admin.lastActive), 'MMM dd')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div className="flex items-center space-x-6">
              {/* Success Rate */}
              <div className="text-center">
                <div className={cn("text-lg font-bold", getSuccessRateColor(admin.successRate))}>
                  {admin.successRate.toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">Success</div>
              </div>

              {/* Risk Score */}
              <div className="text-center">
                <div className={cn("text-lg font-bold flex items-center space-x-1", riskInfo.color)}>
                  <Shield className="h-4 w-4" />
                  <span>{admin.riskScore}</span>
                </div>
                <div className="text-xs text-muted-foreground">Risk</div>
              </div>

              {/* View Details */}
              <Link href={`/dashboard/audit/admin-activity/${admin.adminId}`}>
                <Button variant="ghost" size="sm">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        );
      })}

      {data.length === 0 && (
        <div className="text-center py-12">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">No admin activity found</h3>
          <p className="text-muted-foreground mt-2">
            No administrator activity recorded for the selected date range.
          </p>
        </div>
      )}
    </div>
  );
}