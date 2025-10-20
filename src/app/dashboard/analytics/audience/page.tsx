"use client";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { GeographicMap } from "@/components/analytics/geographic-map";
import { DonutChart } from "@/components/charts/donut-chart";
import { BarChart } from "@/components/charts/bar-chart";
import { useDashboardStore } from "@/store/dashboard-store";
import { useAudienceOverview } from "@/hooks/use-audience-analytics";

export default function AudiencePage() {
  const { dateRange } = useDashboardStore();

  // Fetch real backend data
  const { geographic, userTypes, age, isLoading, error } = useAudienceOverview({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate
  });

  if (error) {
    console.error('❌ Error loading audience data:', error);
  }

  return (
    <DashboardShell
      title="Audience Overview"
      description="Understand your users and their behavior"
    >
      <div className="grid gap-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <GeographicMap 
            data={geographic.data || []} 
            isLoading={geographic.isLoading}
          />
          <DonutChart
            data={userTypes.data || []}
            title="New vs Returning Users"
            valueFormatter={(value) => `${value}%`}
            isLoading={userTypes.isLoading}
          />
        </div>
        
        <BarChart
          data={age.data || []}
          title="Age Distribution"
          valueFormatter={(value) => value.toString()}
          orientation="horizontal"
          isLoading={age.isLoading}
        />
      </div>
    </DashboardShell>
  );
}