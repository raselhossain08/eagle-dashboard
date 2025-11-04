// components/discounts/enhanced-discount-codes-table.tsx
'use client';

import { useState, useMemo } from 'react';
import { Discount, DiscountFilters, PaginationState } from '@/types/discounts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MoreHorizontal, 
  Edit, 
  Eye, 
  Archive,
  Copy, 
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface EnhancedDiscountCodesTableProps {
  data: Discount[];
  pagination: PaginationState;
  filters: DiscountFilters;
  selectedRows?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  onFiltersChange: (filters: DiscountFilters) => void;
  onPageChange?: (page: number) => void;
  onEdit: (discount: Discount) => void;
  onDeactivate: (discountId: string) => void;
  onViewPerformance: (discountId: string) => void;
  isLoading?: boolean;
  isFetching?: boolean;
  error?: any;
}

export function EnhancedDiscountCodesTable({
  data,
  pagination,
  filters,
  selectedRows = [],
  onSelectionChange,
  onFiltersChange,
  onPageChange,
  onEdit,
  onDeactivate,
  onViewPerformance,
  isLoading = false,
  isFetching = false,
  error
}: EnhancedDiscountCodesTableProps) {
  const [localSearch, setLocalSearch] = useState(filters.search || '');

  // Handle search with debouncing
  const handleSearch = (value: string) => {
    setLocalSearch(value);
    const timeoutId = setTimeout(() => {
      onFiltersChange({ ...filters, search: value });
    }, 300);
    
    return () => clearTimeout(timeoutId);
  };

  // Selection management
  const isAllSelected = data.length > 0 && selectedRows.length === data.length;
  const isPartiallySelected = selectedRows.length > 0 && selectedRows.length < data.length;

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;
    
    if (checked) {
      onSelectionChange(data.map(d => d.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectRow = (discountId: string, checked: boolean) => {
    if (!onSelectionChange) return;
    
    if (checked) {
      onSelectionChange([...selectedRows, discountId]);
    } else {
      onSelectionChange(selectedRows.filter(id => id !== discountId));
    }
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success('Discount code copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy code');
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(pagination.totalCount / pagination.pageSize);
  const currentPage = pagination.pageIndex + 1;
  const startIndex = pagination.pageIndex * pagination.pageSize;
  const endIndex = Math.min(startIndex + pagination.pageSize, pagination.totalCount);

  // Enhanced badge rendering with performance indicators
  const getTypeBadge = (discount: Discount) => {
    const typeMap = {
      percentage: { 
        label: `${discount.value}%`, 
        variant: 'default' as const,
        icon: <TrendingDown className="h-3 w-3" />
      },
      fixed_amount: { 
        label: `$${discount.value}`, 
        variant: 'secondary' as const,
        icon: <DollarSign className="h-3 w-3" />
      },
      free_trial: { 
        label: 'Trial', 
        variant: 'outline' as const,
        icon: <Calendar className="h-3 w-3" />
      },
      first_period: { 
        label: 'First Period', 
        variant: 'destructive' as const,
        icon: <TrendingUp className="h-3 w-3" />
      },
      recurring: { 
        label: 'Recurring', 
        variant: 'default' as const,
        icon: <TrendingUp className="h-3 w-3" />
      }
    };
    
    const config = typeMap[discount.type as keyof typeof typeMap] || { 
      label: discount.type, 
      variant: 'outline' as const,
      icon: null
    };
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const getStatusBadge = (discount: Discount) => {
    const isExpired = discount.validUntil && new Date(discount.validUntil) < new Date();
    const isAtLimit = discount.timesRedeemed >= discount.maxRedemptions;
    
    if (!discount.isActive) {
      return <Badge variant="secondary">Inactive</Badge>;
    } else if (isExpired) {
      return <Badge variant="destructive">Expired</Badge>;
    } else if (isAtLimit) {
      return <Badge variant="outline">Limit Reached</Badge>;
    } else {
      return <Badge variant="default">Active</Badge>;
    }
  };

  const getUsageIndicator = (discount: Discount) => {
    const percentage = (discount.timesRedeemed / discount.maxRedemptions) * 100;
    
    let color = 'bg-green-500';
    if (percentage >= 80) color = 'bg-red-500';
    else if (percentage >= 60) color = 'bg-yellow-500';
    
    return (
      <div className="flex items-center gap-2">
        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={cn("h-full transition-all duration-300", color)}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground">
          {discount.timesRedeemed}/{discount.maxRedemptions}
        </span>
      </div>
    );
  };

  if (error) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load discount codes: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Discount Codes
            {isFetching && (
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            )}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search discount codes..."
                value={localSearch}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
            
            <Select 
              value={filters.status || 'all'} 
              onValueChange={(value) => onFiltersChange({ 
                ...filters, 
                status: value === 'all' ? undefined : value 
              })}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedRows.length > 0 && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="text-sm text-blue-800">
              {selectedRows.length} discount code{selectedRows.length > 1 ? 's' : ''} selected
            </span>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  {onSelectionChange && (
                    <TableHead className="w-12">
                      <Checkbox
                        checked={isAllSelected || isPartiallySelected}
                        onCheckedChange={handleSelectAll}
                        className={cn(isPartiallySelected && "data-[state=checked]:bg-blue-600")}
                      />
                    </TableHead>
                  )}
                  <TableHead>Code</TableHead>
                  <TableHead>Type & Value</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell 
                      colSpan={onSelectionChange ? 8 : 7} 
                      className="text-center py-8 text-muted-foreground"
                    >
                      No discount codes found
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((discount) => (
                    <TableRow 
                      key={discount.id}
                      className={cn(
                        "transition-colors",
                        selectedRows.includes(discount.id) && "bg-blue-50"
                      )}
                    >
                      {onSelectionChange && (
                        <TableCell>
                          <Checkbox
                            checked={selectedRows.includes(discount.id)}
                            onCheckedChange={(checked) => 
                              handleSelectRow(discount.id, checked as boolean)
                            }
                          />
                        </TableCell>
                      )}
                      
                      <TableCell className="font-medium">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm">{discount.code}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => handleCopyCode(discount.code)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                          {discount.description && (
                            <div className="text-xs text-muted-foreground">
                              {discount.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {getTypeBadge(discount)}
                      </TableCell>
                      
                      <TableCell>
                        {getUsageIndicator(discount)}
                      </TableCell>
                      
                      <TableCell>
                        {getStatusBadge(discount)}
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm">
                          {discount.validUntil ? (
                            <div className="space-y-1">
                              <div>{new Date(discount.validUntil).toLocaleDateString()}</div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(discount.validUntil) > new Date() ? (
                                  `${Math.ceil((new Date(discount.validUntil).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left`
                                ) : (
                                  'Expired'
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Never expires</span>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm space-y-1">
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-green-600" />
                            <span className="font-medium">{discount.timesRedeemed}</span>
                            <span className="text-muted-foreground">uses</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {((discount.timesRedeemed / discount.maxRedemptions) * 100).toFixed(1)}% used
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onViewPerformance(discount.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Performance
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit(discount)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCopyCode(discount.code)}>
                              <Copy className="mr-2 h-4 w-4" />
                              Copy Code
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => onDeactivate(discount.id)}
                              className="text-destructive"
                            >
                              <Archive className="mr-2 h-4 w-4" />
                              {discount.isActive ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Enhanced Pagination */}
            {totalPages > 1 && onPageChange && (
              <div className="flex items-center justify-between px-2 py-4">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {endIndex} of {pagination.totalCount} entries
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => onPageChange(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Re-export for compatibility
export { EnhancedDiscountCodesTable as DiscountCodesTable };