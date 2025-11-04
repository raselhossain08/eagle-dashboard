// components/discounts/redemptions-table.tsx - Enhanced Real-time Redemptions Table
'use client';

import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  MoreHorizontal, 
  Eye, 
  Download, 
  AlertTriangle, 
  Shield, 
  Ban, 
  MapPin, 
  Clock, 
  CreditCard,
  User,
  Globe,
  Smartphone,
  Monitor,
  RefreshCw,
  Filter,
  Search,
  TrendingUp,
  Activity
} from 'lucide-react';
import { EnhancedRedemption, RedemptionsQueryParams } from '@/services/redemptions';
import { useFlagRedemption, useBlockSuspiciousActivity } from '@/hooks/use-redemptions';
import { toast } from 'sonner';

interface EnhancedRedemptionsTableProps {
  data: EnhancedRedemption[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  metadata: {
    totalValue: number;
    totalDiscounts: number;
    avgOrderValue: number;
    suspiciousCount: number;
    topCountries: string[];
    topChannels: string[];
  };
  filters: RedemptionsQueryParams;
  onFiltersChange: (filters: RedemptionsQueryParams) => void;
  onViewDetails: (redemption: EnhancedRedemption) => void;
  onExport: (format?: 'csv' | 'excel' | 'json') => void;
  onPageChange?: (page: number) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  isRealTime?: boolean;
  lastUpdated?: Date;
}

export function RedemptionsTable({
  data,
  total,
  page,
  totalPages,
  hasNext,
  hasPrev,
  metadata,
  filters,
  onFiltersChange,
  onViewDetails,
  onExport,
  onPageChange,
  onRefresh,
  isLoading,
  isRealTime = false,
  lastUpdated
}: EnhancedRedemptionsTableProps) {
  const [search, setSearch] = useState(filters.search || '');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>('all');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [showSuspiciousOnly, setShowSuspiciousOnly] = useState(false);
  
  // Mutations for actions
  const flagRedemptionMutation = useFlagRedemption();
  const blockActivityMutation = useBlockSuspiciousActivity();

  // Enhanced filter handlers
  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    onFiltersChange({ ...filters, search: value, page: 1 });
  }, [filters, onFiltersChange]);

  const handleRiskFilter = useCallback((riskLevel: string) => {
    setSelectedRiskLevel(riskLevel);
    // Apply risk filter logic here
    onFiltersChange({ ...filters, page: 1 });
  }, [filters, onFiltersChange]);

  const handleChannelFilter = useCallback((channel: string) => {
    setSelectedChannel(channel);
    // Apply channel filter logic here  
    onFiltersChange({ ...filters, page: 1 });
  }, [filters, onFiltersChange]);

  const toggleSuspiciousFilter = useCallback(() => {
    setShowSuspiciousOnly(!showSuspiciousOnly);
    // Apply suspicious filter logic here
    onFiltersChange({ ...filters, page: 1 });
  }, [showSuspiciousOnly, filters, onFiltersChange]);

  // Utility functions
  const formatCurrency = useCallback((amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount / 100); // Convert from cents
  }, []);

  const formatDateTime = useCallback((date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  const getRiskBadge = useCallback((redemption: EnhancedRedemption) => {
    if (redemption.isSuspicious) {
      return <Badge variant="destructive" className="flex items-center gap-1">
        <AlertTriangle className="h-3 w-3" />
        Suspicious
      </Badge>;
    }
    
    switch (redemption.riskLevel) {
      case 'high':
        return <Badge variant="destructive">High Risk</Badge>;
      case 'medium':
        return <Badge variant="secondary">Medium Risk</Badge>;
      case 'low':
      default:
        return <Badge variant="outline">Low Risk</Badge>;
    }
  }, []);

  const getFraudScoreColor = useCallback((score?: number) => {
    if (!score) return 'text-green-600';
    if (score >= 80) return 'text-red-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-500';
    return 'text-green-600';
  }, []);

  const getDeviceIcon = useCallback((deviceInfo?: { platform: string; isMobile: boolean }) => {
    if (!deviceInfo) return <Monitor className="h-4 w-4" />;
    return deviceInfo.isMobile ? <Smartphone className="h-4 w-4" /> : <Monitor className="h-4 w-4" />;
  }, []);

  // Action handlers
  const handleFlagRedemption = useCallback(async (redemption: EnhancedRedemption) => {
    try {
      await flagRedemptionMutation.mutateAsync({
        id: redemption.id,
        flagData: {
          reason: 'Manual review requested',
          notes: `Flagged by admin on ${new Date().toISOString()}`
        }
      });
    } catch (error) {
      console.error('Error flagging redemption:', error);
    }
  }, [flagRedemptionMutation]);

  const handleBlockUser = useCallback(async (redemption: EnhancedRedemption) => {
    try {
      await blockActivityMutation.mutateAsync({
        userId: redemption.userId,
        reason: 'Suspicious activity detected'
      });
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  }, [blockActivityMutation]);

  const handleBlockIP = useCallback(async (redemption: EnhancedRedemption) => {
    if (!redemption.ipAddress) {
      toast.error('No IP address available for blocking');
      return;
    }
    
    try {
      await blockActivityMutation.mutateAsync({
        ipAddress: redemption.ipAddress,
        reason: 'Suspicious IP activity detected'
      });
    } catch (error) {
      console.error('Error blocking IP:', error);
    }
  }, [blockActivityMutation]);

  // Computed values
  const filteredData = useMemo(() => {
    let filtered = data;
    
    if (showSuspiciousOnly) {
      filtered = filtered.filter(r => r.isSuspicious);
    }
    
    return filtered;
  }, [data, showSuspiciousOnly]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Redemption Analytics
            {isRealTime && (
              <Badge variant="secondary" className="animate-pulse">Live</Badge>
            )}
          </CardTitle>
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
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Redemption Analytics
              {isRealTime && (
                <Badge variant="secondary" className="animate-pulse">Live</Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {lastUpdated && (
                <span className="text-xs text-muted-foreground">
                  Updated: {formatDateTime(lastUpdated)}
                </span>
              )}
              <Button variant="outline" size="sm" onClick={onRefresh}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </CardTitle>
          
          {/* Enhanced Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="text-sm font-medium">Total Value</div>
              <div className="text-2xl font-bold">{formatCurrency(metadata.totalValue)}</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="text-sm font-medium">Total Discounts</div>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(metadata.totalDiscounts)}</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="text-sm font-medium">Avg Order Value</div>
              <div className="text-2xl font-bold">{formatCurrency(metadata.avgOrderValue)}</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="text-sm font-medium">Suspicious</div>
              <div className="text-2xl font-bold text-red-600">{metadata.suspiciousCount}</div>
            </div>
          </div>

          {/* Enhanced Filters */}
          <div className="flex flex-wrap items-center gap-4 mt-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search redemptions, users, codes..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedRiskLevel} onValueChange={handleRiskFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk</SelectItem>
                <SelectItem value="low">Low Risk</SelectItem>
                <SelectItem value="medium">Medium Risk</SelectItem>
                <SelectItem value="high">High Risk</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedChannel} onValueChange={handleChannelFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Channels</SelectItem>
                {metadata.topChannels.map((channel) => (
                  <SelectItem key={channel} value={channel}>{channel}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              variant={showSuspiciousOnly ? "default" : "outline"}
              size="sm"
              onClick={toggleSuspiciousFilter}
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Suspicious Only
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onExport('csv')}>
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport('excel')}>
                  Export as Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport('json')}>
                  Export as JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code & Risk</TableHead>
                <TableHead>User Details</TableHead>
                <TableHead>Transaction</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Location & Device</TableHead>
                <TableHead>Fraud Score</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="text-muted-foreground">
                      {isLoading ? 'Loading redemptions...' : 'No redemptions found'}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((redemption) => (
                  <TableRow key={redemption.id} className={redemption.isSuspicious ? "bg-red-50 hover:bg-red-100" : ""}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {redemption.isSuspicious && (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="font-mono text-sm">{redemption.code}</span>
                        </div>
                        {getRiskBadge(redemption)}
                        {redemption.fraudFlags && redemption.fraudFlags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {redemption.fraudFlags.slice(0, 2).map((flag) => (
                              <Badge key={flag} variant="outline" className="text-xs">
                                {flag.replace('_', ' ')}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{redemption.user?.name || 'Unknown User'}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">{redemption.user?.email}</div>
                        {redemption.ipAddress && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Globe className="h-3 w-3" />
                            {redemption.ipAddress}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{formatCurrency(redemption.orderAmount, redemption.currency)}</div>
                        <div className="text-sm text-muted-foreground">
                          Final: {formatCurrency(redemption.finalAmount, redemption.currency)}
                        </div>
                        {redemption.order && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <CreditCard className="h-3 w-3" />
                            {redemption.order.paymentMethod}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-green-600 font-medium">
                          -{formatCurrency(redemption.discountAmount, redemption.currency)}
                        </div>
                        {redemption.discount && (
                          <div className="text-xs text-muted-foreground">
                            {redemption.discount.title}
                          </div>
                        )}
                        {redemption.channelSource && (
                          <Badge variant="outline" className="text-xs">
                            {redemption.channelSource}
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        {redemption.location && (
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-3 w-3" />
                            {redemption.location.country}
                          </div>
                        )}
                        {redemption.deviceInfo && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            {getDeviceIcon(redemption.deviceInfo)}
                            {redemption.deviceInfo.platform}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <Tooltip>
                          <TooltipTrigger>
                            <div className={`text-sm font-medium ${getFraudScoreColor(redemption.fraudScore)}`}>
                              {redemption.fraudScore || 0}%
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Fraud Risk Score</p>
                          </TooltipContent>
                        </Tooltip>
                        {redemption.fraudScore && redemption.fraudScore > 60 && (
                          <Badge variant="destructive" className="text-xs">
                            High Risk
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-3 w-3" />
                          {formatDateTime(redemption.redeemedAt)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(redemption.redeemedAt).toLocaleDateString()}
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
                          <DropdownMenuItem onClick={() => onViewDetails(redemption)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          
                          {redemption.isSuspicious && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleFlagRedemption(redemption)}
                                className="text-yellow-600"
                              >
                                <AlertTriangle className="mr-2 h-4 w-4" />
                                Flag for Review
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleBlockUser(redemption)}
                                className="text-red-600"
                              >
                                <Ban className="mr-2 h-4 w-4" />
                                Block User
                              </DropdownMenuItem>
                              {redemption.ipAddress && (
                                <DropdownMenuItem 
                                  onClick={() => handleBlockIP(redemption)}
                                  className="text-red-600"
                                >
                                  <Shield className="mr-2 h-4 w-4" />
                                  Block IP
                                </DropdownMenuItem>
                              )}
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          {/* Enhanced Pagination */}
          {total > 0 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, total)} of {total} redemptions
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange?.(page - 1)}
                  disabled={!hasPrev}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1 px-3">
                  <span className="text-sm">Page {page} of {totalPages}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange?.(page + 1)}
                  disabled={!hasNext}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}