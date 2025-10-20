// components/discounts/discount-codes-table.tsx
'use client';

import { useState } from 'react';
import { Discount, DiscountFilters, PaginationState } from '@/types/discounts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Eye, Archive, Copy } from 'lucide-react';

interface DiscountCodesTableProps {
  data: Discount[];
  pagination: PaginationState;
  filters: DiscountFilters;
  onFiltersChange: (filters: DiscountFilters) => void;
  onEdit: (discount: Discount) => void;
  onDeactivate: (discountId: string) => void;
  onViewPerformance: (discountId: string) => void;
  isLoading?: boolean;
}

export function DiscountCodesTable({
  data,
  pagination,
  filters,
  onFiltersChange,
  onEdit,
  onDeactivate,
  onViewPerformance,
  isLoading
}: DiscountCodesTableProps) {
  const [search, setSearch] = useState('');

  const handleSearch = (value: string) => {
    setSearch(value);
    onFiltersChange({ ...filters, search: value });
  };

  const getTypeBadge = (type: string) => {
    const typeMap = {
      percentage: { label: '%', variant: 'default' as const },
      fixed_amount: { label: 'Fixed', variant: 'secondary' as const },
      free_trial: { label: 'Trial', variant: 'outline' as const },
      first_period: { label: 'First Period', variant: 'destructive' as const },
      recurring: { label: 'Recurring', variant: 'default' as const }
    };
    
    const { label, variant } = typeMap[type as keyof typeof typeMap] || { label: type, variant: 'outline' as const };
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getStatusBadge = (isActive: boolean) => (
    <Badge variant={isActive ? 'default' : 'secondary'}>
      {isActive ? 'Active' : 'Inactive'}
    </Badge>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Discount Codes</CardTitle>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search discount codes..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Redemptions</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Valid Until</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((discount) => (
              <TableRow key={discount.id}>
                <TableCell className="font-medium">
                  <div>
                    <div>{discount.code}</div>
                    {discount.description && (
                      <div className="text-sm text-muted-foreground">
                        {discount.description}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{getTypeBadge(discount.type)}</TableCell>
                <TableCell>
                  {discount.type === 'percentage' 
                    ? `${discount.value}%`
                    : `$${discount.value}`
                  }
                </TableCell>
                <TableCell>
                  {discount.timesRedeemed} / {discount.maxRedemptions}
                </TableCell>
                <TableCell>{getStatusBadge(discount.isActive)}</TableCell>
                <TableCell>
                  {discount.validUntil 
                    ? new Date(discount.validUntil).toLocaleDateString()
                    : 'Never'
                  }
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
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigator.clipboard.writeText(discount.code)}>
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
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}