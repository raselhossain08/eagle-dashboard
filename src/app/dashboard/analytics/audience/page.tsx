"use client";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { GeographicMap } from "@/components/analytics/geographic-map";
import { DonutChart } from "@/components/charts/donut-chart";
import { BarChart } from "@/components/charts/bar-chart";
import { useDashboardStore } from "@/store/dashboard-store";

const mockGeographicData = [
  { country: "United States", region: "North America", sessions: 45000, users: 32000 },
  { country: "United Kingdom", region: "Europe", sessions: 28000, users: 21000 },
  { country: "Germany", region: "Europe", sessions: 22000, users: 18000 },
  { country: "Canada", region: "North America", sessions: 18000, users: 15000 },
  { country: "Australia", region: "Oceania", sessions: 12000, users: 9000 },
];

const mockUserTypeData = [
  { name: "New Users", value: 65, color: "#3b82f6" },
  { name: "Returning Users", value: 35, color: "#10b981" },
];

const mockAgeData = [
  { name: "18-24", value: 25 },
  { name: "25-34", value: 35 },
  { name: "35-44", value: 20 },
  { name: "45-54", value: 12 },
  { name: "55+", value: 8 },
];

export default function AudiencePage() {
  const { dateRange } = useDashboardStore();

  return (
    <DashboardShell
      title="Audience Overview"
      description="Understand your users and their behavior"
    >
      <div className="grid gap-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <GeographicMap data={mockGeographicData} />
          <DonutChart
            data={mockUserTypeData}
            title="New vs Returning Users"
            valueFormatter={(value) => `${value}%`}
          />
        </div>
        
        <BarChart
          data={mockAgeData}
          title="Age Distribution"
          valueFormatter={(value) => `${value}%`}
          orientation="horizontal"
        />
      </div>
    </DashboardShell>
  );
}