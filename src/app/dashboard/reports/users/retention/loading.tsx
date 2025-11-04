'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function UserRetentionLoading() {
  return (
    <div className="space-y-6">
      {/* Header Loading */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-80 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-4 w-96 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-9 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-9 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-9 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      </div>

      {/* Status Loading */}
      <div className="flex items-center gap-4">
        <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>

      {/* Metrics Cards Loading */}
      <div className="grid gap-6 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cohort Table Loading */}
      <Card>
        <CardHeader className="space-y-2">
          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          ))}
        </CardContent>
      </Card>

      {/* Heatmap Loading */}
      <Card>
        <CardHeader className="space-y-2">
          <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-4 w-56 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="grid grid-cols-8 gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((j) => (
                <div key={j} className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              ))}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Insights Loading */}
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader className="space-y-2">
              <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}