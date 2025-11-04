'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Edit, Variable } from 'lucide-react';

export default function EditTemplateSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-md" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-96" />
        </div>
      </div>

      {/* Template Loading Alert */}
      <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/20">
        <Skeleton className="h-4 w-4 rounded" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Editor Section */}
        <div className="lg:col-span-3 space-y-6">
          {/* Template Status Card */}
          <Card>
            <CardHeader className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-80" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Information Fields */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
              
              {/* Subject Field */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-3 w-20" />
              </div>
              
              {/* Content Editor */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                </div>
                
                {/* Tabs */}
                <div className="space-y-4">
                  <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
                    <Skeleton className="h-8 w-20 rounded-md" />
                    <Skeleton className="h-8 w-20 rounded-md" />
                    <Skeleton className="h-8 w-16 rounded-md" />
                  </div>
                  
                  {/* Editor Content */}
                  <div className="space-y-2">
                    <Skeleton className="h-96 w-full rounded-lg" />
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-6 w-32 rounded-full" />
                      </div>
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-64" />
                </div>
                <Skeleton className="h-10 w-24" />
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
                <Skeleton className="h-5 w-24" />
              </div>
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Available Variables */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <div className="space-y-1 max-h-60 overflow-hidden">
                  {Array.from({ length: 8 }, (_, i) => (
                    <div key={i} className="flex items-center justify-between p-2 border rounded-lg">
                      <Skeleton className="h-3 w-28" />
                      <Skeleton className="h-3 w-3" />
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Custom Variables */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <div className="flex gap-2">
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="h-9 w-9" />
                </div>
                <Skeleton className="h-3 w-40" />
              </div>

              <Separator />

              {/* Detected Variables */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <div className="space-y-1">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-28" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />

              {/* Template Info */}
              <div className="pt-4 border-t space-y-2">
                {Array.from({ length: 4 }, (_, i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function EditTemplateLoadingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="container mx-auto max-w-7xl">
        <EditTemplateSkeleton />
      </div>
    </div>
  );
}