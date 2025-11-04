'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Variable } from 'lucide-react';

export default function CreateTemplateSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-md" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-80" />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Editor Section */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-96" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Template Name Field */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-10 w-full" />
              </div>
              
              {/* Subject Field */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              
              {/* Content Editor */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-28" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
                
                {/* Tabs */}
                <div className="space-y-4">
                  <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
                    <Skeleton className="h-8 w-16 rounded-md" />
                    <Skeleton className="h-8 w-16 rounded-md" />
                  </div>
                  
                  {/* Editor Content */}
                  <div className="space-y-2">
                    <Skeleton className="h-96 w-full rounded-lg" />
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-4 w-64" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Variables Card */}
          <Card>
            <CardHeader className="space-y-4">
              <div className="flex items-center gap-2">
                <Variable className="h-4 w-4" />
                <Skeleton className="h-5 w-20" />
              </div>
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Available Variables */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <div className="space-y-1">
                  {Array.from({ length: 6 }, (_, i) => (
                    <div key={i} className="flex items-center justify-between p-2 border rounded-lg">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-3" />
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Custom Variables */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <div className="flex gap-2">
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="h-9 w-9" />
                </div>
              </div>

              <Separator />

              {/* Selected Variables */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <div className="space-y-1">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card>
            <CardContent className="pt-6 space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function CreateTemplateLoadingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="container mx-auto max-w-7xl">
        <CreateTemplateSkeleton />
      </div>
    </div>
  );
}