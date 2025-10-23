// app/dashboard/discounts/campaigns/[id]/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { DiscountsDashboardShell } from '@/components/discounts/discounts-dashboard-shell';
import { CampaignPerformanceDashboard } from '@/components/discounts/campaign-performance-dashboard';
import { Button } from '@/components/ui/button';
import { Edit, Archive, Download } from 'lucide-react';
import { useCampaign, useCampaignPerformance, useArchiveCampaign } from '@/hooks/use-campaigns';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function CampaignDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  // Fetch real data
  const { 
    data: campaign, 
    isLoading: campaignLoading, 
    error: campaignError 
  } = useCampaign(campaignId);

  const { 
    data: performanceData, 
    isLoading: performanceLoading, 
    error: performanceError 
  } = useCampaignPerformance(campaignId);

  const archiveCampaign = useArchiveCampaign();

  const handleEdit = () => {
    router.push(`/dashboard/discounts/campaigns/${campaignId}/edit`);
  };

  const handleArchive = async () => {
    try {
      await archiveCampaign.mutateAsync(campaignId);
      toast.success('Campaign archived successfully');
      router.push('/dashboard/discounts/campaigns');
    } catch (error) {
      toast.error('Failed to archive campaign');
      console.error('Archive failed:', error);
    }
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    toast.info('Export functionality coming soon');
  };

  if (campaignLoading || performanceLoading) {
    return (
      <DiscountsDashboardShell
        title="Loading..."
        description="Loading campaign details"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Discounts', href: '/dashboard/discounts' },
          { label: 'Campaigns', href: '/dashboard/discounts/campaigns' },
          { label: 'Campaign Details' }
        ]}
      >
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </DiscountsDashboardShell>
    );
  }

  if (campaignError || performanceError) {
    return (
      <DiscountsDashboardShell
        title="Error"
        description="Failed to load campaign details"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Discounts', href: '/dashboard/discounts' },
          { label: 'Campaigns', href: '/dashboard/discounts/campaigns' },
          { label: 'Error' }
        ]}
      >
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {campaignError ? 
              `Failed to load campaign: ${campaignError.message}` :
              `Failed to load performance data: ${performanceError?.message}`
            }
          </AlertDescription>
        </Alert>
      </DiscountsDashboardShell>
    );
  }

  if (!campaign || !performanceData) {
    return (
      <DiscountsDashboardShell
        title="Not Found"
        description="Campaign not found"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Discounts', href: '/dashboard/discounts' },
          { label: 'Campaigns', href: '/dashboard/discounts/campaigns' },
          { label: 'Not Found' }
        ]}
      >
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Campaign not found or you don't have permission to view it.
          </AlertDescription>
        </Alert>
      </DiscountsDashboardShell>
    );
  }

  const actions = (
    <div className="flex space-x-2">
      <Button variant="outline" size="sm" onClick={handleExport}>
        <Download className="mr-2 h-4 w-4" />
        Export
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleArchive}
        disabled={archiveCampaign.isPending}
      >
        <Archive className="mr-2 h-4 w-4" />
        {archiveCampaign.isPending ? 'Archiving...' : 'Archive'}
      </Button>
      <Button size="sm" onClick={handleEdit}>
        <Edit className="mr-2 h-4 w-4" />
        Edit Campaign
      </Button>
    </div>
  );

  return (
    <DiscountsDashboardShell
      title={campaign.name}
      description={campaign.description}
      actions={actions}
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Discounts', href: '/dashboard/discounts' },
        { label: 'Campaigns', href: '/dashboard/discounts/campaigns' },
        { label: campaign.name }
      ]}
    >
      <CampaignPerformanceDashboard
        campaign={performanceData.campaign}
        metrics={{
          redemptions: performanceData.performance.totalRedemptions,
          revenue: performanceData.performance.totalRevenue,
          roi: performanceData.performance.roi,
          conversionRate: performanceData.performance.conversionRate,
          costPerAcquisition: 0 // TODO: Calculate from budget and conversion data
        }}
        trendsData={performanceData.dailyPerformance}
      />
    </DiscountsDashboardShell>
  );
}