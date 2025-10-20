"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { GeographicData } from "@/lib/api/analytics.service";

interface GeographicMapProps {
  data: GeographicData[];
  isLoading?: boolean;
}

export function GeographicMap({ data, isLoading = false }: GeographicMapProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Geographic Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="w-full h-64" />
        </CardContent>
      </Card>
    );
  }

  // Simple table visualization - in real app you'd use a map library like react-simple-maps
  const topCountries = data
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Geographic Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4 font-medium text-sm">
            <div>Country</div>
            <div className="text-right">Sessions</div>
            <div className="text-right">Users</div>
            <div className="text-right">Share</div>
          </div>
          {topCountries.map((item, index) => {
            const totalSessions = data.reduce((sum, d) => sum + d.sessions, 0);
            const share = (item.sessions / totalSessions) * 100;
            
            return (
              <div key={item.country} className="grid grid-cols-4 gap-4 items-center">
                <div className="flex items-center">
                  <span className="w-6 h-6 flex items-center justify-center bg-primary text-primary-foreground rounded text-xs mr-2">
                    {index + 1}
                  </span>
                  {item.country}
                </div>
                <div className="text-right">{item.sessions.toLocaleString()}</div>
                <div className="text-right">{item.users.toLocaleString()}</div>
                <div className="text-right text-muted-foreground">
                  {share.toFixed(1)}%
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}