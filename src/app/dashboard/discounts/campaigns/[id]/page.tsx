// app/dashboard/discounts/campaigns/[id]/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCallback, useState, useEffect } from 'react';
import { DiscountsDashboardShell } from '@/components/discounts/discounts-dashboard-shell';
import { CampaignPerformanceDashboard } from '@/components/discounts/campaign-performance-dashboard';
import { Button } from '@/components/ui/button';
import { Edit, Archive, Download, RefreshCw, ArrowLeft, Share, Copy } from 'lucide-react';
import { useCampaign, useCampaignPerformance, useArchiveCampaign } from '@/hooks/use-campaigns';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { CampaignDetailsErrorBoundary } from '@/components/discounts/campaign-details-error-boundary';

// Helper functions for CSV export
const generateCampaignCSV = (data: any): string => {
  const headers = ['Metric', 'Value', 'Details'];
  const rows = [
    headers.join(','),
    // Campaign info
    `Campaign Name,"${data.campaign.name}",`,
    `Campaign Type,"${data.campaign.type}",`,
    `Status,"${data.campaign.status}",`,
    `Start Date,"${new Date(data.campaign.startDate).toLocaleDateString()}",`,
    `End Date,"${data.campaign.endDate ? new Date(data.campaign.endDate).toLocaleDateString() : 'Ongoing'}",`,
    `Budget,"${data.campaign.budget || 'N/A'}",USD`,
    `Revenue Goal,"${data.campaign.revenueGoal || 'N/A'}",USD`,
    // Performance metrics
    `Total Redemptions,"${data.performance.totalRedemptions}",`,
    `Total Revenue,"${data.performance.totalRevenue}",USD`,
    `Total Discount Amount,"${data.performance.totalDiscountAmount}",USD`,
    `ROI,"${data.performance.roi}",Multiplier`,
    `Conversion Rate,"${data.performance.conversionRate}",Percentage`,
    `Budget Utilization,"${data.performance.budgetUtilization}",Percentage`,
    // Daily performance header
    '',
    'Daily Performance Data:',
    'Date,Redemptions,Revenue',
    ...data.dailyData.map((day: any) => 
      `"${day.date}","${day.redemptions}","${day.revenue}"`
    )
  ];
  
  return rows.join('\n');
};

