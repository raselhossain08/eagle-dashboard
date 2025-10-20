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
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEdit: (plan: Plan) => void;
  onDelete: (planId: string) => void;
  onToggleStatus: (planId: string, isActive: boolean) => void;
  onToggleVisibility: (planId: string, isVisible: boolean) => void;
  isLoading?: boolean;
}

export function PlansTable({ 
  data, 
  pagination, 
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
    if (plan.interval === 'one_time') return 'One Time';
    if (plan.intervalCount === 1) return `Per ${plan.interval}`;
    return `Every ${plan.intervalCount} ${plan.interval}s`;
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
          {data.map((plan) => (
            <TableRow key={plan.id}>
              <TableCell className="font-medium">
                <div>
                  <div>{plan.name}</div>
                  {plan.description && (
                    <div className="text-sm text-muted-foreground">
                      {plan.description}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="font-medium">
                  {formatCurrency(plan.price, plan.currency)}
                </div>
                {plan.pricePerSeat > 0 && (
                  <div className="text-sm text-muted-foreground">
                    +{formatCurrency(plan.pricePerSeat, plan.currency)}/seat
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div>{getIntervalText(plan)}</div>
                {plan.trialPeriodDays > 0 && (
                  <div className="text-sm text-muted-foreground">
                    {plan.trialPeriodDays} day trial
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div className="max-w-xs">
                  <div className="text-sm line-clamp-2">
                    {plan.features.slice(0, 2).join(', ')}
                    {plan.features.length > 2 && (
                      <span className="text-muted-foreground">
                        ... +{plan.features.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={plan.isActive}
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
                    checked={plan.isVisible}
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
          ))}
        </TableBody>
      </Table>

      {data.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No plans found. Create your first billing plan to get started.
        </div>
      )}

      {/* Pagination would go here */}
    </div>
  );
}