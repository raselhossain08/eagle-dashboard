// components/discounts/redemptions-table.tsx
'use client';

import { useState } from 'react';
import { Redemption, RedemptionFilters, PaginationState } from '@/types/discounts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Eye, Download, AlertTriangle } from 'lucide-react';

interface RedemptionsTableProps {
  data: Redemption[];
  pagination: PaginationState;
  filters: RedemptionFilters;
  onFiltersChange: (filters: RedemptionFilters) => void;
  onViewDetails: (redemption: Redemption) => void;
  onExport: (filters: RedemptionFilters) => void;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
}

export function RedemptionsTable({
  data,
  pagination,
  filters,
  onFiltersChange,
  onViewDetails,
  onExport,
  onPageChange,
  isLoading
}: RedemptionsTableProps) {
  const [search, setSearch] = useState('');

  const handleSearch = (value: string) => {
    setSearch(value);
    onFiltersChange({ ...filters, search: value });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const isSuspicious = (redemption: Redemption) => {
    // Check if redemption is marked as suspicious in the backend
    return (redemption as any).isSuspicious || 
           (redemption as any).fraudScore > 70 ||
           redemption.discountAmount > 10000 || // Large discount (>$100)
           redemption.orderAmount < redemption.discountAmount; // Discount > order amount
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Redemption History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-4 w-4 rounded-full bg-gray-200 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Redemption History</CardTitle>
        <div className="flex items-center justify-between">
          <Input
            placeholder="Search redemptions..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="max-w-sm"
          />
          <Button variant="outline" size="sm" onClick={() => onExport(filters)}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Final</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="text-muted-foreground">
                    {isLoading ? 'Loading redemptions...' : 'No redemptions found'}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((redemption) => (
                <TableRow key={redemption.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      {isSuspicious(redemption) && (
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      )}
                      <span>{redemption.code}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{(redemption as any).userId?.email || redemption.userId}</div>
                      {redemption.ipAddress && (
                        <div className="text-muted-foreground text-xs">{redemption.ipAddress}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {formatCurrency(redemption.orderAmount / 100, redemption.currency)}
                  </TableCell>
                  <TableCell className="text-green-600">
                    -{formatCurrency(redemption.discountAmount / 100, redemption.currency)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(redemption.finalAmount / 100, redemption.currency)}
                  </TableCell>
                  <TableCell>
                    {new Date(redemption.redeemedAt || redemption.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {isSuspicious(redemption) ? (
                      <Badge variant="destructive">Suspicious</Badge>
                    ) : (
                      <Badge variant="outline">Normal</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onViewDetails(redemption)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {isSuspicious(redemption) && (
                          <DropdownMenuItem className="text-destructive">
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            Flag for Review
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        
        {/* Pagination */}
        {pagination.totalCount > 0 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {(pagination.pageIndex * pagination.pageSize) + 1} to {Math.min((pagination.pageIndex + 1) * pagination.pageSize, pagination.totalCount)} of {pagination.totalCount} redemptions
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(pagination.pageIndex)}
                disabled={pagination.pageIndex <= 0}
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                Page {pagination.pageIndex + 1} of {Math.ceil(pagination.totalCount / pagination.pageSize)}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(pagination.pageIndex + 2)}
                disabled={(pagination.pageIndex + 1) >= Math.ceil(pagination.totalCount / pagination.pageSize)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}