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
  isLoading?: boolean;
}

export function RedemptionsTable({
  data,
  pagination,
  filters,
  onFiltersChange,
  onViewDetails,
  onExport,
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
    // Simple fraud detection logic
    return redemption.discountAmount > 100 || // Large discount
           redemption.orderAmount < redemption.discountAmount; // Discount > order amount
  };

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
            {data.map((redemption) => (
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
                    <div>{redemption.userId}</div>
                    {redemption.ipAddress && (
                      <div className="text-muted-foreground">{redemption.ipAddress}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {formatCurrency(redemption.orderAmount, redemption.currency)}
                </TableCell>
                <TableCell className="text-green-600">
                  -{formatCurrency(redemption.discountAmount, redemption.currency)}
                </TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(redemption.finalAmount, redemption.currency)}
                </TableCell>
                <TableCell>
                  {new Date(redemption.redeemedAt).toLocaleDateString()}
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
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}