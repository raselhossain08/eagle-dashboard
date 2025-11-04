// app/dashboard/discounts/campaigns/page.tsx
'use client';

import { useState, useCallback, useMemo } from 'react';
import { DiscountsDashboardShell } from '@/components/discounts/discounts-dashboard-shell';
import { CampaignsOverview } from '@/components/discounts/campaigns-overview';
import { CampaignsTable } from '@/components/discounts/campaigns-table';
import { CampaignsPageErrorBoundary } from '@/components/discounts/campaigns-page-error-boundary';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, RefreshCw, AlertTriangle, Inbox } from 'lucide-react';
import Link from 'next/link';
import { useCampaigns, useCampaignsOverview, useArchiveCampaign } from '@/hooks/use-campaigns';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Campaign } from '@/types/discounts';

export default function CampaignsPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<{
    isActive?: boolean;
    type?: string;
  }>({});

  // Fetch real data with comprehensive error handling
  const { 
    data: campaignsData, 
    isLoading: campaignsLoading, 
    error: campaignsError,
    refetch: refetchCampaigns,
    isFetching: isFetchingCampaigns
  } = useCampaigns({
    page: currentPage,
    limit: 10,
    ...filters
  });

  const { 
    data: overviewData, 
    isLoading: overviewLoading, 
    error: overviewError,
    refetch: refetchOverview,
    isFetching: isFetchingOverview
  } = useCampaignsOverview();

  const archiveCampaign = useArchiveCampaign();

  // Memoized handlers for performance optimization
  const handleFiltersChange = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  const handleEdit = useCallback((campaign: Campaign) => {
    router.push(`/dashboard/discounts/campaigns/${campaign.id}/edit`);
  }, [router]);

  const handleArchive = useCallback(async (campaignId: string) => {
    try {
      await archiveCampaign.mutateAsync(campaignId);
      toast.success('Campaign archived successfully', {
        description: 'The campaign has been moved to archived status.',
        duration: 4000
      });
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to archive campaign';
      toast.error(errorMessage, {
        description: 'Please try again or contact support if the issue persists.',
        duration: 5000
      });
      console.error('Archive failed:', error);
    }
  }, [archiveCampaign]);

  const handleViewPerformance = useCallback((campaignId: string) => {
    router.push(`/dashboard/discounts/campaigns/${campaignId}`);
  }, [router]);

  // Memoized computed values
  const campaignsList = useMemo(() => {
    return campaignsData?.data || campaignsData?.campaigns || [];
  }, [campaignsData]);

  const hasNoCampaigns = useMemo(() => {
    return !campaignsLoading && campaignsList.length === 0;
  }, [campaignsLoading, campaignsList]);

  const showPagination = useMemo(() => {
    return campaignsData && campaignsData.totalPages > 1;
  }, [campaignsData]);

  // Empty State Component
  const EmptyState = () => (
    <Card className="text-center py-12">
      <CardHeader>
        <CardTitle className="flex items-center justify-center gap-2 text-muted-foreground">
          <Inbox className="h-8 w-8" />
          No Campaigns Found
        </CardTitle>
        <CardDescription>
          {filters.isActive !== undefined || filters.type ? 
            'No campaigns match your current filters. Try adjusting your search criteria.' :
            'Get started by creating your first marketing campaign.'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center gap-3">
          <Button asChild>
            <Link href="/dashboard/discounts/campaigns/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Campaign
            </Link>
          </Button>
          {(filters.isActive !== undefined || filters.type) && (
            <Button 
              variant="outline" 
              onClick={() => {
                setFilters({});
                setCurrentPage(1);
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // Error Display Component
  const ErrorDisplay = ({ error, onRetry }: { error: any; onRetry: () => void }) => (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          Failed to Load Data
        </CardTitle>
        <CardDescription>
          {error?.message || 'An unexpected error occurred while loading campaigns.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          <Button onClick={onRetry} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Button asChild variant="secondary" size="sm">
            <Link href="/dashboard/discounts/campaigns/new">
              <Plus className="h-4 w-4 mr-2" />
              Create New Campaign
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const actions = (
    <Button size="sm" asChild>
      <Link href="/dashboard/discounts/campaigns/new">
        <Plus className="mr-2 h-4 w-4" />
        New Campaign
      </Link>
    </Button>
  );

  return (
    <CampaignsPageErrorBoundary>
      <DiscountsDashboardShell
        title="Campaigns"
        description="Manage marketing campaigns and track performance"
        actions={actions}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Discounts', href: '/dashboard/discounts' },
          { label: 'Campaigns' }
        ]}
      >
        {/* Critical Error States */}
        {campaignsError && !campaignsLoading && (
          <div className="mb-6">
            <ErrorDisplay 
              error={campaignsError} 
              onRetry={() => refetchCampaigns()}
            />
          </div>
        )}

        {/* Overview Error State */}
        {overviewError && !overviewLoading && !campaignsError && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Failed to load overview: {overviewError.message}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => refetchOverview()}
                className="ml-4"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Overview Section */}
        {!campaignsError && (
          <>
            {overviewLoading ? (
              <div className="mb-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full" />
                  ))}
                </div>
              </div>
            ) : overviewData ? (
              <div className="mb-6">
                <CampaignsOverview 
                  data={{
                    ...overviewData,
                    topPerformingCampaign: overviewData.topPerformingCampaign || 'No campaigns'
                  }}
                  isLoading={isFetchingOverview}
                />
              </div>
            ) : null}
          </>
        )}

        {/* Main Content Area */}
        {!campaignsError ? (
          <>
            {/* Empty State */}
            {hasNoCampaigns ? (
              <EmptyState />
            ) : (
              <>
                {/* Campaigns Table */}
                <CampaignsTable
                  data={campaignsList}
                  pagination={{
                    pageIndex: currentPage - 1,
                    pageSize: 10,
                    totalCount: campaignsData?.total || 0
                  }}
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  onEdit={handleEdit}
                  onArchive={handleArchive}
                  onViewPerformance={handleViewPerformance}
                  isLoading={campaignsLoading || isFetchingCampaigns}
                />

                {/* Pagination */}
                {showPagination && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, campaignsData?.total || 0)} of {campaignsData?.total || 0} campaigns
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage <= 1}
                      >
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, campaignsData?.totalPages || 0) }, (_, i) => {
                          const pageNum = i + 1;
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage >= (campaignsData?.totalPages || 0)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        ) : null}
      </DiscountsDashboardShell>
    </CampaignsPageErrorBoundary>
  );
}