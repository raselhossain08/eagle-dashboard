'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SearchInterface } from '@/components/search/SearchInterface';
import { GlobalSearchCommand } from '@/components/search/GlobalSearchCommand';
import { QuickSearch } from '@/components/search/QuickSearch';
import { AdvancedFilters } from '@/components/search/AdvancedFilters';
import { useSearchAnalytics } from '@/hooks/use-search';
import { Skeleton } from '@/components/ui/skeleton';

export default function SearchDashboard() {
  const [activeTab, setActiveTab] = useState('search');
  const { data: analytics, isLoading } = useSearchAnalytics();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Search Dashboard</h1>
          <p className="text-muted-foreground">
            Enterprise search across all your resources
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:max-w-md">
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="saved">Saved</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Search</CardTitle>
              <CardDescription>
                Search across users, contracts, subscriptions, and invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SearchInterface />
            </CardContent>
          </Card>

          <QuickSearch />
        </TabsContent>

        <TabsContent value="analytics">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-1/4" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : (
            <GlobalSearchCommand />
          )}
        </TabsContent>

        <TabsContent value="history">
          <AdvancedFilters />
        </TabsContent>

        <TabsContent value="saved">
          <QuickSearch />
        </TabsContent>
      </Tabs>
    </div>
  );
}