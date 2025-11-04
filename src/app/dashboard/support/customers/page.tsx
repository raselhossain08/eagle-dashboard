'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Users, 
  Mail, 
  Phone, 
  MessageSquare, 
  Loader2, 
  AlertCircle, 
  RefreshCw,
  Filter,
  Download,
  UserCheck,
  TrendingUp,
  Star,
  Calendar,
  Building,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useCustomers } from '@/hooks/useCustomers';
import { Customer, customersService } from '@/lib/api/customers';
import { toast } from 'sonner';

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [supportTierFilter, setSupportTierFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [refreshing, setRefreshing] = useState(false);
  const pageSize = 12;

  // Build query parameters
  const queryParams = useMemo(() => {
    const params: any = {
      page: currentPage,
      limit: pageSize,
      sortBy,
      sortOrder,
    };
    
    if (searchQuery && searchQuery.length >= 2) {
      params.search = searchQuery;
    }
    
    if (supportTierFilter !== 'all') {
      params.supportTier = supportTierFilter;
    }
    
    if (statusFilter !== 'all') {
      params.status = statusFilter;
    }
    
    return params;
  }, [currentPage, pageSize, searchQuery, supportTierFilter, statusFilter, sortBy, sortOrder]);

  const { data: customersData, isLoading, error, refetch } = useCustomers(queryParams);

  // Filter customers locally only for short search queries
  const filteredCustomers = useMemo(() => {
    if (!customersData?.customers) return [];
    
    // If search query is short, filter locally to avoid too many API calls
    if (searchQuery.length > 0 && searchQuery.length < 2) {
      return customersData.customers.filter(customer =>
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (customer.company && customer.company.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    return customersData.customers;
  }, [customersData?.customers, searchQuery]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, supportTierFilter, statusFilter, sortBy, sortOrder]);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
      toast.success('Customer data refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh customer data');
    } finally {
      setRefreshing(false);
    }
  };

  // Handle export
  const handleExport = async () => {
    try {
      toast.info('Preparing customer data for export...');
      
      // Fetch all customers for export
      const exportData = await customersService.getCustomers({
        ...queryParams,
        limit: customersData?.total || 1000, // Get all results
        page: 1,
      });

      // Prepare CSV data
      const csvData = exportData.customers.map(customer => ({
        'Customer ID': customer.id,
        'Name': customer.name,
        'Email': customer.email,
        'Phone': customer.phone || '',
        'Company': customer.company || '',
        'Support Tier': customer.supportTier,
        'Status': customer.status,
        'Ticket Count': customer.ticketCount || 0,
        'Satisfaction Score': customer.satisfactionScore || 0,
        'Total Spent': customer.totalSpent || 0,
        'Last Contact': customer.lastContact ? new Date(customer.lastContact).toLocaleDateString() : '',
        'Created Date': new Date(customer.createdAt).toLocaleDateString(),
        'Updated Date': customer.updatedAt ? new Date(customer.updatedAt).toLocaleDateString() : '',
      }));

      // Convert to CSV
      const headers = Object.keys(csvData[0] || {});
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `customers-export-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Exported ${csvData.length} customers successfully`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export customer data');
    }
  };

  const getSupportTierColor = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'premium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200';
      case 'standard':
        return 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200';
      case 'basic':
        return 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200';
      case 'enterprise':
        return 'bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200';
    }
  };

  const getSupportTierIcon = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'premium':
        return <Star className="h-3 w-3" />;
      case 'enterprise':
        return <TrendingUp className="h-3 w-3" />;
      case 'standard':
        return <UserCheck className="h-3 w-3" />;
      case 'basic':
        return <Users className="h-3 w-3" />;
      default:
        return <Users className="h-3 w-3" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'inactive':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'suspended':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
            <p className="text-muted-foreground">
              Manage customer support profiles and interactions
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="text-destructive mb-4">Failed to load customers</p>
            <Button onClick={() => refetch()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">
            Manage customer support profiles and interactions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing || isLoading}
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              ) : (
                customersData?.total?.toLocaleString() || '0'
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              ) : (
                customersData?.activeCount?.toLocaleString() || '0'
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Premium Customers</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              ) : (
                customersData?.premiumCount?.toLocaleString() || '0'
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              ) : (
                customersData?.newThisMonth?.toLocaleString() || '0'
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        
        <Select value={supportTierFilter} onValueChange={setSupportTierFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Support Tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tiers</SelectItem>
            <SelectItem value="basic">Basic</SelectItem>
            <SelectItem value="standard">Standard</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
            <SelectItem value="enterprise">Enterprise</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>

        <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
          const [field, order] = value.split('-');
          setSortBy(field);
          setSortOrder(order as 'asc' | 'desc');
        }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt-desc">Newest First</SelectItem>
            <SelectItem value="createdAt-asc">Oldest First</SelectItem>
            <SelectItem value="name-asc">Name A-Z</SelectItem>
            <SelectItem value="name-desc">Name Z-A</SelectItem>
            <SelectItem value="lastActivity-desc">Recent Activity</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results info */}
      {customersData && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, customersData.total)} of {customersData.total} customers
          </div>
          {isLoading && (
            <div className="flex items-center">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Loading...
            </div>
          )}
        </div>
      )}

      {isLoading && currentPage === 1 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="h-5 w-32 bg-muted rounded" />
                  <div className="h-5 w-16 bg-muted rounded" />
                </div>
                <div className="h-4 w-48 bg-muted rounded" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-16 bg-muted rounded" />
                  <div className="h-4 w-8 bg-muted rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="h-4 w-20 bg-muted rounded" />
                  <div className="h-4 w-12 bg-muted rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="h-4 w-24 bg-muted rounded" />
                  <div className="h-4 w-16 bg-muted rounded" />
                </div>
                <div className="flex space-x-2 pt-2">
                  <div className="h-8 w-20 bg-muted rounded" />
                  <div className="h-8 w-24 bg-muted rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCustomers.map((customer) => (
              <Card key={customer.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-1">
                        {customer.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-1">
                        {customer.email}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getSupportTierColor(customer.supportTier || 'basic')}`}
                      >
                        {getSupportTierIcon(customer.supportTier || 'basic')}
                        <span className="ml-1 capitalize">{customer.supportTier || 'Basic'}</span>
                      </Badge>
                      {customer.status && (
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getStatusColor(customer.status)}`}
                        >
                          {customer.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {customer.company && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building className="h-4 w-4" />
                      <span className="line-clamp-1">{customer.company}</span>
                    </div>
                  )}
                  
                  {customer.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{customer.phone}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="text-center p-2 bg-muted/50 rounded">
                      <div className="font-semibold">{customer.ticketCount || 0}</div>
                      <div className="text-xs text-muted-foreground">Tickets</div>
                    </div>
                    <div className="text-center p-2 bg-muted/50 rounded">
                      <div className="font-semibold">{(customer.satisfactionScore || 4.5).toFixed(1)}</div>
                      <div className="text-xs text-muted-foreground">Rating</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Joined {new Date(customer.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {customer.lastContact && (
                    <div className="text-xs text-muted-foreground">
                      Last contact: {new Date(customer.lastContact).toLocaleDateString()}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button asChild variant="outline" size="sm" className="flex-1">
                      <Link href={`/dashboard/support/customers/${customer.id}`}>
                        <UserCheck className="h-4 w-4 mr-1" />
                        View Details
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`mailto:${customer.email}`}>
                        <Mail className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCustomers.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No customers found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? 'No customers match your search criteria.' : 'No customers available.'}
              </p>
              {searchQuery && (
                <Button 
                  variant="outline" 
                  className="mt-4" 
                  onClick={() => setSearchQuery('')}
                >
                  Clear Search
                </Button>
              )}
            </div>
          )}

          {/* Pagination */}
          {customersData && customersData.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, customersData.totalPages) }, (_, i) => {
                  const page = currentPage <= 3 
                    ? i + 1 
                    : currentPage > customersData.totalPages - 2 
                      ? customersData.totalPages - 4 + i 
                      : currentPage - 2 + i;
                  
                  if (page < 1 || page > customersData.totalPages) return null;
                  
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      disabled={isLoading}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(customersData.totalPages, prev + 1))}
                disabled={currentPage === customersData.totalPages || isLoading}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}