// app/dashboard/discounts/campaigns/page.tsx
'use client';

import { useState } from 'react';
import { DiscountsDashboardShell } from '@/components/discounts/discounts-dashboard-shell';
import { CampaignsOverview } from '@/components/discounts/campaigns-overview';
import { CampaignsTable } from '@/components/discounts/campaigns-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useCampaigns, useCampaignsOverview, useArchiveCampaign } from '@/hooks/use-campaigns';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Campaign } from '@/types/discounts';

export default function CampaignsPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<{
    isActive?: boolean;
    type?: string;
  }>({});

  // Fetch real data
  const { 
    data: campaignsData, 
    isLoading: campaignsLoading, 
    error: campaignsError 
  } = useCampaigns({
    page: currentPage,
    limit: 10,
    ...filters
  });

  const { 
    data: overviewData, 
    isLoading: overviewLoading, 
    error: overviewError 
  } = useCampaignsOverview();

  const archiveCampaign = useArchiveCampaign();

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleEdit = (campaign: Campaign) => {
    router.push(`/dashboard/discounts/campaigns/${campaign.id}/edit`);
  };

  const handleArchive = async (campaignId: string) => {
    try {
      await archiveCampaign.mutateAsync(campaignId);
      toast.success('Campaign archived successfully');
    } catch (error) {
      toast.error('Failed to archive campaign');
      console.error('Archive failed:', error);
    }
  };

  const handleViewPerformance = (campaignId: string) => {
    router.push(`/dashboard/discounts/campaigns/${campaignId}`);
  };

  const actions = (
    <Button size="sm" asChild>
      <Link href="/dashboard/discounts/campaigns/new">
        <Plus className="mr-2 h-4 w-4" />
        New Campaign
      </Link>
    </Button>
  );

  return (
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
      {/* Error States */}
      {(campaignsError || overviewError) && (
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {campaignsError ? 
              `Failed to load campaigns: ${campaignsError.message}` :
              `Failed to load overview: ${overviewError?.message}`
            }
          </AlertDescription>
        </Alert>
      )}

      {/* Overview Section */}
      {overviewLoading ? (
        <div className="mb-6">
          <Skeleton className="h-32 w-full" />
        </div>
      ) : overviewData ? (
        <CampaignsOverview data={overviewData} />
      ) : null}

      {/* Campaigns Table */}
      <CampaignsTable
        data={campaignsData?.campaigns || []}
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
        isLoading={campaignsLoading}
      />

      {/* Pagination */}
      {campaignsData && campaignsData.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, campaignsData.total)} of {campaignsData.total} campaigns
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
              {Array.from({ length: Math.min(5, campaignsData.totalPages) }, (_, i) => {
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
              disabled={currentPage >= campaignsData.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </DiscountsDashboardShell>
  );
}