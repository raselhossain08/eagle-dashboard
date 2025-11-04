// app/dashboard/discounts/codes/bulk/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DiscountsDashboardShell } from '@/components/discounts/discounts-dashboard-shell';
import { EnhancedBulkGenerator } from '@/components/discounts/enhanced-bulk-generator';
import { BulkDiscountErrorBoundary } from '@/components/discounts/bulk-discount-error-boundary';
import { useBulkDiscountAnalytics, useBulkDiscountHistory } from '@/hooks/use-bulk-discounts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Package, 
  Clock, 
  Users, 
  AlertTriangle,
  RefreshCw,
  History,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';

function BulkGenerationPageContent() {
  const router = useRouter();

  // Fetch analytics and history data
  const { 
    data: analytics, 
    isLoading: isLoadingAnalytics, 
    error: analyticsError,
    refetch: refetchAnalytics 
  } = useBulkDiscountAnalytics();

  const { 
    data: history, 
    isLoading: isLoadingHistory, 
    error: historyError,
    refetch: refetchHistory 
  } = useBulkDiscountHistory({ limit: 5 });

  const handleGenerationSuccess = (result: any) => {
    toast.success(`Successfully generated ${result.codes.length} discount codes`);
    
    // Refresh analytics and history
    refetchAnalytics();
    refetchHistory();
    
    // Navigate to codes list
    router.push('/dashboard/discounts/codes');
  };

  const handleRetry = () => {
    refetchAnalytics();
    refetchHistory();
  };

  return (
    <DiscountsDashboardShell
      title="Bulk Code Generation"
      description="Generate multiple discount codes with intelligent templates and advanced configuration"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Discounts', href: '/dashboard/discounts' },
        { label: 'Codes', href: '/dashboard/discounts/codes' },
        { label: 'Bulk Generate' }
      ]}
    >
      <div className="space-y-6">
        {/* Analytics Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Operations</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingAnalytics ? (
                <Skeleton className="h-8 w-16" />
              ) : analyticsError ? (
                <div className="text-2xl font-bold text-muted-foreground">--</div>
              ) : (
                <div className="text-2xl font-bold">{analytics?.totalBulkOperations || 0}</div>
              )}
              <p className="text-xs text-muted-foreground">
                Bulk generations completed
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Codes Generated</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingAnalytics ? (
                <Skeleton className="h-8 w-20" />
              ) : analyticsError ? (
                <div className="text-2xl font-bold text-muted-foreground">--</div>
              ) : (
                <div className="text-2xl font-bold">{analytics?.totalCodesGenerated || 0}</div>
              )}
              <p className="text-xs text-muted-foreground">
                Total discount codes created
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Batch</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingAnalytics ? (
                <Skeleton className="h-8 w-12" />
              ) : analyticsError ? (
                <div className="text-2xl font-bold text-muted-foreground">--</div>
              ) : (
                <div className="text-2xl font-bold">{Math.round(analytics?.averageBatchSize || 0)}</div>
              )}
              <p className="text-xs text-muted-foreground">
                Codes per operation
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingHistory ? (
                <Skeleton className="h-8 w-16" />
              ) : historyError ? (
                <div className="text-2xl font-bold text-muted-foreground">--</div>
              ) : (
                <div className="text-2xl font-bold">{history?.data.length || 0}</div>
              )}
              <p className="text-xs text-muted-foreground">
                Recent operations
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Error handling for analytics */}
        {(analyticsError || historyError) && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="flex items-center justify-between">
              <span className="text-yellow-800">
                Failed to load analytics data. Some features may be limited.
              </span>
              <Button
                onClick={handleRetry}
                variant="outline"
                size="sm"
                className="ml-4"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Recent Generation History */}
        {!isLoadingHistory && history && history.data.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Recent Bulk Generations
              </CardTitle>
              <CardDescription>
                Your recent bulk discount code generation activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {history.data.slice(0, 3).map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={item.status === 'completed' ? 'default' : 'destructive'}>
                          {item.status}
                        </Badge>
                        {item.prefix && (
                          <Badge variant="outline">{item.prefix}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {item.generatedCount} codes • {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-sm font-medium">
                      {item.template.type === 'percentage' 
                        ? `${item.template.value}% off`
                        : `$${(item.template.value / 100)?.toFixed(2)} off`
                      }
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Bulk Generator */}
        <EnhancedBulkGenerator
          onSuccess={handleGenerationSuccess}
          maxCount={1000}
        />
      </div>
    </DiscountsDashboardShell>
  );
}

export default function BulkGenerationPage() {
  return (
    <BulkDiscountErrorBoundary>
      <BulkGenerationPageContent />
    </BulkDiscountErrorBoundary>
  );
}