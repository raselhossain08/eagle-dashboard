'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function UserReportsLoading() {
  return (
    <div className="space-y-6">
      {/* Header Loading */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-4 w-96 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-9 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-9 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      </div>

      {/* Status Loading */}
      <div className="flex items-center gap-4">
        <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>

      {/* Tabs Loading */}
      <div className="space-y-6">
        <div className="flex gap-2">
          <div className="h-9 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-9 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-9 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>

        {/* Metrics Cards Loading */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Loading */}
        <Card>
          <CardHeader className="space-y-2">
            <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}