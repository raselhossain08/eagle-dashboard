// app/dashboard/support/customers/page.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Users, Mail, Phone, MessageSquare, Loader2, AlertCircle } from 'lucide-react';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useCustomers } from '@/hooks/useCustomers';
import { Customer } from '@/lib/api/customers';

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const { data: customersData, isLoading, error, refetch } = useCustomers({
    page: currentPage,
    limit: pageSize,
    search: searchQuery || undefined,
  });

  // Filter customers locally if search is less than 2 characters (to avoid API calls)
  const filteredCustomers = useMemo(() => {
    if (!customersData?.customers) return [];
    
    if (searchQuery.length < 2) {
      return customersData.customers;
    }
    
    return customersData.customers.filter(customer =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (customer.company && customer.company.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [customersData?.customers, searchQuery]);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'enterprise': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'premium': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">
            Manage customer support profiles and interactions
          </p>
        </div>
        {customersData && (
          <div className="text-sm text-muted-foreground">
            {customersData.total} total customers
          </div>
        )}
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        {isLoading && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Loading...
          </div>
        )}
      </div>

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
              <Card key={customer.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{customer.name}</CardTitle>
                    <Badge className={getTierColor(customer.supportTier)}>
                      {customer.supportTier}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center space-x-1">
                    <Mail className="w-3 h-3" />
                    <span>{customer.email}</span>
                  </CardDescription>
                  {customer.company && (
                    <CardDescription className="flex items-center space-x-1">
                      <Users className="w-3 h-3" />
                      <span>{customer.company}</span>
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Tickets</span>
                    <span className="font-medium">{customer.ticketCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Satisfaction</span>
                    <span className="font-medium">{customer.satisfactionScore.toFixed(1)}/5</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Last Contact</span>
                    <span className="font-medium">
                      {customer.lastContact 
                        ? new Date(customer.lastContact).toLocaleDateString()
                        : 'Never'
                      }
                    </span>
                  </div>
                  {customer.totalSpent && customer.totalSpent > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total Spent</span>
                      <span className="font-medium">${customer.totalSpent.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex space-x-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link href={`/dashboard/support/customers/${customer.id}/notes`}>
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Contact
                      </Link>
                    </Button>
                    <Button size="sm" className="flex-1" asChild>
                      <Link href={`/dashboard/support/customers/${customer.id}`}>
                        View Profile
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
            <div className="flex items-center justify-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || isLoading}
              >
                Previous
              </Button>
              
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {customersData.totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(customersData.totalPages, prev + 1))}
                disabled={currentPage === customersData.totalPages || isLoading}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}