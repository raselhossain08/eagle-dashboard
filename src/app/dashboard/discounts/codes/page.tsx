// app/dashboard/discounts/codes/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DiscountsDashboardShell } from '@/components/discounts/discounts-dashboard-shell';
import { DiscountCodesTable } from '@/components/discounts/discount-codes-table';
import { Button } from '@/components/ui/button';
import { Plus, Download, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { useDiscounts, useDeactivateDiscount, useExportDiscounts } from '@/hooks/use-discounts';
import { DiscountFilters } from '@/types/discounts';
import { toast } from 'sonner';

export default function DiscountCodesPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<DiscountFilters>({});

  // Fetch discounts data
  const { 
    data: discountsData, 
    isLoading, 
    error,
    refetch 
  } = useDiscounts({
    page: currentPage,
    limit: pageSize,
    ...filters
  });

  // Mutations
  const deactivateDiscount = useDeactivateDiscount();
  const exportDiscounts = useExportDiscounts();

  const handleFiltersChange = (newFilters: DiscountFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleEdit = (discount: any) => {
    router.push(`/dashboard/discounts/codes/${discount.id}`);
  };

  const handleDeactivate = async (discountId: string) => {
    try {
      await deactivateDiscount.mutateAsync(discountId);
      toast.success('Discount deactivated successfully');
      refetch();
    } catch (error: any) {
      toast.error('Failed to deactivate discount');
      console.error('Failed to deactivate discount:', error);
    }
  };

  const handleViewPerformance = (discountId: string) => {
    router.push(`/dashboard/discounts/codes/${discountId}/performance`);
  };

  const handleExport = async () => {
    try {
      const blob = await exportDiscounts.mutateAsync({ 
        format: 'csv',
        filters 
      });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `discounts-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Export completed successfully');
    } catch (error: any) {
      toast.error('Failed to export data');
      console.error('Export failed:', error);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const actions = (
    <div className="flex space-x-2">
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleExport}
        disabled={isLoading}
      >
        <Download className="mr-2 h-4 w-4" />
        Export
      </Button>
      <Button size="sm" asChild>
        <Link href="/dashboard/discounts/codes/new">
          <Plus className="mr-2 h-4 w-4" />
          New Discount
        </Link>
      </Button>
      <Button variant="outline" size="sm" asChild>
        <Link href="/dashboard/discounts/codes/bulk">
          Bulk Generate
        </Link>
      </Button>
    </div>
  );

  return (
    <DiscountsDashboardShell
      title="Discount Codes"
      description="Manage all discount codes and their settings"
      actions={actions}
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Discounts', href: '/dashboard/discounts' },
        { label: 'Codes' }
      ]}
    >
      {/* Error State */}
      {error && (
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load discounts: {error.message}
          </AlertDescription>
        </Alert>
      )}

      <DiscountCodesTable 
        data={discountsData?.data || []}
        pagination={{
          pageIndex: currentPage - 1,
          pageSize,
          totalCount: discountsData?.total || 0
        }}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onEdit={handleEdit}
        onDeactivate={handleDeactivate}
        onViewPerformance={handleViewPerformance}
        isLoading={isLoading}
      />
    </DiscountsDashboardShell>
  );
}