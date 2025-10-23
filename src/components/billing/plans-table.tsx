// components/billing/plans-table.tsx
'use client';

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { Plan, PaginationState } from '@/types/billing';
import { formatCurrency } from '@/lib/utils';

interface PlansTableProps {
  data: Plan[];
  pagination: PaginationState;
  filters?: any;
  onFiltersChange?: (filters: any) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onEdit: (plan: Plan) => void;
  onDelete: (planId: string) => void;
  onToggleStatus: (planId: string, isActive: boolean) => void;
  onToggleVisibility: (planId: string, isVisible: boolean) => void;
  isLoading?: boolean;
}

export function PlansTable({ 
  data, 
  pagination, 
  filters,
  onFiltersChange,
  onPageChange,
  onPageSizeChange,
  onEdit, 
  onDelete, 
  onToggleStatus, 
  onToggleVisibility,
  isLoading 
}: PlansTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 bg-muted rounded animate-pulse" />
        ))}
      </div>
    );
  }

  const getIntervalText = (plan: Plan) => {
    if (!plan.interval) return 'Unknown';
    if (plan.interval === 'one_time') return 'One Time';
    if ((plan.intervalCount || 1) === 1) return `Per ${plan.interval}`;
    return `Every ${plan.intervalCount || 1} ${plan.interval}s`;
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Plan Name</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Interval</TableHead>
            <TableHead>Features</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Visibility</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data && data.length > 0 ? data.map((plan) => (
            <TableRow key={plan.id}>
              <TableCell className="font-medium">
                <div>
                  <div>{plan.name || 'Unnamed Plan'}</div>
                  {plan.description && (
                    <div className="text-sm text-muted-foreground">
                      {plan.description}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="font-medium">
                  {formatCurrency(plan.price || 0, plan.currency || 'USD')}
                </div>
                {(plan.pricePerSeat || 0) > 0 && (
                  <div className="text-sm text-muted-foreground">
                    +{formatCurrency(plan.pricePerSeat, plan.currency || 'USD')}/seat
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div>{getIntervalText(plan)}</div>
                {(plan.trialPeriodDays || 0) > 0 && (
                  <div className="text-sm text-muted-foreground">
                    {plan.trialPeriodDays} day trial
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div className="max-w-xs">
                  <div className="text-sm line-clamp-2">
                    {plan.features && plan.features.length > 0 ? (
                      <>
                        {plan.features.slice(0, 2).join(', ')}
                        {plan.features.length > 2 && (
                          <span className="text-muted-foreground">
                            ... +{plan.features.length - 2} more
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-muted-foreground">No features listed</span>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={plan.isActive || false}
                    onCheckedChange={(checked) => onToggleStatus(plan.id, checked)}
                  />
                  <Badge variant={plan.isActive ? "default" : "secondary"}>
                    {plan.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={plan.isVisible || false}
                    onCheckedChange={(checked) => onToggleVisibility(plan.id, checked)}
                  />
                  {plan.isVisible ? (
                    <Eye className="h-4 w-4 text-green-600" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(plan)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(plan.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No plans available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {(!data || data.length === 0) && !isLoading && (
        <div className="text-center py-8 text-muted-foreground">
          No plans found. Create your first billing plan to get started.
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.total > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <div className="text-sm text-muted-foreground">
            Showing {data?.length || 0} of {pagination.total} plans
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-2 py-1 text-sm border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm">
              Page {pagination.page} of {pagination.totalPages || Math.ceil(pagination.total / pagination.pageSize)}
            </span>
            <button
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={pagination.page >= (pagination.totalPages || Math.ceil(pagination.total / pagination.pageSize))}
              className="px-2 py-1 text-sm border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}