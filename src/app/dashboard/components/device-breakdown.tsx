'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDeviceBreakdown } from "@/hooks/use-analytics-optimized";
import type { DateRange } from "@/store/dashboard-store";

interface DeviceBreakdownProps {
  dateRange: DateRange;
}

export default function DeviceBreakdown({ dateRange }: DeviceBreakdownProps) {
  const { data: deviceData, isLoading } = useDeviceBreakdown(dateRange);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Device Types</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-4 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {deviceData?.map((device, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span>{device.device}</span>
                <span className="text-muted-foreground">
                  {device.sessions.toLocaleString()} sessions
                </span>
              </div>
            ))}
            {(!deviceData || deviceData.length === 0) && (
              <div className="text-sm text-muted-foreground">No data available</div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}