const downloadCSVFile = (csvContent: string, filename: string): void => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export default function CampaignDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  // State management
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Fetch real campaign data with proper error handling
  const { 
    data: campaign, 
    isLoading: campaignLoading, 
    error: campaignError,
    refetch: refetchCampaign 
  } = useCampaign(campaignId);

  // Fetch real performance data with proper error handling
  const { 
    data: performanceData, 
    isLoading: performanceLoading, 
    error: performanceError,
    refetch: refetchPerformance 
  } = useCampaignPerformance(campaignId);

  const archiveCampaign = useArchiveCampaign();

  // Navigation handlers
  const handleEdit = useCallback(() => {
    if (archiveCampaign.isPending) {
      toast.info('Please wait for current operation to complete');
      return;
    }
    router.push(`/dashboard/discounts/campaigns/${campaignId}/edit`);
  }, [router, campaignId, archiveCampaign.isPending]);

  // Archive campaign with confirmation
  const handleArchive = useCallback(async () => {
    if (!campaign) return;

    try {
      // Show confirmation toast
      toast.info('Campaign will be archived', {
        description: 'This action cannot be undone.',
        action: {
          label: 'Confirm',
          onClick: async () => {
            try {
              await archiveCampaign.mutateAsync(campaignId);
              toast.success('Campaign archived successfully', {
                description: 'Campaign has been moved to archived status.'
              });
              router.push('/dashboard/discounts/campaigns');
            } catch (error: any) {
              console.error('Archive failed:', error);
              toast.error('Failed to archive campaign', {
                description: error?.message || 'An unexpected error occurred'
              });
            }
          }
        }
      });
    } catch (error) {
      console.error('Archive failed:', error);
      toast.error('Failed to archive campaign');
    }
  }, [campaign, archiveCampaign, campaignId, router]);

  // Real export functionality
  const handleExport = useCallback(async () => {
    if (!campaign || !performanceData) {
      toast.error('Campaign data not available for export');
      return;
    }

    try {
      setIsExporting(true);
      toast.info('Preparing export...', { duration: 1000 });

      // Create comprehensive campaign report
      const reportData = {
        campaign: {
          name: campaign.name,
          description: campaign.description,
          type: campaign.type,
          status: campaign.isActive ? 'Active' : 'Inactive',
          startDate: campaign.startDate,
          endDate: campaign.endDate,
          channels: campaign.channels,
          targetAudience: campaign.targetAudience,
          budget: campaign.budget,
          revenueGoal: campaign.revenueGoal,
        },
        performance: performanceData.performance,
        dailyData: performanceData.dailyPerformance,
        topDiscounts: performanceData.topDiscounts || [],
        exportDate: new Date().toISOString(),
        exportedBy: 'Dashboard User' // This could come from auth context
      };

      // Convert to CSV format
      const csvContent = generateCampaignCSV(reportData);
      
      // Download file
      downloadCSVFile(csvContent, `campaign-${campaign.name}-report-${new Date().toISOString().split('T')[0]}.csv`);
      
      toast.success('Campaign report exported successfully', {
        description: 'The file has been downloaded to your device.'
      });

    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export campaign data', {
        description: 'Please try again later or contact support.'
      });
    } finally {
      setIsExporting(false);
    }
  }, [campaign, performanceData]);

  // Data refresh handler
  const handleRefreshData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      toast.info('Refreshing campaign data...');
      
      await Promise.all([
        refetchCampaign(),
        refetchPerformance()
      ]);
      
      toast.success('Data refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh data:', error);
      toast.error('Failed to refresh data');
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchCampaign, refetchPerformance]);

  // Share campaign link
  const handleShareCampaign = useCallback(async () => {
    try {
      const campaignUrl = `${window.location.origin}/dashboard/discounts/campaigns/${campaignId}`;
      await navigator.clipboard.writeText(campaignUrl);
      toast.success('Campaign link copied to clipboard');
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast.error('Failed to copy link');
    }
  }, [campaignId]);

  // Auto-refresh when component mounts
  useEffect(() => {
    if (campaignId) {
      handleRefreshData();
    }
  }, [campaignId]); // Only run once when campaignId changes

  // Comprehensive loading state
  if (campaignLoading || performanceLoading) {
    const loadingMessage = campaignLoading 
      ? "Loading campaign details..." 
      : "Loading performance data...";
    
    return (
      <DiscountsDashboardShell
        title="Loading Campaign"
        description={loadingMessage}
        actions={
          <Button variant="outline" disabled>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Loading...
          </Button>
        }
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Discounts', href: '/dashboard/discounts' },
          { label: 'Campaigns', href: '/dashboard/discounts/campaigns' },
          { label: 'Campaign Details' }
        ]}
      >
        <div className="space-y-6">
          {/* Campaign Status Card Skeleton */}
          <div className="rounded-lg border bg-card">
            <div className="p-6">
              <div className="grid gap-4 md:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Metrics Cards Skeleton */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-lg border bg-card">
                <div className="p-6 space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-2 w-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
          
          {/* Charts Skeleton */}
          <div className="grid gap-6 md:grid-cols-2">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="rounded-lg border bg-card">
                <div className="p-6 space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <Skeleton className="h-48 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </DiscountsDashboardShell>
    );
  }

  // Comprehensive error handling
  if (campaignError || performanceError) {
    const primaryError = campaignError || performanceError;
    const errorType = campaignError ? 'campaign' : 'performance';
    const canShowPartialData = campaign && !campaignError && performanceError;
    
    return (
      <DiscountsDashboardShell
        title="Error Loading Data"
        description={`Failed to load ${errorType} data for campaign`}
        actions={
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleRefreshData}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Retry
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/discounts/campaigns">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Campaigns
              </Link>
            </Button>
          </div>
        }
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Discounts', href: '/dashboard/discounts' },
          { label: 'Campaigns', href: '/dashboard/discounts/campaigns' },
          { label: 'Error' }
        ]}
      >
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="space-y-2">
              <div>
                <strong>
                  {campaignError ? 'Campaign Loading Error' : 'Performance Data Loading Error'}
                </strong>
              </div>
              <div>{primaryError?.message || 'An unexpected error occurred'}</div>
              
              {/* Error-specific guidance */}
              <div className="mt-2 text-sm">
                {campaignError && (
                  <div>
                    <p>• Cannot load campaign information</p>
                    <p>• Check your internet connection</p>
                    <p>• Verify campaign ID: {campaignId}</p>
                    <p>• Ensure you have proper permissions</p>
                  </div>
                )}
                
                {performanceError && !campaignError && (
                  <div>
                    <p>• Campaign details loaded successfully</p>
                    <p>• Performance data is temporarily unavailable</p>
                    <p>• Basic campaign information is still accessible</p>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>

          {/* Show partial data if campaign loaded but performance failed */}
          {canShowPartialData && (
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Limited View:</strong> Campaign details are available, but performance metrics could not be loaded.
                  <Button 
                    variant="link" 
                    size="sm" 
                    onClick={() => refetchPerformance()}
                    className="ml-2 p-0 h-auto"
                  >
                    Try loading performance data again
                  </Button>
                </AlertDescription>
              </Alert>
              
              {/* Basic campaign info */}
              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold mb-4">{campaign.name}</h3>
                <div className="grid gap-4 md:grid-cols-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Status</div>
                    <Badge variant={campaign.isActive ? "default" : "secondary"}>
                      {campaign.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Type</div>
                    <div className="font-medium capitalize">{campaign.type}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Start Date</div>
                    <div className="font-medium">{new Date(campaign.startDate).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Channels</div>
                    <div className="font-medium">{campaign.channels?.join(', ') || 'None'}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="grid gap-3 md:grid-cols-3">
            <Button 
              variant="outline" 
              onClick={handleRefreshData}
              disabled={isRefreshing}
              className="w-full"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Retrying...' : 'Try Again'}
            </Button>
            
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/discounts/campaigns">
                All Campaigns
              </Link>
            </Button>
            
            {canShowPartialData && (
              <Button onClick={handleEdit} variant="outline" className="w-full">
                <Edit className="h-4 w-4 mr-2" />
                Edit Campaign
              </Button>
            )}
          </div>
        </div>
      </DiscountsDashboardShell>
    );
  }

  // Handle campaign not found (after loading completed)
  if (!campaign && !campaignLoading && !campaignError) {
    return (
      <DiscountsDashboardShell
        title="Campaign Not Found"
        description="The requested campaign could not be found"
        actions={
          <Button asChild variant="outline">
            <Link href="/dashboard/discounts/campaigns">
              <ArrowLeft className="h-4 w-4 mr-2" />
              View All Campaigns
            </Link>
          </Button>
        }
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Discounts', href: '/dashboard/discounts' },
          { label: 'Campaigns', href: '/dashboard/discounts/campaigns' },
          { label: 'Not Found' }
        ]}
      >
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="space-y-2">
            <div>
              <strong>Campaign not found</strong>
            </div>
            <div>
              The campaign with ID "{campaignId}" doesn't exist or you don't have permission to view it.
            </div>
            <div className="mt-2 text-sm">
              <p>• The campaign may have been deleted</p>
              <p>• You may not have the required permissions</p>
              <p>• The campaign ID in the URL may be incorrect</p>
            </div>
          </AlertDescription>
        </Alert>
      </DiscountsDashboardShell>
    );
  }

  // Ensure we have campaign data
  if (!campaign) {
    return null;
  }

  // Calculate additional metrics when performance data is available
  const calculateCostPerAcquisition = () => {
    if (!performanceData || !campaign.budget) return 0;
    const totalRedemptions = performanceData.performance.totalRedemptions;
    return totalRedemptions > 0 ? campaign.budget / totalRedemptions : 0;
  };

  // Enhanced actions with comprehensive functionality
  const actions = (
    <div className="flex flex-wrap gap-2">
      {/* Refresh button */}
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleRefreshData}
        disabled={isRefreshing}
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
        {isRefreshing ? 'Refreshing...' : 'Refresh'}
      </Button>

      {/* Share button */}
      <Button variant="outline" size="sm" onClick={handleShareCampaign}>
        <Share className="mr-2 h-4 w-4" />
        Share
      </Button>

      {/* Export button */}
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleExport}
        disabled={isExporting || !performanceData}
      >
        <Download className="mr-2 h-4 w-4" />
        {isExporting ? 'Exporting...' : 'Export'}
      </Button>
      
      {/* Archive button */}
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleArchive}
        disabled={archiveCampaign.isPending || campaign.isArchived}
      >
        <Archive className="mr-2 h-4 w-4" />
        {archiveCampaign.isPending ? 'Archiving...' : 'Archive'}
      </Button>
      
      {/* Edit button */}
      <Button size="sm" onClick={handleEdit}>
        <Edit className="mr-2 h-4 w-4" />
        Edit Campaign
      </Button>
    </div>
  );

  // Show warning if performance data is missing but continue with basic view
  const showPerformanceWarning = !performanceData && !performanceLoading && !performanceError;
  
  return (
    <CampaignDetailsErrorBoundary campaignId={campaignId}>
      <DiscountsDashboardShell
        title={campaign.name}
        description={campaign.description || `${campaign.type} campaign`}
        actions={actions}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Discounts', href: '/dashboard/discounts' },
          { label: 'Campaigns', href: '/dashboard/discounts/campaigns' },
          { label: campaign.name }
        ]}
      >
        <div className="space-y-6">
          {/* Show warning if performance data is missing */}
          {showPerformanceWarning && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Performance data unavailable:</strong> Campaign details are shown, but performance metrics could not be loaded.
                <Button 
                  variant="link" 
                  size="sm" 
                  onClick={() => refetchPerformance()}
                  className="ml-2 p-0 h-auto"
                >
                  Try loading performance data
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Campaign performance dashboard with error boundary protection */}
          {performanceData ? (
            <CampaignDetailsErrorBoundary campaignId={campaignId}>
              <CampaignPerformanceDashboard
                campaign={campaign}
                metrics={{
                  redemptions: performanceData.performance.totalRedemptions,
                  revenue: performanceData.performance.totalRevenue,
                  roi: performanceData.performance.roi,
                  conversionRate: performanceData.performance.conversionRate,
                  costPerAcquisition: calculateCostPerAcquisition()
                }}
                trendsData={performanceData.dailyPerformance || []}
                isLoading={performanceLoading}
              />
            </CampaignDetailsErrorBoundary>
          ) : (
            // Basic campaign info if performance data is not available
            <div className="rounded-lg border bg-card p-6">
              <h3 className="text-lg font-semibold mb-4">Campaign Overview</h3>
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <div className="text-sm text-muted-foreground">Status</div>
                  <Badge variant={campaign.isActive ? "default" : "secondary"}>
                    {campaign.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Type</div>
                  <div className="font-medium capitalize">{campaign.type}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Duration</div>
                  <div className="font-medium">
                    {new Date(campaign.startDate).toLocaleDateString()} - {' '}
                    {campaign.endDate ? new Date(campaign.endDate).toLocaleDateString() : 'Ongoing'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Channels</div>
                  <div className="font-medium">{campaign.channels?.join(', ') || 'None set'}</div>
                </div>
              </div>
              
              {/* Additional details */}
              {(campaign.budget || campaign.revenueGoal || campaign.targetAudience?.length || campaign.discountIds?.length) && (
                <div className="mt-4 pt-4 border-t space-y-4">
                  {/* Goals & Budget */}
                  {(campaign.budget || campaign.revenueGoal) && (
                    <div>
                      <h4 className="font-medium mb-2">Goals & Budget</h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        {campaign.budget && (
                          <div>
                            <div className="text-sm text-muted-foreground">Budget</div>
                            <div className="font-medium">${campaign.budget.toLocaleString()}</div>
                          </div>
                        )}
                        {campaign.revenueGoal && (
                          <div>
                            <div className="text-sm text-muted-foreground">Revenue Goal</div>
                            <div className="font-medium">${campaign.revenueGoal.toLocaleString()}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Targeting Info */}
                  {campaign.targetAudience?.length && (
                    <div>
                      <h4 className="font-medium mb-2">Target Audience</h4>
                      <div className="flex flex-wrap gap-1">
                        {campaign.targetAudience.map((audience, index) => (
                          <Badge key={index} variant="outline">
                            {audience}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Associated Discounts */}
                  {campaign.discountIds?.length && (
                    <div>
                      <h4 className="font-medium mb-2">Associated Discounts</h4>
                      <div className="text-sm text-muted-foreground">
                        {campaign.discountIds.length} discount{campaign.discountIds.length !== 1 ? 's' : ''} associated with this campaign
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Performance placeholder */}
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Performance Metrics</h4>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => refetchPerformance()}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Load Performance Data
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Performance metrics are not available. Click "Load Performance Data" to retry.
                </p>
              </div>
            </div>
          )}
        </div>
      </DiscountsDashboardShell>
    </CampaignDetailsErrorBoundary>
  );
}