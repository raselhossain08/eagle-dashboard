// app/dashboard/discounts/redemptions/page.tsx
'use client';

import { useState } from 'react';
import { DiscountsDashboardShell } from '@/components/discounts/discounts-dashboard-shell';
import { RedemptionsTable } from '@/components/discounts/redemptions-table';
import { Button } from '@/components/ui/button';
import { Download, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { useRedemptions, useExportRedemptions } from '@/hooks/use-redemptions';
import { RedemptionFilters } from '@/types/discounts';
import { toast } from 'sonner';

export default function RedemptionsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<RedemptionFilters>({});

  // Fetch redemptions data
  const { 
    data: redemptionsData, 
    isLoading, 
    error,
    refetch 
  } = useRedemptions({
    page: currentPage,
    limit: pageSize,
    ...filters
  });

  // Export mutation
  const exportRedemptions = useExportRedemptions();

  const handleFiltersChange = (newFilters: RedemptionFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleViewDetails = (redemption: any) => {
    // Navigate to redemption details or open modal
    console.log('View details for redemption:', redemption.id);
  };

  const handleExport = async () => {
    try {
      const blob = await exportRedemptions.mutateAsync({
        startDate: filters.dateRange?.from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Default to last 30 days
        endDate: filters.dateRange?.to || new Date(),
        format: 'csv',
        filters
      });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `redemptions-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Export completed successfully');
    } catch (error: any) {
      toast.error('Failed to export redemptions data');
      console.error('Export failed:', error);
    }
  };

  const actions = (
    <div className="flex space-x-2">
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleExport}
        disabled={isLoading || exportRedemptions.isPending}
      >
        <Download className="mr-2 h-4 w-4" />
        {exportRedemptions.isPending ? 'Exporting...' : 'Export'}
      </Button>
      <Button variant="outline" size="sm" asChild>
        <Link href="/dashboard/discounts/redemptions/suspicious">
          <AlertTriangle className="mr-2 h-4 w-4" />
          Fraud Detection
        </Link>
      </Button>
    </div>
  );

  return (
    <DiscountsDashboardShell
      title="Redemptions"
      description="Track all discount code redemptions and monitor for suspicious activity"
      actions={actions}
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Discounts', href: '/dashboard/discounts' },
        { label: 'Redemptions' }
      ]}
    >
      {/* Error State */}
      {error && (
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load redemptions: {error.message}
          </AlertDescription>
        </Alert>
      )}

      <RedemptionsTable
        data={redemptionsData?.redemptions || []}
        pagination={{
          pageIndex: currentPage - 1,
          pageSize,
          totalCount: redemptionsData?.total || 0
        }}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onViewDetails={handleViewDetails}
        onExport={handleExport}
        onPageChange={setCurrentPage}
        isLoading={isLoading}
      />
    </DiscountsDashboardShell>
  );
}