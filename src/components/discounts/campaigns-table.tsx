// components/discounts/campaigns-table.tsx
'use client';

import React, { useState } from 'react';
import { Campaign, CampaignFilters, PaginationState } from '@/types/discounts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Eye, Archive, Calendar } from 'lucide-react';

interface CampaignsTableProps {
  data: Campaign[];
  pagination: PaginationState;
  filters: CampaignFilters;
  onFiltersChange: (filters: CampaignFilters) => void;
  onEdit: (campaign: Campaign) => void;
  onArchive: (campaignId: string) => void;
  onViewPerformance: (campaignId: string) => void;
  isLoading?: boolean;
}

export function CampaignsTable({
  data,
  pagination,
  filters,
  onFiltersChange,
  onEdit,
  onArchive,
  onViewPerformance,
  isLoading
}: CampaignsTableProps) {
  const [search, setSearch] = useState('');

  const handleSearch = (value: string) => {
    setSearch(value);
    onFiltersChange({ ...filters, search: value });
  };

  const getStatusBadge = (campaign: Campaign) => {
    const now = new Date();
    const isActive = campaign.isActive && 
      campaign.startDate <= now && 
      (!campaign.endDate || campaign.endDate >= now);

    if (!campaign.isActive) {
      return <Badge variant="secondary">Archived</Badge>;
    }
    
    if (campaign.startDate > now) {
      return <Badge variant="outline">Scheduled</Badge>;
    }
    
    if (campaign.endDate && campaign.endDate < now) {
      return <Badge variant="outline">Ended</Badge>;
    }
    
    return <Badge variant="default">Active</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const typeMap = {
      promotional: { label: 'Promotional', variant: 'default' as const },
      affiliate: { label: 'Affiliate', variant: 'secondary' as const },
      referral: { label: 'Referral', variant: 'outline' as const },
      loyalty: { label: 'Loyalty', variant: 'default' as const },
      winback: { label: 'Winback', variant: 'destructive' as const }
    };
    
    const { label, variant } = typeMap[type as keyof typeof typeMap] || { label: type, variant: 'outline' as const };
    return <Badge variant={variant}>{label}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Marketing Campaigns</CardTitle>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search campaigns..."
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
              <TableHead>Campaign</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead>Redemptions</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((campaign) => (
              <TableRow key={campaign.id}>
                <TableCell className="font-medium">
                  <div>
                    <div>{campaign.name}</div>
                    {campaign.description && (
                      <div className="text-sm text-muted-foreground">
                        {campaign.description}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{getTypeBadge(campaign.type)}</TableCell>
                <TableCell>{getStatusBadge(campaign)}</TableCell>
                <TableCell>
                  {campaign.budget ? formatCurrency(campaign.budget) : 'No budget'}
                </TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(campaign.totalRevenue)}
                </TableCell>
                <TableCell>
                  {campaign.totalRedemptions}
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{new Date(campaign.startDate).toLocaleDateString()}</div>
                    {campaign.endDate && (
                      <div className="text-muted-foreground">
                        to {new Date(campaign.endDate).toLocaleDateString()}
                      </div>
                    )}
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
                      <DropdownMenuItem onClick={() => onViewPerformance(campaign.id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Performance
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(campaign)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Calendar className="mr-2 h-4 w-4" />
                        Schedule
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onArchive(campaign.id)}
                        className="text-destructive"
                      >
                        <Archive className="mr-2 h-4 w-4" />
                        {campaign.isActive ? 'Archive' : 'Activate'}
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