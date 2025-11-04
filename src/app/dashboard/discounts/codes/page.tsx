// app/dashboard/discounts/codes/page.tsx
'use client';

import { useState, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DiscountsDashboardShell } from '@/components/discounts/discounts-dashboard-shell';
import { EnhancedDiscountCodesTable } from '@/components/discounts/enhanced-discount-codes-table';
import { DiscountCodesErrorBoundary } from '@/components/discounts/discount-codes-error-boundary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Download, Search, Filter, RefreshCw, BarChart3, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';
import { 
  useEnhancedDiscounts, 
  useDiscountAnalytics,
  useBulkDiscountOperations 
} from '@/hooks/use-enhanced-discounts';
import { DiscountFilters, DiscountSortBy } from '@/types/discounts';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Performance optimized components
const DiscountStatsCards = ({ analytics }: { analytics: any }) => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Codes</CardTitle>
        <BarChart3 className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{analytics?.totalCodes || 0}</div>
        <p className="text-xs text-muted-foreground">
          {analytics?.activeCodes || 0} active
        </p>
      </CardContent>
    </Card>
    
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Redemptions</CardTitle>
        <Eye className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{analytics?.totalRedemptions || 0}</div>
        <p className="text-xs text-muted-foreground">
          {analytics?.conversionRate?.toFixed(1) || 0}% conversion rate
        </p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
        <BarChart3 className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          ${analytics?.totalRevenue?.toLocaleString() || 0}
        </div>
        <p className="text-xs text-muted-foreground">
          Revenue generated
        </p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Avg Discount</CardTitle>
        <BarChart3 className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          ${analytics?.averageDiscountValue?.toFixed(2) || 0}
        </div>
        <p className="text-xs text-muted-foreground">
          Per redemption
        </p>
      </CardContent>
    </Card>
  </div>
);

function DiscountCodesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedDiscounts, setSelectedDiscounts] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Enhanced state management with URL synchronization
  const [filters, setFilters] = useState<DiscountFilters>({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || undefined,
    type: searchParams.get('type') || undefined,
    sortBy: (searchParams.get('sortBy') as DiscountSortBy) || 'createdAt',
    sortOrder: searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc'
  });
  
  const [pagination, setPagination] = useState({
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '10')
  });

  // Enhanced hooks with real-time updates and optimistic UI
  const { 
    data: discountsData, 
    isLoading, 
    error,
    refetch,
    isFetching,
    isStale
  } = useEnhancedDiscounts({
    ...pagination,
    ...filters
  });

  const { data: analytics, isLoading: analyticsLoading } = useDiscountAnalytics();
  
  const {
    bulkDeactivate,
    bulkExport
  } = useBulkDiscountOperations();

  // Memoized calculations for performance
  const totalPages = useMemo(() => 
    Math.ceil((discountsData?.total || 0) / pagination.limit), 
    [discountsData?.total, pagination.limit]
  );

  const selectedCount = selectedDiscounts.length;
  const hasSelection = selectedCount > 0;

  // Enhanced filter management with URL synchronization
  const handleFiltersChange = (newFilters: Partial<DiscountFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
    
    // Update URL parameters
    const params = new URLSearchParams();
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value) params.set(key, value.toString());
    });
    params.set('page', '1');
    router.push(`/dashboard/discounts/codes?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    router.push(`/dashboard/discounts/codes?${params.toString()}`);
  };

  // Enhanced bulk operations with optimistic updates
  const handleBulkAction = async (action: string) => {
    if (!hasSelection) return;

    try {
      switch (action) {
        case 'deactivate':
          await bulkDeactivate.mutateAsync(selectedDiscounts);
          break;
        case 'export':
          const blob = await bulkExport.mutateAsync({ 
            discountIds: selectedDiscounts,
            format: 'csv'
          });
          
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `selected-discounts-${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          
          toast.success('Export completed successfully');
          break;
      }
      
      setSelectedDiscounts([]);
    } catch (error: any) {
      toast.error(`Failed to ${action} discount codes: ${error.message}`);
    }
  };

  const handleEdit = (discount: any) => {
    router.push(`/dashboard/discounts/codes/${discount.id}`);
  };

  const handleViewPerformance = (discountId: string) => {
    router.push(`/dashboard/discounts/codes/${discountId}/performance`);
  };

  // Enhanced action bar 
  const actions = (
    <div className="flex items-center space-x-2">
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => handleBulkAction('export')}
        disabled={isLoading || bulkExport.isPending}
      >
        <Download className="mr-2 h-4 w-4" />
        {bulkExport.isPending ? 'Exporting...' : 'Export'}
      </Button>
      
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => refetch()}
        disabled={isFetching}
      >
        <RefreshCw className={cn("mr-2 h-4 w-4", isFetching && "animate-spin")} />
        Refresh
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

  // Enhanced filter controls
  const filterControls = (
    <div className="flex flex-col space-y-4 p-4 border rounded-lg bg-muted/50">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Filters</h3>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>
      
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Search</label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search codes..."
                value={filters.search || ''}
                onChange={(e) => handleFiltersChange({ search: e.target.value })}
                className="pl-8"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select 
              value={filters.status || 'all'} 
              onValueChange={(value) => handleFiltersChange({ status: value === 'all' ? undefined : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Type</label>
            <Select 
              value={filters.type || 'all'} 
              onValueChange={(value) => handleFiltersChange({ type: value === 'all' ? undefined : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                <SelectItem value="free_trial">Free Trial</SelectItem>
                <SelectItem value="first_period">First Period</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Sort By</label>
            <Select 
              value={filters.sortBy || 'createdAt'} 
              onValueChange={(value) => handleFiltersChange({ sortBy: value as DiscountSortBy })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Date Created</SelectItem>
                <SelectItem value="code">Code</SelectItem>
                <SelectItem value="timesRedeemed">Redemptions</SelectItem>
                <SelectItem value="validUntil">Expiry Date</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <DiscountsDashboardShell
      title="Discount Codes"
      description="Manage all discount codes with real-time analytics and bulk operations"
      actions={actions}
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Discounts', href: '/dashboard/discounts' },
        { label: 'Codes' }
      ]}
    >
      {/* Real-time Analytics */}
      {analyticsLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <DiscountStatsCards analytics={analytics} />
      )}

      {/* Enhanced Filters */}
      {filterControls}

      {/* Data staleness indicator */}
      {isStale && (
        <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <span className="text-sm text-yellow-800">Data may be outdated</span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={cn("mr-2 h-4 w-4", isFetching && "animate-spin")} />
            Refresh
          </Button>
        </div>
      )}

      {/* Enhanced Data Table */}
      <EnhancedDiscountCodesTable 
        data={discountsData?.data || []}
        pagination={{
          pageIndex: pagination.page - 1,
          pageSize: pagination.limit,
          totalCount: discountsData?.total || 0,
          totalPages
        }}
        filters={filters}
        selectedRows={selectedDiscounts}
        onSelectionChange={setSelectedDiscounts}
        onFiltersChange={handleFiltersChange}
        onPageChange={handlePageChange}
        onEdit={handleEdit}
        onDeactivate={(discountId: string) => bulkDeactivate.mutateAsync([discountId])}
        onViewPerformance={handleViewPerformance}
        isLoading={isLoading}
        isFetching={isFetching}
        error={error}
      />
    </DiscountsDashboardShell>
  );
}

export default function DiscountCodesPage() {
  return (
    <DiscountCodesErrorBoundary>
      <Suspense fallback={
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
            <p className="text-sm text-muted-foreground">Loading discount codes...</p>
          </div>
        </div>
      }>
        <DiscountCodesPageContent />
      </Suspense>
    </DiscountCodesErrorBoundary>
  );
}