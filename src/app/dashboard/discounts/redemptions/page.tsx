// app/dashboard/discounts/redemptions/page.tsx - Enhanced Real-time Redemptions Page
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { RedemptionsTable } from '@/components/discounts/redemptions-table';
import { 
  useRedemptionsRealTime, 
  useRedemptionStats, 
  useExportRedemptions,
  RedemptionsQueryParams 
} from '@/hooks/use-redemptions';
import { 
  useRedemptionWebSocket, 
  useRedemptionStatsWebSocket,
  getConnectionStatusColor,
  getConnectionStatusText
} from '@/lib/websocket/redemptions-websocket';
import { 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  Shield, 
  Download,
  RefreshCw,
  Settings,
  Filter,
  BarChart3,
  Users,
  Globe
} from 'lucide-react';
import { toast } from 'sonner';

export default function EnhancedRedemptionsPage() {
  // State management
  const [filters, setFilters] = useState<any>({
    page: 1,
    limit: 20,
    sortBy: 'redeemedAt',
    sortOrder: 'desc',
    includeFraudScore: true,
    includeUser: true
  });

  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');

  // Real-time data hooks
  const {
    data: redemptionsData,
    isLoading,
    error,
    refresh,
    hasSuspiciousActivity,
    isEmpty
  } = useRedemptionsRealTime(filters, {
    enabled: realTimeEnabled,
    interval: 10000, // 10 seconds
    onNewData: (newData) => {
      if ((newData as any).computed?.suspiciousRedemptions.length > 0) {
        // Handle new suspicious activity
        console.log('New suspicious activity detected');
      }
    }
  });

  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError
  } = useRedemptionStats({}, {
    enabled: true,
    refetchInterval: 30000 // 30 seconds
  });

  const { liveStats, isConnected: wsConnected } = useRedemptionStatsWebSocket();

  // WebSocket connection
  const {
    isConnected,
    connectionStatus,
    lastEvent,
    subscribeToFraudAlerts
  } = useRedemptionWebSocket({
    enabled: realTimeEnabled,
    onSuspiciousActivity: (activity) => {
      console.log('WebSocket: Suspicious activity detected', activity);
      // Refresh data to show new suspicious items
      refresh();
    },
    onFraudAlert: (alert) => {
      console.log('WebSocket: Fraud alert received', alert);
      // Immediate refresh for fraud alerts
      refresh();
    },
    onRedemptionCreated: (redemption) => {
      console.log('WebSocket: New redemption created', redemption);
      // Refresh to show new redemption
      refresh();
    }
  });

  // Export functionality
  const exportMutation = useExportRedemptions();

  // Subscribe to fraud alerts on connection
  useEffect(() => {
    if (isConnected) {
      subscribeToFraudAlerts();
    }
  }, [isConnected, subscribeToFraudAlerts]);

  // Computed values
  const displayStats = liveStats || statsData;
  
  const currentStats = useMemo(() => {
    if (!redemptionsData) return null;

    return {
      totalRedemptions: redemptionsData.total,
      totalValue: redemptionsData.metadata.totalValue,
      totalDiscounts: redemptionsData.metadata.totalDiscounts,
      suspiciousCount: redemptionsData.metadata.suspiciousCount,
      averageOrderValue: redemptionsData.metadata.avgOrderValue,
      suspiciousRate: redemptionsData.total > 0 
        ? (redemptionsData.metadata.suspiciousCount / redemptionsData.total) * 100 
        : 0
    };
  }, [redemptionsData]);

  // Event handlers
  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleViewDetails = (redemption: any) => {
    // Navigate to redemption details
    window.open(`/dashboard/discounts/redemptions/${redemption.id}`, '_blank');
  };

  const handleExport = async (format: 'csv' | 'excel' | 'json' = 'csv') => {
    try {
      await exportMutation.mutateAsync({
        ...filters,
        format
      });
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handlePageChange = (page: number) => {
    setFilters((prev: any) => ({ ...prev, page }));
  };

  const toggleRealTime = () => {
    setRealTimeEnabled(!realTimeEnabled);
    if (realTimeEnabled) {
      toast.info('Real-time updates disabled');
    } else {
      toast.success('Real-time updates enabled');
    }
  };

  // Error handling
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to load redemptions</h3>
            <p className="text-muted-foreground mb-4">
              {error.message || 'An unexpected error occurred'}
            </p>
            <Button onClick={refresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Redemption Analytics</h1>
          <p className="text-muted-foreground">
            Real-time monitoring and fraud detection for discount redemptions
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Connection Status */}
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${getConnectionStatusColor(connectionStatus)}`} />
            <span className="text-muted-foreground">
              {getConnectionStatusText(connectionStatus)}
            </span>
          </div>

          {/* Real-time Toggle */}
          <Button
            variant={realTimeEnabled ? "default" : "outline"}
            size="sm"
            onClick={toggleRealTime}
          >
            <Activity className="mr-2 h-4 w-4" />
            Real-time
          </Button>

          <Button variant="outline" size="sm" onClick={refresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Alert Banner for Suspicious Activity */}
      {hasSuspiciousActivity && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="font-medium text-red-800">
                  Suspicious Activity Detected
                </span>
                <Badge variant="destructive">
                  {currentStats?.suspiciousCount || 0} alerts
                </Badge>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setFilters((prev: any) => ({ ...prev, page: 1 }))}
              >
                <Shield className="mr-2 h-4 w-4" />
                Investigate
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      {currentStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Redemptions</p>
                  <p className="text-2xl font-bold">{currentStats.totalRedemptions.toLocaleString()}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold">
                    ${(currentStats.totalValue / 100).toLocaleString()}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Order Value</p>
                  <p className="text-2xl font-bold">
                    ${(currentStats.averageOrderValue / 100).toFixed(0)}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className={currentStats.suspiciousRate > 10 ? "border-red-200" : ""}>
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fraud Rate</p>
                  <p className={`text-2xl font-bold ${currentStats.suspiciousRate > 10 ? 'text-red-600' : 'text-green-600'}`}>
                    {currentStats.suspiciousRate.toFixed(1)}%
                  </p>
                </div>
                <AlertTriangle className={`h-8 w-8 ${currentStats.suspiciousRate > 10 ? 'text-red-600' : 'text-green-600'}`} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Redemptions Table */}
          {redemptionsData && (
            <RedemptionsTable
              data={redemptionsData.redemptions}
              total={redemptionsData.total}
              page={redemptionsData.page}
              totalPages={redemptionsData.totalPages}
              hasNext={redemptionsData.hasNext}
              hasPrev={redemptionsData.hasPrev}
              metadata={redemptionsData.metadata}
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onViewDetails={handleViewDetails}
              onExport={handleExport}
              onPageChange={handlePageChange}
              onRefresh={refresh}
              isLoading={isLoading}
              isRealTime={realTimeEnabled && isConnected}
              lastUpdated={lastEvent ? new Date(lastEvent.payload.timestamp) : undefined}
            />
          )}
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Advanced analytics dashboard coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Monitoring</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Real-time fraud monitoring dashboard coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Loading States */}
      {isEmpty && !isLoading && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Redemptions Found</h3>
            <p className="text-muted-foreground">
              No discount redemptions match your current filters.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}